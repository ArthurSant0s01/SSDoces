import { createFileRoute, Link } from "@tanstack/react-router";

export const posts = [
  {
    slug: "o-segredo-do-ponto",
    title: "O segredo está no ponto",
    excerpt: "Como reconhecemos o momento exato em que o brigadeiro está pronto a sair do fogo.",
    category: "Receitas",
    date: "2026-06-12",
  },
  {
    slug: "chocolate-belga-vs-portugues",
    title: "Chocolate belga vs. chocolate português",
    excerpt: "Porque escolhemos chocolate belga 53% para o nosso clássico — e quando misturamos os dois.",
    category: "Notícias",
    date: "2026-05-28",
  },
  {
    slug: "caixas-de-oferta-corporativas",
    title: "Caixas de oferta para empresas",
    excerpt: "Apresentamos a nova linha de oferta corporativa, pensada para a memória de quem recebe.",
    category: "Empresa",
    date: "2026-05-05",
  },
] as const;

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Diário — SSDoces" },
      { name: "description", content: "Receitas, histórias e novidades da confeitaria artesanal SSDoces." },
      { property: "og:title", content: "Diário — SSDoces" },
      { property: "og:description", content: "Histórias dos bastidores e novidades SSDoces." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <>
      <section className="container-prose pb-12 pt-20 md:pt-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Diário</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-7xl">Bastidores e receitas</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Pequenas histórias de quem faz, todos os dias, em Guimarães.</p>
      </section>

      <section className="container-prose">
        <div className="divide-y divide-border border-y border-border">
          {posts.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group grid grid-cols-12 items-baseline gap-6 py-8 transition-colors hover:bg-muted/30">
              <div className="col-span-12 text-xs uppercase tracking-[0.18em] text-muted-foreground md:col-span-2">{p.category}</div>
              <div className="col-span-12 md:col-span-7">
                <h2 className="font-display text-2xl text-foreground transition-colors group-hover:text-accent md:text-3xl">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
              </div>
              <div className="col-span-12 text-xs text-muted-foreground md:col-span-3 md:text-right">
                {new Date(p.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
