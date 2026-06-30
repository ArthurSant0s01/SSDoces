import { createFileRoute } from "@tanstack/react-router";
import artisan from "@/assets/about-artisan.jpg";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — SSDoces" },
      { name: "description", content: "A história e os valores por trás dos brigadeiros artesanais da SSDoces, em Guimarães." },
      { property: "og:title", content: "Sobre — SSDoces" },
      { property: "og:description", content: "Brigadeiros artesanais feitos em pequenos lotes, em Guimarães." },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <>
      <section className="container-prose pb-12 pt-20 md:pt-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A nossa história</div>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
          Doçaria feita devagar, em <span className="italic text-accent">Guimarães</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A SSDoces nasceu da vontade de oferecer um brigadeiro que se prova com calma e se oferece
          com orgulho. Trabalhamos com chocolate belga, pistácio siciliano e flor de sal
          portuguesa — sempre em pequenos lotes, sempre à mão.
        </p>
      </section>

      <section className="container-prose">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem]">
            <img src={artisan} alt="Produção artesanal de brigadeiros" width={1400} height={1000} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="container-prose mt-20 grid gap-12 md:grid-cols-3">
        {[
          { t: "Receita honesta", d: "Sem corantes, sem aromas, sem conservantes. Só o que escreveríamos em casa." },
          { t: "Pequenos lotes", d: "Cada encomenda é cozinhada e enrolada no próprio dia." },
          { t: "Apresentação cuidada", d: "Embalagens pensadas para presentear, com a discrição certa." },
        ].map((b) => (
          <Reveal key={b.t}>
            <h3 className="font-display text-2xl text-foreground">{b.t}</h3>
            <p className="mt-2 text-muted-foreground">{b.d}</p>
          </Reveal>
        ))}
      </section>

      <section className="container-prose mt-24">
        <div className="rounded-[2rem] border border-border bg-secondary/40 p-10 md:p-14">
          <h2 className="max-w-2xl font-display text-3xl text-foreground md:text-4xl">
            Estamos a crescer com calma — uma receita de cada vez.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Em breve: brownies, bolachas, bolos de assinatura, caixas de oferta e propostas para
            eventos e empresas.
          </p>
        </div>
      </section>
    </>
  );
}
