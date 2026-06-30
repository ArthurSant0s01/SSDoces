import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e Condições — SSDoces" },
      { name: "description", content: "Termos e condições de utilização do website e de encomenda na SSDoces." },
      { property: "og:url", content: "/termos" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: () => (
    <article className="container-prose pb-20 pt-20 md:pt-28">
      <h1 className="font-display text-5xl text-foreground md:text-6xl">Termos e Condições</h1>
      <div className="prose prose-neutral mt-8 max-w-2xl text-foreground/85">
        <p>Ao utilizar o website da SSDoces ou ao efetuar uma encomenda, aceita os presentes Termos e Condições.</p>
        <h2>Encomendas</h2>
        <p>As encomendas são confirmadas após validação de disponibilidade e data de recolha em Guimarães.</p>
        <h2>Pagamento</h2>
        <p>Pagamento por MB WAY ou transferência. Outras formas podem ser disponibilizadas mediante acordo.</p>
        <h2>Cancelamentos</h2>
        <p>Cancelamentos devem ser comunicados com pelo menos 24 horas de antecedência.</p>
        <h2>Alergénios</h2>
        <p>Os produtos podem conter ou ter sido produzidos em ambiente com lactose, frutos de casca rija, soja, ovos e glúten.</p>
      </div>
    </article>
  ),
});
