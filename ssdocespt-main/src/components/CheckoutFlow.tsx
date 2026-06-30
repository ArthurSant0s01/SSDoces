'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CheckoutProps {
  onOrderSubmit?: (orderData: any) => Promise<void>;
}

export function CheckoutFlow({ onOrderSubmit }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const [step, setStep] = useState<'review' | 'shipping' | 'payment' | 'confirmation'>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'shipping'>('pickup');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const subtotal = getTotalPrice();
  const shippingCost = deliveryMethod === 'pickup' ? 0 : deliveryMethod === 'delivery' ? 10 : 15;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + shippingCost + tax - couponDiscount;

  const applyCoupon = async () => {
    // Simulate coupon validation
    if (couponCode === 'DESCONTO10') {
      setCouponDiscount(subtotal * 0.1);
      setError(null);
    } else {
      setError('Cupom inválido');
    }
  };

  const handleSubmitOrder = async () => {
    if (!termsAccepted) {
      setError('Você deve aceitar os termos e condições');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items,
        customerData,
        deliveryMethod,
        deliveryNotes,
        subtotal,
        tax,
        shippingCost,
        couponDiscount,
        total,
      };

      if (onOrderSubmit) {
        await onOrderSubmit(orderData);
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
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Seu carrinho está vazio</p>
        <Link href="/produtos">
          <Button>Continuar Comprando</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Confirmation Page */}
      {step === 'confirmation' && (
        <div className="text-center py-12 space-y-6">
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Pedido Confirmado!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Obrigado pela sua compra. Você receberá um email de confirmação em breve.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Acompanhar Pedido</Button>
          </Link>
        </div>
      )}

      {step !== 'confirmation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps */}
            <Tabs value={step} onValueChange={(value: any) => setStep(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="review">1. Revisão</TabsTrigger>
                <TabsTrigger value="shipping" disabled={step === 'review'}>
                  2. Entrega
                </TabsTrigger>
                <TabsTrigger value="payment" disabled={step !== 'payment' && step !== 'confirmation'}>
                  3. Pagamento
                </TabsTrigger>
              </TabsList>

              {/* Review Step */}
              <TabsContent value="review" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        {item.imageUrl && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Quantidade: {item.quantity}
                          </p>
                          <p className="font-semibold mt-1">
                            R$ {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Coupon */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cupom de Desconto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        Aplicar
                      </Button>
                    </div>
                    {couponDiscount > 0 && (
                      <p className="text-sm text-green-600">
                        Cupom aplicado! Desconto: R$ {couponDiscount.toFixed(2)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Button onClick={() => setStep('shipping')} className="w-full">
                  Prosseguir para Entrega
                </Button>
              </TabsContent>

              {/* Shipping Step */}
              <TabsContent value="shipping" className="space-y-6 mt-6">
                {/* Delivery Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Método de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-semibold">Retirada em Loja</p>
                            <p className="text-sm text-slate-600">Grátis - Pronto em 2 horas</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-semibold">Entrega Local</p>
                            <p className="text-sm text-slate-600">R$ 10 - Próximo dia útil</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="shipping" id="shipping" />
                        <Label htmlFor="shipping" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-semibold">Envio Brasil</p>
                            <p className="text-sm text-slate-600">R$ 15 - 7 a 15 dias úteis</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nome Completo</Label>
                      <Input
                        value={customerData.fullName}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={customerData.email}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={customerData.phone}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, phone: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {deliveryMethod !== 'pickup' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Endereço</Label>
                        <Input
                          value={customerData.address}
                          onChange={(e) =>
                            setCustomerData({ ...customerData, address: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cidade</Label>
                          <Input
                            value={customerData.city}
                            onChange={(e) =>
                              setCustomerData({ ...customerData, city: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Input
                            maxLength={2}
                            value={customerData.state}
                            onChange={(e) =>
                              setCustomerData({ ...customerData, state: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>CEP</Label>
                        <Input
                          value={customerData.zip}
                          onChange={(e) =>
                            setCustomerData({ ...customerData, zip: e.target.value })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Delivery Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Observações adicionais sobre o pedido..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </CardContent>
                </Card>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep('review')} variant="outline" className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={() => setStep('payment')} className="flex-1">
                    Prosseguir para Pagamento
                  </Button>
                </div>
              </TabsContent>

              {/* Payment Step */}
              <TabsContent value="payment" className="space-y-6 mt-6">
                {/* Terms */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        Aceito os termos e condições e a política de privacidade
                      </Label>
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
                  <Button onClick={() => setStep('shipping')} variant="outline" className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={loading || !termsAccepted}
                    className="flex-1"
                  >
                    {loading ? 'Processando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Imposto</span>
                    <span>R$ {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span>R$ {shippingCost.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>-R$ {couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {Math.max(0, total).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
