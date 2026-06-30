import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, HandHeart, Sparkles, MapPin, MessageCircle } from "lucide-react";
import hero from "@/assets/hero-brigadeiros.jpg";
import artisan from "@/assets/about-artisan.jpg";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSDoces — Brigadeiros artesanais em Guimarães" },
      {
        name: "description",
        content:
          "Brigadeiros artesanais feitos à mão em Guimarães. Ingredientes selecionados, produção em pequenos lotes, sabor inesquecível.",
      },
      { property: "og:title", content: "SSDoces — Brigadeiros artesanais em Guimarães" },
      {
        property: "og:description",
        content: "Doces premium, produção artesanal e recolha em Guimarães.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: hero, fetchpriority: "high" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-prose grid items-center gap-12 pb-20 pt-16 md:grid-cols-12 md:gap-8 md:pb-28 md:pt-24">
          <div className="md:col-span-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Guimarães · Edição artesanal
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
                Brigadeiros artesanais{" "}
                <span className="italic text-accent">feitos com carinho.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                Ingredientes selecionados. Produção em pequenos lotes.
                <br />
                Sabor inesquecível.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Comprar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Ver produtos
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="relative md:col-span-6">
            <Reveal delay={0.1}>
              <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] bg-secondary shadow-[var(--shadow-lift)]">
                <img
                  src={hero}
                  alt="Brigadeiros artesanais SSDoces"
                  width={1600}
                  height={1200}
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-background/95 p-5 shadow-[var(--shadow-soft)] backdrop-blur md:block">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Caixa assinatura</div>
                <div className="mt-1 font-display text-2xl text-foreground">9 unidades</div>
                <div className="text-sm text-muted-foreground">a partir de €13,50</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="container-prose grid gap-10 py-16 md:grid-cols-3">
          {[
            { icon: Leaf, title: "Ingredientes selecionados", body: "Chocolate belga, pistácio siciliano, flor de sal portuguesa." },
            { icon: HandHeart, title: "Produção artesanal", body: "Pequenos lotes, enrolados à mão no próprio dia." },
            { icon: Sparkles, title: "Acabamento premium", body: "Embalagens cuidadas para presentear e eventos." },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section>
        <div className="container-prose pt-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A coleção</div>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Sabores em destaque</h2>
            </div>
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="mt-28">
        <div className="container-prose grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src={artisan}
                alt="Mãos a enrolar brigadeiros artesanais"
                loading="lazy"
                width={1400}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A nossa história</div>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                Pequenos lotes, cuidado infinito.
              </h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                Em Guimarães, a cada manhã, escolhemos os ingredientes, pesamos com rigor e enrolamos
                à mão. Sem atalhos, sem corantes, sem pressa — apenas a receita certa, repetida com
                paciência.
              </p>
              <Link
                to="/sobre"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
              >
                Conhecer a SSDoces <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-28">
        <div className="container-prose">
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Como encomendar</div>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Três passos simples</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Escolha os sabores", d: "Monte a sua caixa a partir da coleção atual." },
              { n: "02", t: "Combine a recolha", d: "Confirmamos por WhatsApp dia e hora em Guimarães." },
              { n: "03", t: "Saboreie no dia", d: "Os doces são feitos no próprio dia da entrega." },
            ].map((s) => (
              <Reveal key={s.n} className="rounded-3xl border border-border bg-card p-8">
                <div className="font-display text-3xl text-accent">{s.n}</div>
                <h3 className="mt-3 font-display text-2xl text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mt-28">
        <div className="container-prose">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Quem provou</div>
          <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Palavras de quem nos conhece</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { q: "Os melhores brigadeiros que já comi em Portugal. Acabamento impecável.", a: "Mariana C." },
              { q: "Encomendei para o batizado da minha filha. Toda a gente quis a morada.", a: "André P." },
              { q: "O caramelo salgado com flor de sal é viciante. Vou voltar.", a: "Inês R." },
            ].map((t) => (
              <Reveal key={t.a} className="rounded-3xl border border-border bg-card p-8">
                <p className="font-display text-xl leading-snug text-foreground">“{t.q}”</p>
                <div className="mt-6 text-sm text-muted-foreground">— {t.a}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28">
        <div className="container-prose">
          <div className="overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-primary-foreground md:px-16">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-4xl md:text-5xl">Pronto para adoçar o dia?</h2>
                <p className="mt-4 max-w-md text-primary-foreground/80">
                  Marque a sua recolha em Guimarães ou peça uma proposta para o seu evento.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <a
                  href="https://wa.me/351930935667"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <MapPin className="h-4 w-4" /> Onde estamos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
