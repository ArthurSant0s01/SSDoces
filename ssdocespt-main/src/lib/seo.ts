// SEO utilities and helpers

import { Metadata } from 'next';

interface SeoData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  author?: string;
  published?: string;
  updated?: string;
}

/**
 * Generate metadata for SEO
 */
export function generateSeoMetadata(data: SeoData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssdoces.com.br';

  return {
    title: data.title,
    description: data.description,
    keywords: [
      'brigadeiro',
      'doces',
      'artesanal',
      'São Paulo',
      'entrega',
      'gourmet',
    ],
    authors: [{ name: data.author || 'SSDoces' }],
    creator: 'SSDoces',
    openGraph: {
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [],
      url: data.url || baseUrl,
      type: data.type === 'product' ? 'og:product' : 'website',
      siteName: 'SSDoces',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
    canonical: data.url || baseUrl,
  };
}

/**
 * Generate structured data for products
 */
export function generateProductStructuredData(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: 'SSDoces',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: product.url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssdoces.com.br';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SSDoces',
    description:
      'Brigadeiros artesanais feitos com ingredientes de qualidade premium. Entrega em São Paulo e Brasil.',
    image: `${baseUrl}/logo.png`,
    url: baseUrl,
    telephone: '+55 11 99999-9999',
    email: 'contato@ssdoces.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Flores, 123',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '01310-100',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://www.instagram.com/ssdoces',
      'https://www.facebook.com/ssdoces',
      'https://www.whatsapp.com/send?phone=5511999999999',
    ],
    areaServed: 'BR',
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFaqStructuredData(
  items: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate article structured data
 */
export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  image: string;
  author: string;
  published: Date;
  updated: Date;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.published.toISOString(),
    dateModified: article.updated.toISOString(),
    mainEntity: {
      '@type': 'Article',
      url: article.url,
    },
  };
}

/**
 * Get canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssdoces.com.br';
  return `${baseUrl}${path}`;
}

/**
 * Generate robot meta tags
 */
export function generateRobotsMeta(
  index = true,
  follow = true,
  nosnippet = false,
  noarchive = false
): string {
  const parts = [];
  if (index) parts.push('index');
  else parts.push('noindex');

  if (follow) parts.push('follow');
  else parts.push('nofollow');

  if (nosnippet) parts.push('nosnippet');
  if (noarchive) parts.push('noarchive');

  return parts.join(', ');
}

/**
 * Image SEO optimization
 */
export function optimizeImageAlt(productName: string, type: string): string {
  return `${productName} - ${type} - SSDoces Brigadeiros Artesanais`;
}

/**
 * Generate URL slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * SEO-friendly descriptions
 */
export const SeoDescriptions = {
  homePage:
    'SSDoces - Brigadeiros artesanais feitos com ingredientes premium. Entrega em São Paulo e Brasil. Compre brigadeiros clássicos, gourmet, sem glúten e veganos.',
  productsPage: 'Explore nossa variedade de brigadeiros artesanais. Clássicos, gourmet, sem glúten e veganos.',
  aboutPage:
    'Conheça a história da SSDoces. Fabricantes de brigadeiros artesanais com qualidade premium desde 2020.',
  contactPage: 'Entre em contato com a SSDoces. Estamos aqui para ajudar com seus pedidos e dúvidas.',
};

/**
 * Generate breadcrumb items for navigation
 */
export function getBreadcrumbItems(pathname: string): Array<{ name: string; url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssdoces.com.br';
  const items: Array<{ name: string; url: string }> = [
    { name: 'Home', url: baseUrl },
  ];

  const segments = pathname.split('/').filter(Boolean);

  segments.forEach((segment, index) => {
    const url = `${baseUrl}/${segments.slice(0, index + 1).join('/')}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({ name, url });
  });

  return items;
}
