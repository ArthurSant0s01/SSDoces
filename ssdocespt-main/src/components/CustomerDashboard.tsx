'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Package,
  Heart,
  Gift,
  Bell,
  MapPin,
  Star,
  LogOut,
  Edit,
  Copy,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: any[];
}

interface LoyaltyData {
  tier: string;
  points: number;
  nextTierPoints: number;
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  const orders: Order[] = [
    {
      id: '1',
      order_number: 'ORD-20260630-00001',
      status: 'delivered',
      total: 150.0,
      created_at: '2026-06-25',
      items: [
        { name: 'Brigadeiro Tradicional', quantity: 2, price: 75 },
      ],
    },
    {
      id: '2',
      order_number: 'ORD-20260630-00002',
      status: 'processing',
      total: 120.0,
      created_at: '2026-06-28',
      items: [
        { name: 'Brigadeiro de Pistache', quantity: 1, price: 120 },
      ],
    },
  ];

  const favorites = [
    { id: '1', name: 'Brigadeiro de Pistache', price: 25, rating: 4.9 },
    { id: '2', name: 'Brigadeiro de Chocolate', price: 15, rating: 4.8 },
  ];

  const loyalty: LoyaltyData = {
    tier: 'gold',
    points: 450,
    nextTierPoints: 1000,
  };

  const notifications = [
    { id: '1', title: 'Pedido Enviado', message: 'Seu pedido ORD-20260630-00002 foi enviado', date: '2026-06-29' },
    { id: '2', title: 'Ponto de Fidelidade Adicionado', message: 'Você ganhou 50 pontos', date: '2026-06-28' },
  ];

  const savedAddresses = [
    {
      id: '1',
      label: 'Casa',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
    },
  ];

  const reviews = [
    {
      id: '1',
      product: 'Brigadeiro Tradicional',
      rating: 5,
      title: 'Excelente!',
      content: 'Muito bom, chegou rápido e bem embalado',
      date: '2026-06-25',
    },
  ];

  const tierColors = {
    bronze: 'bg-amber-600',
    silver: 'bg-slate-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-600',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user?.user_metadata?.full_name || 'Usuário'}</h1>
              <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pedidos</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Favoritos</p>
                  <p className="text-3xl font-bold">{favorites.length}</p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pontos</p>
                  <p className="text-3xl font-bold">{loyalty.points}</p>
                </div>
                <Gift className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Notificações</p>
                  <p className="text-3xl font-bold">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelidade</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        {/* Orders */}
        <TabsContent value="orders" className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>{order.order_number}</CardTitle>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Data</p>
                      <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Itens:</p>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-slate-600">
                        {item.quantity}x {item.name} - R$ {item.price}
                      </p>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Loyalty */}
        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Fidelidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tier */}
              <div className="text-center">
                <Trophy className={`w-12 h-12 mx-auto mb-2 ${tierColors[loyalty.tier]}`} />
                <h3 className="text-2xl font-bold capitalize">{loyalty.tier}</h3>
              </div>

              {/* Points */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Seus Pontos</p>
                  <p className="text-2xl font-bold">{loyalty.points}</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(loyalty.points / loyalty.nextTierPoints) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {loyalty.nextTierPoints - loyalty.points} pontos até o próximo nível
                </p>
              </div>

              {/* Redeem */}
              <Button className="w-full">Resgatar Pontos</Button>

              {/* Benefits */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Benefícios</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> 1 ponto a cada R$ 1 gasto
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Descontos exclusivos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Acesso early bird
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Frete grátis (Platinum)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-900" />
                <CardContent className="p-4">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold">R$ {product.price}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{notif.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{notif.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses" className="space-y-4">
          {savedAddresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge>{addr.label}</Badge>
                    <p className="font-semibold mt-2">{addr.address}</p>
                    <p className="text-sm text-slate-600">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full">Adicionar Novo Endereço</Button>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <h4 className="font-semibold">{review.product}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">{review.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{review.content}</p>
                </div>
                <p className="text-xs text-slate-500">{review.date}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
