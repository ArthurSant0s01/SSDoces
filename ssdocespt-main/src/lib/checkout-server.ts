import { createServerFn } from '@tanstack/react-start';
import { Resend } from 'resend';
import { sendWhatsAppNotification } from './twilio';

import { supabaseEnvironmentStatus } from '@/lib/env';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getPaymentInstructions, getPaymentMethodLabel, orderFormSchema, serializeOrderMetadata } from '@/lib/order-schema';

type OrderItemsInsertRow = {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

function formatSupabaseError(error: SupabaseLikeError | null | undefined) {
  if (!error) {
    return null;
  }

  return {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  };
}

async function resolveProductIdsForCheckout(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  items: ReturnType<typeof orderFormSchema.parse>['items']
) {
  const uniqueRefs = Array.from(new Set(items.map((item) => item.productId.trim()).filter(Boolean)));
  const refsThatAreUuid = uniqueRefs.filter((ref) => isUuid(ref));
  const refsThatAreSlug = uniqueRefs.filter((ref) => !isUuid(ref));

  const idMap = new Map<string, string>();
  const slugMap = new Map<string, string>();

  if (refsThatAreUuid.length > 0) {
    const { data, error } = await supabase.from('products').select('id').in('id', refsThatAreUuid);
    if (error) {
      throw new Error(`Falha ao validar produtos por ID: ${error.message}`);
    }

    for (const row of data ?? []) {
      idMap.set(row.id, row.id);
    }
  }

  if (refsThatAreSlug.length > 0) {
    const { data, error } = await supabase.from('products').select('id, slug').in('slug', refsThatAreSlug);
    if (error) {
      throw new Error(`Falha ao resolver produtos por slug: ${error.message}`);
    }

    for (const row of data ?? []) {
      slugMap.set(row.slug, row.id);
    }
  }

  const unresolvedRefs = uniqueRefs.filter((ref) => !idMap.has(ref) && !slugMap.has(ref));

  return {
    idMap,
    slugMap,
    unresolvedRefs,
  };
}

async function deleteCreatedOrder(supabase: ReturnType<typeof createServerSupabaseClient>, orderId: string) {
  await supabase.from('orders').delete().eq('id', orderId);
}

function normalizePaymentMethod(method: ReturnType<typeof orderFormSchema.parse>['paymentMethod']) {
  switch (method) {
    case 'cash_on_pickup':
      return 'cash';
    default:
      return 'bank_transfer';
  }
}

function buildOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SSD-${stamp}-${random}`;
}

function buildOrderEmailHtml(orderNumber: string, data: ReturnType<typeof orderFormSchema.parse>) {
  const itemsHtml = data.items
    .map(
      (item) => `
        <li style="margin-bottom:8px;">
          <strong>${item.quantity}x ${item.name}</strong> - €${item.unitPrice.toFixed(2)}
          ${item.note ? `<br /><span style="color:#6b7280;">Nota: ${item.note}</span>` : ''}
        </li>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
      <h2>Nova encomenda SSDoces</h2>
      <p><strong>Número:</strong> ${orderNumber}</p>
      <p><strong>Cliente:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>WhatsApp:</strong> ${data.customerPhone}</p>
      <p><strong>Recolha:</strong> ${data.pickupDate} às ${data.pickupTime}</p>
      <p><strong>Pagamento:</strong> ${getPaymentMethodLabel(data.paymentMethod)}</p>
      <p><strong>Instruções:</strong> ${getPaymentInstructions(data.paymentMethod)}</p>
      <p><strong>Total:</strong> €${data.total.toFixed(2)}</p>
      <h3>Produtos</h3>
      <ul>${itemsHtml}</ul>
      ${data.notes ? `<p><strong>Observações:</strong> ${data.notes}</p>` : ''}
    </div>
  `;
}

async function sendOrderEmails(orderNumber: string, data: ReturnType<typeof orderFormSchema.parse>) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return;
  }

  const resend = new Resend(resendApiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const adminEmail = process.env.SSDOCES_ADMIN_EMAIL || 'sosdoces.pt@gmail.com';
  const html = buildOrderEmailHtml(orderNumber, data);

  await Promise.allSettled([
    resend.emails.send({
      from,
      to: adminEmail,
      subject: `Nova encomenda SSDoces ${orderNumber}`,
      html,
    }),
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Recebemos a sua encomenda SSDoces ${orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
          <h2>Obrigado pela sua encomenda, ${data.customerName}.</h2>
          <p>Recebemos o pedido <strong>${orderNumber}</strong> e vamos confirmar a recolha em Guimarães por mensagem.</p>
          <p><strong>Recolha:</strong> ${data.pickupDate} às ${data.pickupTime}</p>
          <p><strong>Pagamento:</strong> ${getPaymentMethodLabel(data.paymentMethod)}</p>
          <p>${getPaymentInstructions(data.paymentMethod)}</p>
          <p><strong>Total:</strong> €${data.total.toFixed(2)}</p>
        </div>
      `,
    }),
  ]);
}

export const createOrder = createServerFn({ method: 'POST' })
  .validator(orderFormSchema)
  .handler(async ({ data }) => {
    if (!supabaseEnvironmentStatus.isConfigured) {
      throw new Error('O checkout está indisponível porque o Supabase não está configurado neste ambiente.');
    }

    const supabase = createServerSupabaseClient();
    const orderNumber = buildOrderNumber();
    const pickupDateTime = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const metadataJson = serializeOrderMetadata(data);
    const baseInsert: Record<string, unknown> = {
      user_id: null,
      order_number: orderNumber,
      status: 'pending',
      subtotal: data.subtotal,
      tax: 0,
      shipping_cost: 0,
      discount_amount: 0,
      total: data.total,
      payment_method: normalizePaymentMethod(data.paymentMethod),
      payment_status: 'pending',
      shipping_method: 'pickup_guimaraes',
      notes: data.notes || null,
      customer_notes: metadataJson,
      scheduled_pickup_date: pickupDateTime.toISOString(),
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      pickup_date: data.pickupDate,
      pickup_time: data.pickupTime,
      payment_reference: data.paymentMethod === 'mb_way' ? '930935667' : null,
    };

    console.log('Payload enviado para orders:');
    console.log(JSON.stringify(baseInsert, null, 2));

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(baseInsert)
      .select('id, order_number')
      .single();

    if (orderError || !createdOrder) {
      console.error('Erro Supabase ao inserir orders:', formatSupabaseError(orderError));
      throw new Error('Não foi possível registar a encomenda. Tente novamente dentro de instantes.');
    }
await sendWhatsAppNotification(`
🛒 Nova encomenda recebida!

Cliente: ${data.customerName}
Telefone: ${data.customerPhone}
Email: ${data.customerEmail}

Total: €${data.total}

Método de pagamento: ${data.paymentMethod}

Data de recolha: ${data.pickupDate}
Hora: ${data.pickupTime}

Número da encomenda: ${createdOrder.order_number}
`);
    if (!createdOrder.id || !isUuid(createdOrder.id)) {
      await deleteCreatedOrder(supabase, createdOrder.id);
      throw new Error('Não foi possível validar o identificador da encomenda criada. A operação foi cancelada.');
    }

    const productResolution = await resolveProductIdsForCheckout(supabase, data.items);
    if (productResolution.unresolvedRefs.length > 0) {
      console.error('Produtos não encontrados para o checkout:', {
        unresolvedRefs: productResolution.unresolvedRefs,
      });
      await deleteCreatedOrder(supabase, createdOrder.id);
      throw new Error('Alguns produtos da encomenda já não existem. Atualize o carrinho e tente novamente.');
    }

    const orderItemsPayload: OrderItemsInsertRow[] = data.items.map((item) => ({
      order_id: createdOrder.id,
      product_id: productResolution.idMap.get(item.productId) || productResolution.slugMap.get(item.productId) || '',
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const invalidItem = orderItemsPayload.find(
      (item) =>
        !isUuid(item.order_id) ||
        !isUuid(item.product_id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price <= 0 ||
        !Number.isFinite(item.total_price) ||
        item.total_price < 0
    );

    if (invalidItem) {
      console.error('Item inválido para inserção em order_items:', invalidItem);
      await deleteCreatedOrder(supabase, createdOrder.id);
      throw new Error('Foi detetado um item inválido no carrinho. Atualize a página e tente novamente.');
    }

    console.log('Payload enviado para order_items:');
    console.log(JSON.stringify(orderItemsPayload, null, 2));

    console.log('Order ID criado:', createdOrder.id);

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);

    if (itemsError) {
      console.error('Erro Supabase ao inserir order_items:', {
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
      });
      await deleteCreatedOrder(supabase, createdOrder.id);
      throw new Error('Não foi possível guardar os produtos da encomenda. A operação foi cancelada. Tente novamente.');
    }

    await sendOrderEmails(createdOrder.order_number, data);

    return {
      orderId: createdOrder.id,
      orderNumber: createdOrder.order_number,
      paymentInstructions: getPaymentInstructions(data.paymentMethod),
    };
  });