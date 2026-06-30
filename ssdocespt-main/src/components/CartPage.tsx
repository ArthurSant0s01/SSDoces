'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

import { useState } from 'react';
import { motion } from 'framer-motion';

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

export function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } =
    useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotalPrice();
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (couponCode === 'DESCONTO10') {
      setDiscount(subtotal * 0.1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Carrinho Vazio</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Ainda não adicionou produtos ao carrinho.
        </p>
        <a href="/produtos">
          <Button size="lg">Continuar a comprar</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <motion.tr
                      key={item.productId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover rounded"
                              />
                            </div>
                          )}
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{euro.format(item.discountPrice || item.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center border rounded w-24">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, parseInt(e.target.value) || 1)
                            }
                            className="flex-1 text-center py-1 border-0 bg-transparent dark:bg-transparent"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {euro.format((item.discountPrice || item.price) * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Código promocional</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="DESCONTO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button onClick={applyCoupon} variant="outline">
                Aplicar
              </Button>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full">
            Continuar a comprar
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} itens)</span>
                  <span>{euro.format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recolha em Guimarães</span>
                  <span>Grátis</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-{euro.format(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{euro.format(Math.max(0, total))}</span>
                </div>
              </div>

              <a href="/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Ir para Checkout
                </Button>
              </a>

              <Button variant="outline" className="w-full" onClick={clearCart}>
                Limpar Carrinho
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
