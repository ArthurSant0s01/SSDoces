import { createFileRoute } from "@tanstack/react-router";

const faqs = [
  { q: "Como faço uma encomenda?", a: "Escolha os sabores na página de produtos e fale connosco por WhatsApp ou email. Confirmamos disponibilidade e a recolha em Guimarães." },
  { q: "Com quanto tempo devo encomendar?", a: "Idealmente com 24 a 48 horas de antecedência. Para eventos pedimos 7 dias." },
  { q: "Fazem entregas?", a: "Sim, fazemos entregas em Guimarães e arredores mediante combinação prévia. Caso contrário, a recolha é gratuita." },
  { q: "Quanto tempo duram os brigadeiros?", a: "Recomendamos consumir até 3 dias após a produção, conservados em local fresco." },
  { q: "Têm opções sem glúten?", a: "Os nossos brigadeiros clássicos não levam glúten, mas são produzidos numa cozinha onde o glúten está presente." },
  { q: "Aceitam encomendas para empresas?", a: "Sim. Preparamos caixas personalizadas e propostas para ofertas corporativas." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — SSDoces" },
      { name: "description", content: "Perguntas frequentes sobre encomendas, recolha, entregas e conservação dos brigadeiros SSDoces." },
      { property: "og:title", content: "FAQ — SSDoces" },
      { property: "og:description", content: "Perguntas frequentes sobre os brigadeiros SSDoces." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <section className="container-prose pb-12 pt-20 md:pt-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Ajuda</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-7xl">Perguntas frequentes</h1>
      </section>

      <section className="container-prose">
        <div className="divide-y divide-border rounded-[2rem] border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 md:p-8">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="font-display text-xl text-foreground md:text-2xl">{f.q}</span>
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-2xl text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
