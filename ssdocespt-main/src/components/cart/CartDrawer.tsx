'use client';

import { useCartStore } from '@/store/cart';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle>Carrinho de Compras</DrawerTitle>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">Seu carrinho está vazio</p>
            <Link href="/produtos">
              <Button className="mt-4">Continuar Comprando</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  {item.imageUrl && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      R$ {item.discountPrice || item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-10 h-6 text-center text-xs border rounded dark:bg-slate-800 dark:border-slate-700"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Frete</span>
                  <span>Calculado no checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    Continuar Comprando
                  </Button>
                </DrawerClose>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
