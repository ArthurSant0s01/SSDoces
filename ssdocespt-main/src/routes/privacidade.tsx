import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — SSDoces" },
      { name: "description", content: "Como a SSDoces recolhe e trata os seus dados pessoais." },
      { property: "og:url", content: "/privacidade" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: () => (
    <article className="container-prose pb-20 pt-20 md:pt-28">
      <h1 className="font-display text-5xl text-foreground md:text-6xl">Política de Privacidade</h1>
      <div className="prose prose-neutral mt-8 max-w-2xl text-foreground/85">
        <p>A SSDoces respeita a sua privacidade. Apenas recolhemos os dados estritamente necessários para responder a pedidos de encomenda e contacto.</p>
        <h2>Dados recolhidos</h2>
        <p>Nome, contacto de email ou telefone e mensagens enviadas através dos nossos canais.</p>
        <h2>Finalidade</h2>
        <p>Gestão de encomendas, comunicação comercial e cumprimento de obrigações legais.</p>
        <h2>Conservação</h2>
        <p>Conservamos os dados pelo período necessário ao cumprimento da finalidade ou enquanto a relação comercial se mantiver.</p>
        <h2>Os seus direitos</h2>
        <p>Pode solicitar a qualquer momento acesso, retificação ou eliminação dos seus dados através do email sosdoces.pt@gmail.com.</p>
      </div>
    </article>
  ),
});
