'use client';

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, CalendarClock, CreditCard, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { getPaymentInstructions, getPaymentMethodLabel, orderFormSchema, paymentMethodOptions, type OrderFormInput } from '@/lib/order-schema';

interface CheckoutProps {
  onOrderSubmit?: (orderData: OrderFormInput) => Promise<{ orderNumber: string; paymentInstructions: string }>;
}

const paymentOptions: Array<{ value: OrderFormInput['paymentMethod']; title: string; description: string }> = [
  { value: 'mb_way', title: 'MB WAY', description: 'Pagamento imediato para o número 930935667.' },
  { value: 'revolut', title: 'Revolut', description: 'Preparado para configuração futura.' },
  { value: 'bank_transfer', title: 'Transferência Bancária', description: 'Dados enviados após confirmação manual.' },
  { value: 'cash_on_pickup', title: 'Dinheiro na recolha', description: 'Pague quando levantar a encomenda.' },
];

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

export function CheckoutFlow({ onOrderSubmit }: CheckoutProps) {
  const { items, getTotalPrice, clearCart, updateQuantity, updateSpecialRequests, removeItem } = useCartStore();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ orderNumber: string; paymentInstructions: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    additionalNotes: '',
    pickupDate: '',
    pickupTime: '',
    paymentMethod: 'mb_way' as OrderFormInput['paymentMethod'],
  });

  const subtotal = getTotalPrice();
  const total = subtotal;

  const orderPayload = useMemo<OrderFormInput>(() => ({
    ...formData,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: item.discountPrice || item.price,
      quantity: item.quantity,
      note: item.specialRequests || '',
    })),
    subtotal,
    total,
  }), [formData, items, subtotal, total]);

  const validateCurrentStep = () => {
    const result = orderFormSchema.safeParse(orderPayload);

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Verifique os dados da encomenda.');
      return false;
    }

    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
    if (Number.isNaN(pickup.getTime()) || pickup.getTime() < Date.now()) {
      setError('Selecione uma data e hora de recolha futuras.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onOrderSubmit) {
        const response = await onOrderSubmit(orderPayload);
        setSuccessData(response);
      }

      clearCart();
      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-soft)]">
        <p className="text-slate-600 dark:text-slate-400 mb-4">O seu carrinho está vazio.</p>
        <a href="/produtos">
          <Button>Explorar brigadeiros</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="grid gap-4 rounded-[2rem] border border-border bg-[#fff9f4] p-6 shadow-[var(--shadow-soft)] lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Checkout SSDoces</p>
          <h2 className="mt-2 font-display text-4xl text-foreground">Finalize a sua encomenda</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            A SSDoces trabalha apenas com recolha presencial em Guimarães. Após a confirmação, enviamos a morada exata por mensagem.
          </p>
        </div>
        <div className="rounded-3xl bg-[#3d2415] p-5 text-[#fff7ef]">
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5" />
            Checkout seguro com confirmação manual
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#f9e5d1]">
            <p>Recolha: Guimarães, Portugal</p>
            <p>Horário: Segunda a Sábado, 10h às 19h</p>
            <p>WhatsApp: +351 930 935 667</p>
          </div>
        </div>
      </div>

      {step === 'confirmation' && (
        <div className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)] space-y-6">
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Encomenda recebida com sucesso</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Obrigado pela sua compra. Vamos confirmar a recolha por email e WhatsApp.
          </p>
          {successData && (
            <div className="mx-auto max-w-2xl rounded-3xl bg-[#f7efe5] p-6 text-left text-sm text-[#5a3520]">
              <p><strong>Número da encomenda:</strong> {successData.orderNumber}</p>
              <p className="mt-2"><strong>Pagamento:</strong> {successData.paymentInstructions}</p>
            </div>
          )}
          <div className="flex justify-center gap-3">
            <a href="/produtos">
              <Button size="lg">Continuar a comprar</Button>
            </a>
            <a href="https://wa.me/351930935667" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline">Enviar comprovativo</Button>
            </a>
          </div>
        </div>
      )}

      {step !== 'confirmation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'details' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Os seus brigadeiros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="grid gap-4 rounded-2xl border border-border bg-slate-50 p-4 dark:bg-slate-900 md:grid-cols-[auto_1fr_auto]">
                        {item.imageUrl && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {euro.format(item.discountPrice || item.price)} por unidade
                          </p>
                          <Textarea
                            value={item.specialRequests || ''}
                            onChange={(event) => updateSpecialRequests(item.productId, event.target.value.slice(0, 250))}
                            placeholder="Observações para este produto"
                            className="mt-3 min-h-20"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-right text-sm font-semibold">
                            {euro.format((item.discountPrice || item.price) * item.quantity)}
                          </p>
                          <button onClick={() => removeItem(item.productId)} className="flex w-full items-center justify-end gap-1 text-sm text-red-600">
                            <Trash2 className="h-4 w-4" /> Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Dados para recolha</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">Nome completo</Label>
                      <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData((current) => ({ ...current, fullName: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                      <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData((current) => ({ ...current, whatsapp: e.target.value }))} placeholder="+351 930 935 667" />
                    </div>
                    <div>
                      <Label htmlFor="pickupDate">Data de recolha</Label>
                      <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={(e) => setFormData((current) => ({ ...current, pickupDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <Label htmlFor="pickupTime">Hora de recolha</Label>
                      <Input id="pickupTime" type="time" value={formData.pickupTime} onChange={(e) => setFormData((current) => ({ ...current, pickupTime: e.target.value }))} min="10:00" max="19:00" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="additionalNotes">Observações adicionais</Label>
                      <Textarea id="additionalNotes" value={formData.additionalNotes} onChange={(e) => setFormData((current) => ({ ...current, additionalNotes: e.target.value }))} placeholder="Ex.: caixa para oferta, preferências de recolha, contacto alternativo" />
                    </div>
                  </CardContent>
                </Card>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={() => validateCurrentStep() && setStep('payment')} className="w-full">
                  Rever pagamento e confirmar
                </Button>
              </>
            )}

            {step === 'payment' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Método de pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={formData.paymentMethod} onValueChange={(value: OrderFormInput['paymentMethod']) => setFormData((current) => ({ ...current, paymentMethod: value }))}>
                      {paymentOptions.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 rounded-2xl border border-border p-4">
                          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            <p className="font-semibold">{option.title}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{option.description}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="rounded-2xl bg-[#f7efe5] p-4 text-sm text-[#5a3520]">
                      <div className="flex items-center gap-2 font-semibold">
                        <CreditCard className="h-4 w-4" /> {getPaymentMethodLabel(formData.paymentMethod)}
                      </div>
                      <p className="mt-2">{getPaymentInstructions(formData.paymentMethod)}</p>
                      {formData.paymentMethod === 'mb_way' && <p className="mt-2 font-semibold">Número MB WAY: 930935667</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão final</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <p><strong>Cliente:</strong> {formData.fullName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                      <p><strong>Recolha:</strong> {formData.pickupDate} às {formData.pickupTime}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <CalendarClock className="h-4 w-4" /> Recolha presencial
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        A morada exata em Guimarães será enviada após confirmação da encomenda.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep('details')} variant="outline" className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'A criar encomenda...' : 'Confirmar encomenda'}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo da encomenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{euro.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recolha</span>
                    <span>Grátis</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{euro.format(total)}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <p className="font-semibold text-foreground dark:text-slate-100">Método atual</p>
                  <p className="mt-1">{getPaymentMethodLabel(formData.paymentMethod)}</p>
                  <p className="mt-3 font-semibold text-foreground dark:text-slate-100">Levantamento</p>
                  <p className="mt-1">Guimarães, Portugal</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
