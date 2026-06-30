'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/lib/database.types';
import { parseOrderMetadata } from '@/lib/order-schema';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  DollarSign,
  CalendarClock,
  Loader,
  RefreshCcw,
} from 'lucide-react';

type OrderWithItems = Order & {
  order_items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_requests?: string | null;
  }>;
};

const statusOptions: Array<Order['status']> = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered'];

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'confirmed':
      return 'Confirmada';
    case 'processing':
      return 'Em preparação';
    case 'ready_for_pickup':
      return 'Pronta para recolha';
    case 'delivered':
      return 'Entregue';
    default:
      return status;
  }
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-900',
    confirmed: 'bg-sky-100 text-sky-900',
    processing: 'bg-violet-100 text-violet-900',
    ready_for_pickup: 'bg-emerald-100 text-emerald-900',
    delivered: 'bg-green-100 text-green-900',
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    const { data, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, order_number, status, subtotal, tax, shipping_cost, discount_amount, total, payment_method, payment_status, shipping_method, notes, customer_notes, scheduled_pickup_date, created_at, updated_at, order_items(id, quantity, unit_price, total_price, special_requests)')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Erro ao carregar encomendas:', ordersError);
      setError('Não foi possível carregar as encomendas do Supabase. Confirme as permissões de administrador e a configuração do projeto.');
      setOrders([]);
    } else {
      setOrders((data as OrderWithItems[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((order) => order.status === 'pending').length;
    const today = new Date().toISOString().slice(0, 10);
    const pickupsToday = orders.filter((order) => {
      const metadata = parseOrderMetadata(order.customer_notes);
      return metadata.pickupDate === today;
    }).length;

    return [
      { title: 'Receita total', value: euro.format(totalRevenue), icon: DollarSign },
      { title: 'Encomendas', value: String(orders.length), icon: ShoppingCart },
      { title: 'Pendentes', value: String(pending), icon: RefreshCcw },
      { title: 'Recolhas hoje', value: String(pickupsToday), icon: CalendarClock },
    ];
  }, [orders]);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    setUpdatingId(orderId);
    const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (updateError) {
      console.error('Erro ao atualizar estado:', updateError);
      setError('Não foi possível atualizar o estado da encomenda.');
    } else {
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    }

    setUpdatingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Novas Encomendas</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Gestão de recolhas SSDoces em Guimarães</p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-[#8d5430]" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de encomendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader className="mr-3 h-5 w-5 animate-spin" /> A carregar encomendas...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">Ainda não existem encomendas registadas.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Encomenda</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Recolha</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  (() => {
                    const metadata = parseOrderMetadata(order.customer_notes);
                    const pickupDate = metadata.pickupDate || order.scheduled_pickup_date?.slice(0, 10) || '—';
                    const pickupTime = metadata.pickupTime || (order.scheduled_pickup_date ? new Date(order.scheduled_pickup_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '—');
                    const paymentLabel = metadata.paymentMethodLabel || (order.payment_method === 'cash' ? 'Dinheiro na recolha' : 'Transferência / confirmação manual');

                    return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-semibold">{order.order_number}</div>
                      <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString('pt-PT')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{metadata.customerName || 'Cliente SSDoces'}</div>
                      <div className="text-xs text-slate-500">{metadata.customerEmail || '—'}</div>
                    </TableCell>
                    <TableCell>{metadata.customerPhone || '—'}</TableCell>
                    <TableCell>
                      <div>{pickupDate}</div>
                      <div className="text-xs text-slate-500">{pickupTime}</div>
                    </TableCell>
                    <TableCell>{paymentLabel}</TableCell>
                    <TableCell>{euro.format(order.total)}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={statusColors[order.status]}>{statusLabel(order.status)}</Badge>
                        <select
                          value={order.status}
                          onChange={(event) => updateStatus(order.id, event.target.value as Order['status'])}
                          disabled={updatingId === order.id}
                          className="block rounded-lg border border-border bg-background px-2 py-1 text-xs"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{statusLabel(status)}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  })()
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
