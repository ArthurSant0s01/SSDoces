import { z } from 'zod';

const sanitizeText = (value: string) =>
  value
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const paymentMethodOptions = ['mb_way', 'revolut', 'bank_transfer', 'cash_on_pickup'] as const;

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().min(1).max(50),
  note: z.string().max(250).optional().transform((value) => (value ? sanitizeText(value) : '')),
});

export const orderFormSchema = z.object({
  fullName: z.string().min(3).max(120).transform(sanitizeText),
  email: z.string().email().max(255).transform((value) => value.trim().toLowerCase()),
  whatsapp: z.string().min(9).max(30).transform(sanitizeText),
  additionalNotes: z.string().max(500).optional().transform((value) => (value ? sanitizeText(value) : '')),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  paymentMethod: z.enum(paymentMethodOptions),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  total: z.number().min(0),
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;

export function getPaymentMethodLabel(method: OrderFormInput['paymentMethod']) {
  switch (method) {
    case 'mb_way':
      return 'MB WAY';
    case 'revolut':
      return 'Revolut';
    case 'bank_transfer':
      return 'Transferência Bancária';
    case 'cash_on_pickup':
      return 'Dinheiro na recolha';
  }
}

export function getPaymentInstructions(method: OrderFormInput['paymentMethod']) {
  switch (method) {
    case 'mb_way':
      return 'Efetue o pagamento por MB WAY para 930935667 e envie o comprovativo por WhatsApp.';
    case 'revolut':
      return 'Opção preparada para futura configuração. A SSDoces confirmará manualmente os dados de pagamento.';
    case 'bank_transfer':
      return 'Opção preparada para futura configuração. A SSDoces enviará os dados bancários após confirmar a encomenda.';
    case 'cash_on_pickup':
      return 'Pague em dinheiro no momento da recolha em Guimarães.';
  }
}

export interface OrderMetadata {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: OrderFormInput['paymentMethod'];
  paymentMethodLabel: string;
  paymentInstructions: string;
  additionalNotes?: string;
}

export function buildOrderMetadata(input: OrderFormInput): OrderMetadata {
  return {
    customerName: input.fullName,
    customerEmail: input.email,
    customerPhone: input.whatsapp,
    pickupDate: input.pickupDate,
    pickupTime: input.pickupTime,
    paymentMethod: input.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(input.paymentMethod),
    paymentInstructions: getPaymentInstructions(input.paymentMethod),
    additionalNotes: input.additionalNotes,
  };
}

export function serializeOrderMetadata(input: OrderFormInput) {
  return JSON.stringify(buildOrderMetadata(input));
}

export function parseOrderMetadata(value?: string | null): Partial<OrderMetadata> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Partial<OrderMetadata>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}