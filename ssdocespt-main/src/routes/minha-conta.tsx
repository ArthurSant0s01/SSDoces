'use client';

import { createFileRoute, redirect } from '@tanstack/react-router';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from 'lucide-react';

export const Route = createFileRoute('/minha-conta')({
  beforeLoad: ({ context }) => {
    // Check if user is authenticated
    // This should be implemented with useAuthReady hook
    // For now, we'll let it render and the component will handle it
  },
  head: () => ({
    meta: [
      { title: 'Minha Conta - SSDoces' },
      { name: 'description', content: 'Gerenciar sua conta, pedidos e preferências' },
      { property: 'og:title', content: 'Minha Conta - SSDoces' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'noindex' }, // Don't index private pages
    ],
    links: [{ rel: 'canonical', href: '/minha-conta' }],
  }),
  component: CustomerDashboardRoute,
});

function CustomerDashboardRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Faça login para acessar sua conta
        </p>
        <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Fazer Login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <CustomerDashboard />
    </div>
  );
}
