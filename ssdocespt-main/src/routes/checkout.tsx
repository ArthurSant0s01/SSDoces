'use client';

import { createFileRoute } from '@tanstack/react-router';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Route = createFileRoute('/checkout')({
  head: () => ({
    meta: [
      { title: 'Checkout - SSDoces' },
      { name: 'description', content: 'Complete seu pedido com segurança' },
      { property: 'og:title', content: 'Checkout - SSDoces' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: '/checkout' }],
  }),
  component: CheckoutRouteComponent,
});

function CheckoutRouteComponent() {
  const { user } = useAuth();

  const handleOrderSubmit = async (orderData: any) => {
    try {
      console.log('Submitting order:', orderData);
      
      // TODO: Save order to Supabase
      // const { data, error } = await supabase
      //   .from('orders')
      //   .insert([{
      //     user_id: user?.id,
      //     items: orderData.items,
      //     total: orderData.total,
      //     ...orderData
      //   }]);

      // if (error) throw error;

      // For now, just simulate the order creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutFlow onOrderSubmit={handleOrderSubmit} />
      </div>
    </div>
  );
}
