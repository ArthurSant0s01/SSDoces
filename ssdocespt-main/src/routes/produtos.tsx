'use client';

import { createFileRoute } from '@tanstack/react-router';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useState } from 'react';

export const Route = createFileRoute('/produtos')({
  head: () => ({
    meta: [
      { title: 'Produtos - SSDoces Brigadeiros' },
      { name: 'description', content: 'Explore nossa variedade de brigadeiros artesanais: clássicos, gourmet, sem glúten e veganos. Entrega em São Paulo e Brasil.' },
      { property: 'og:title', content: 'Produtos - SSDoces' },
      { property: 'og:description', content: 'Brigadeiros artesanais feitos com ingredientes premium' },
      { property: 'og:url', content: '/produtos' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: '/produtos' }],
  }),
  component: ProdutosPage,
});

// Mock product data - Replace with Supabase queries in production
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Brigadeiro Tradicional',
    description: 'Brigadeiro clássico feito com ingredientes premium',
    long_description:
      'Nosso brigadeiro tradicional é feito com chocolate belga, leite condensado e manteiga. Perfeito para festas e eventos.',
    price: 15.0,
    discount_price: 12.0,
    image_url: '/brigadeiro-tradicional.jpg',
    images: ['/brigadeiro-tradicional.jpg'],
    quantity_in_stock: 100,
    rating: 4.9,
    rating_count: 256,
    category_id: '1',
    is_featured: true,
    is_active: true,
    sku: 'BRAD-001',
    ingredients: ['Chocolate', 'Leite Condensado', 'Manteiga'],
    allergens: ['Leite'],
    shelf_life_days: 30,
    slug: 'brigadeiro-tradicional',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Brigadeiro de Pistache',
    description: 'Brigadeiro gourmet com sabor sofisticado',
    long_description: 'Um brigadeiro gourmet especial com creme de pistache e chocolate branco.',
    price: 25.0,
    discount_price: null,
    image_url: '/brigadeiro-pistache.jpg',
    images: ['/brigadeiro-pistache.jpg'],
    quantity_in_stock: 45,
    rating: 4.8,
    rating_count: 189,
    category_id: '2',
    is_featured: true,
    is_active: true,
    sku: 'BRAD-002',
    ingredients: ['Chocolate Branco', 'Pistache', 'Leite Condensado'],
    allergens: ['Leite', 'Frutos Secos'],
    shelf_life_days: 21,
    slug: 'brigadeiro-pistache',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Brigadeiro Sem Glúten',
    description: 'Perfeito para quem tem restrição alimentar',
    long_description: 'Brigadeiro sem glúten certificado, feito com ingredientes naturais.',
    price: 18.0,
    discount_price: 15.0,
    image_url: '/brigadeiro-sem-gluten.jpg',
    images: ['/brigadeiro-sem-gluten.jpg'],
    quantity_in_stock: 32,
    rating: 4.7,
    rating_count: 145,
    category_id: '3',
    is_featured: false,
    is_active: true,
    sku: 'BRAD-003',
    ingredients: ['Chocolate Sem Glúten', 'Leite Condensado'],
    allergens: ['Leite'],
    shelf_life_days: 25,
    slug: 'brigadeiro-sem-gluten',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_CATEGORIES = [
  { id: '1', name: 'Clássicos', slug: 'classicos' },
  { id: '2', name: 'Gourmet', slug: 'gourmet' },
  { id: '3', name: 'Sem Glúten', slug: 'sem-gluten' },
  { id: '4', name: 'Veganos', slug: 'veganos' },
];

function ProdutosPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Nossos Produtos</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore nossa variedade de brigadeiros artesanais feitos com ingredientes premium
          </p>
        </div>

        <ProductGrid
          products={MOCK_PRODUCTS}
          categories={MOCK_CATEGORIES}
          totalCount={MOCK_PRODUCTS.length}
          currentPage={currentPage}
          pageSize={12}
          onFilterChange={(filters) => {
            console.log('Filters:', filters);
            setCurrentPage(1);
          }}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
