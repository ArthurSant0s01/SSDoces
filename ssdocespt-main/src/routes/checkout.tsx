'use client';

import { createFileRoute } from '@tanstack/react-router';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { createOrder } from '@/lib/checkout-server';

export const Route = createFileRoute('/checkout')({
  head: () => ({
    meta: [
      { title: 'Checkout SSDoces - Recolha em Guimarães' },
      { name: 'description', content: 'Finalize a sua encomenda de brigadeiros artesanais com recolha presencial em Guimarães.' },
      { property: 'og:title', content: 'Checkout - SSDoces' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: '/checkout' }],
  }),
  component: CheckoutRouteComponent,
});

function CheckoutRouteComponent() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5ea,transparent_45%),linear-gradient(180deg,#fffdf9_0%,#fff8ef_100%)] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <CheckoutFlow onOrderSubmit={createOrder} />
      </div>
    </div>
  );
}
