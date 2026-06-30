'use client';

import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from 'lucide-react';

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Admin Dashboard - SSDoces' },
      { name: 'description', content: 'Painel de administração' },
      { property: 'og:title', content: 'Admin - SSDoces' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'noindex' }, // Don't index admin pages
    ],
    links: [{ rel: 'canonical', href: '/admin' }],
  }),
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  const { user, loading } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Você não tem permissão para acessar esta página
        </p>
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Voltar para Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard />
    </div>
  );
}
