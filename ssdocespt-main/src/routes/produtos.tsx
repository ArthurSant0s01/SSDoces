'use client';

import { createFileRoute } from '@tanstack/react-router';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useState } from 'react';
import { storefrontCategories, storefrontProducts } from '@/data/products';

export const Route = createFileRoute('/produtos')({
  head: () => ({
    meta: [
      { title: 'Produtos - SSDoces Brigadeiros' },
      { name: 'description', content: 'Explore a coleção SSDoces de brigadeiros artesanais premium com recolha presencial em Guimarães.' },
      { property: 'og:title', content: 'Produtos - SSDoces' },
      { property: 'og:description', content: 'Brigadeiros artesanais feitos com ingredientes premium' },
      { property: 'og:url', content: '/produtos' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: '/produtos' }],
  }),
  component: ProdutosPage,
});

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
            Brigadeiros artesanais premium para recolha presencial em Guimarães
          </p>
        </div>

        <ProductGrid
          products={storefrontProducts}
          categories={[...storefrontCategories]}
          totalCount={storefrontProducts.length}
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
