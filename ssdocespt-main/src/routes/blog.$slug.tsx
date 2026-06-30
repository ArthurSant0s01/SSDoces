import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { posts } from "./blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Artigo — SSDoces" }] };
    return {
      meta: [
        { title: `${p.title} — SSDoces` },
        { name: "description", content: p.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:url", content: `/blog/${p.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${p.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            datePublished: p.date,
            author: { "@type": "Organization", name: "SSDoces" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-prose py-32 text-center">
      <h1 className="font-display text-4xl">Artigo não encontrado</h1>
      <Link to="/blog" className="mt-6 inline-block text-sm text-accent hover:underline">Voltar ao diário</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-prose py-32 text-center">
      <h1 className="font-display text-3xl">Não foi possível carregar este artigo.</h1>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="container-prose pb-20 pt-12 md:pt-16">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Diário
      </Link>
      <div className="mt-8 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{post.category} · {new Date(post.date).toLocaleDateString("pt-PT")}</div>
        <h1 className="mt-3 font-display text-5xl leading-tight text-foreground md:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl text-muted-foreground">{post.excerpt}</p>
        <div className="prose prose-neutral mt-10 max-w-none text-foreground/85">
          <p>
            Em breve, mais sobre este tema. Este diário acompanha o crescimento da SSDoces, com
            receitas, escolhas de ingredientes e bastidores da cozinha.
          </p>
          <p>
            Entretanto, siga-nos no Instagram <a href="https://instagram.com/ssdoces.pt" className="text-accent">@ssdoces.pt</a> ou fale connosco
            por <a href="https://wa.me/351930935667" className="text-accent">WhatsApp</a>.
          </p>
        </div>
      </div>
    </article>
  );
}
