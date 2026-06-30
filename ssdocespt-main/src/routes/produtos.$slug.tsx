'use client';

import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ProductDetails } from '@/components/products/ProductDetails';
import { ReviewForm } from '@/components/ReviewForm';
import { ArrowLeft } from 'lucide-react';
import { generateProductStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';

export const Route = createFileRoute('/produtos/$slug')({
  loader: ({ params }) => {
    // Mock product data - Replace with Supabase query in production
    const mockProduct = {
      id: params.slug,
      name: 'Brigadeiro Tradicional',
      slug: params.slug,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!mockProduct) throw notFound();
    return { product: mockProduct };
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
              url: `https://ssdoces.com.br/produtos/${p.slug}`,
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
    {
      id: '2',
      name: 'Brigadeiro de Pistache',
      price: 25.0,
      discount_price: null,
      image_url: '/brigadeiro-pistache.jpg',
      rating: 4.8,
      rating_count: 189,
      slug: 'brigadeiro-pistache',
      description: 'Brigadeiro gourmet com sabor sofisticado',
      long_description: '',
      quantity_in_stock: 45,
      category_id: '2',
      is_featured: true,
      is_active: true,
      sku: 'BRAD-002',
      ingredients: ['Chocolate Branco', 'Pistache'],
      allergens: ['Leite'],
      shelf_life_days: 21,
      images: [],
      created_at: '',
      updated_at: '',
    },
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-prose mt-24">
        <h2 className="font-display text-3xl text-foreground md:text-4xl">Pode também gostar</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <Link key={p.slug} to="/produtos/$slug" params={{ slug: p.slug }} className="group block">
              <div className="aspect-square overflow-hidden rounded-3xl bg-secondary/40">
                <img src={p.image} alt={p.name} loading="lazy" width={1200} height={1200} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-4">
                <div className="font-display text-xl text-foreground">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
