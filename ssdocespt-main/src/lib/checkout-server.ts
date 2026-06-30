import { createServerFn } from '@tanstack/react-start';
import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getPaymentInstructions, getPaymentMethodLabel, orderFormSchema, serializeOrderMetadata } from '@/lib/order-schema';

type ColumnInfo = {
  column_name: string;
  is_nullable: 'YES' | 'NO';
};

let ordersColumnsCache: Promise<Map<string, ColumnInfo>> | null = null;

async function getOrdersColumns(supabase: ReturnType<typeof createServerSupabaseClient>) {
  if (!ordersColumnsCache) {
    ordersColumnsCache = supabase
      .schema('information_schema')
      .from('columns')
      .select('column_name, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'orders')
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('Failed to inspect orders columns:', error);
          return new Map<string, ColumnInfo>();
        }

        return new Map<string, ColumnInfo>(data.map((column) => [column.column_name, column as ColumnInfo]));
      });
  }

  return ordersColumnsCache;
}

async function resolveFallbackUserId(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['admin', 'staff', 'customer'])
    .limit(1);

  if (error || !data?.length) {
    console.error('Failed to resolve fallback user id for guest checkout:', error);
    throw new Error('A base de dados atual ainda exige um utilizador associado à encomenda. Execute a migração 004 antes de aceitar encomendas públicas.');
  }

  console.warn('Orders.user_id is still required. Using an existing profile as fallback owner for guest checkout compatibility.');
  return data[0].id;
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
      <p><strong>Cliente:</strong> ${data.fullName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
      <p><strong>Recolha:</strong> ${data.pickupDate} às ${data.pickupTime}</p>
      <p><strong>Pagamento:</strong> ${getPaymentMethodLabel(data.paymentMethod)}</p>
      <p><strong>Instruções:</strong> ${getPaymentInstructions(data.paymentMethod)}</p>
      <p><strong>Total:</strong> €${data.total.toFixed(2)}</p>
      <h3>Produtos</h3>
      <ul>${itemsHtml}</ul>
      ${data.additionalNotes ? `<p><strong>Observações:</strong> ${data.additionalNotes}</p>` : ''}
    </div>
  `;
}

async function sendOrderEmails(orderNumber: string, data: ReturnType<typeof orderFormSchema.parse>) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing. Order emails were skipped.');
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
      to: data.email,
      subject: `Recebemos a sua encomenda SSDoces ${orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
          <h2>Obrigado pela sua encomenda, ${data.fullName}.</h2>
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
    const supabase = createServerSupabaseClient();
    const orderNumber = buildOrderNumber();
    const pickupDateTime = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const ordersColumns = await getOrdersColumns(supabase);
    const metadataJson = serializeOrderMetadata(data);
    const baseInsert: Record<string, unknown> = {
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
      notes: data.additionalNotes || null,
      customer_notes: metadataJson,
      scheduled_pickup_date: pickupDateTime.toISOString(),
    };

    if (ordersColumns.has('customer_name')) {
      baseInsert.customer_name = data.fullName;
    }

    if (ordersColumns.has('customer_email')) {
      baseInsert.customer_email = data.email;
    }

    if (ordersColumns.has('customer_phone')) {
      baseInsert.customer_phone = data.whatsapp;
    }

    if (ordersColumns.has('pickup_date')) {
      baseInsert.pickup_date = data.pickupDate;
    }

    if (ordersColumns.has('pickup_time')) {
      baseInsert.pickup_time = data.pickupTime;
    }

    if (ordersColumns.has('payment_reference')) {
      baseInsert.payment_reference = data.paymentMethod === 'mb_way' ? '930935667' : null;
    }

    const userIdColumn = ordersColumns.get('user_id');
    if (userIdColumn?.is_nullable === 'NO') {
      baseInsert.user_id = await resolveFallbackUserId(supabase);
    } else {
      baseInsert.user_id = null;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(baseInsert)
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      throw new Error('Não foi possível registar a encomenda. Tente novamente dentro de instantes.');
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      data.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        special_requests: item.note || null,
      }))
    );

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      throw new Error('A encomenda foi criada sem os itens associados. Contacte a SSDoces para concluir o pedido.');
    }

    await sendOrderEmails(order.order_number, data);

    console.info(
      `WhatsApp admin integration pending. Send message to +351930935667 for order ${order.order_number}.`
    );

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      paymentInstructions: getPaymentInstructions(data.paymentMethod),
    };
  });