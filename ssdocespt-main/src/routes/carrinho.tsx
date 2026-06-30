'use client';

import { createFileRoute } from '@tanstack/react-router';
import { CartPage } from '@/components/CartPage';

export const Route = createFileRoute('/carrinho')({
  head: () => ({
    meta: [
      { title: 'Carrinho - SSDoces' },
      { name: 'description', content: 'Revise seus itens e procure checkout' },
      { property: 'og:title', content: 'Carrinho - SSDoces' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: '/carrinho' }],
  }),
  component: CartRouteComponent,
});

function CartRouteComponent() {
  return <CartPage />;
}
