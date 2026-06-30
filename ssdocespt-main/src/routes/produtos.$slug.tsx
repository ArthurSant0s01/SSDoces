'use client';

import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ProductDetails } from '@/components/products/ProductDetails';
import { ReviewForm } from '@/components/ReviewForm';
import { ArrowLeft } from 'lucide-react';
import { generateProductStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { storefrontProducts } from '@/data/products';

export const Route = createFileRoute('/produtos/$slug')({
  loader: ({ params }) => {
    const product = storefrontProducts.find((item) => item.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: 'Produto — SSDoces' }] };
    return {
      meta: [
        { title: `${p.name} — SSDoces` },
        { name: 'description', content: p.description },
        { property: 'og:title', content: `${p.name} — SSDoces` },
        { property: 'og:description', content: p.description },
        { property: 'og:type', content: 'product' },
        { property: 'og:url', content: `/produtos/${p.slug}` },
        { property: 'og:image', content: p.image_url },
      ],
      links: [{ rel: 'canonical', href: `/produtos/${p.slug}` }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            generateProductStructuredData({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.discount_price || p.price,
              rating: p.rating,
              image: p.image_url,
              url: `https://ssdoces.pt/produtos/${p.slug}`,
            })
          ),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-prose py-32 text-center">
      <h1 className="text-4xl font-bold">Produto não encontrado</h1>
      <Link to="/produtos" className="mt-6 inline-block text-sm hover:underline">
        Ver todos os produtos
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();

  const mockReviews = [
    {
      id: '1',
      user_name: 'João Silva',
      rating: 5,
      title: 'Excelente qualidade!',
      content: 'Muito bom, chegou rápido e bem embalado',
      is_verified_purchase: true,
    },
  ];

  const mockRelatedProducts = [
    ...storefrontProducts.filter((item) => item.slug !== product.slug).slice(0, 3),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Produtos
        </Link>

        <ProductDetails product={product} relatedProducts={mockRelatedProducts} reviews={mockReviews} />

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-8">Deixe sua Avaliação</h2>
          <div className="max-w-2xl">
            <ReviewForm
              productId={product.id}
              onSubmit={async (review) => {
                console.log('Review submitted:', review);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
