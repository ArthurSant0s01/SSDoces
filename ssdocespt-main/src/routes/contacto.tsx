import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Clock, Mail, MessageCircle, Instagram } from "lucide-react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — SSDoces" },
      { name: "description", content: "Fale com a SSDoces em Guimarães: WhatsApp, email e Instagram. Recolha por marcação." },
      { property: "og:title", content: "Contacto — SSDoces" },
      { property: "og:description", content: "Marque a sua recolha ou peça uma proposta." },
      { property: "og:url", content: "/contacto" },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: ContactoPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  message: z.string().trim().min(10, "Mensagem demasiado curta").max(1000),
});

function ContactoPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  }

  return (
    <>
      <section className="container-prose pb-12 pt-20 md:pt-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Falar connosco</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-7xl">Contacto</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Fale connosco para reservar a sua caixa, esclarecer dúvidas e confirmar a recolha presencial em Guimarães.
        </p>
      </section>

      <section className="container-prose grid gap-12 md:grid-cols-5">
        <aside className="md:col-span-2">
          <ul className="space-y-6 text-sm">
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-accent"><MapPin className="h-4 w-4" /></div>
              <div><div className="font-medium text-foreground">Guimarães, Portugal</div><div className="text-muted-foreground">Morada exata enviada após confirmação</div></div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-accent"><Clock className="h-4 w-4" /></div>
              <div><div className="font-medium text-foreground">Horário</div><div className="text-muted-foreground">Segunda a Sábado · 10h às 19h</div></div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-accent"><MessageCircle className="h-4 w-4" /></div>
              <div><a href="https://wa.me/351930935667" className="font-medium text-foreground hover:text-accent">+351 930 935 667</a><div className="text-muted-foreground">WhatsApp para confirmar recolha</div></div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-accent"><Mail className="h-4 w-4" /></div>
              <div><a href="mailto:sosdoces.pt@gmail.com" className="font-medium text-foreground hover:text-accent">sosdoces.pt@gmail.com</a><div className="text-muted-foreground">Pedidos, eventos e apoio ao cliente</div></div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-accent"><Instagram className="h-4 w-4" /></div>
              <div><a href="https://instagram.com/ssdoces.pt" className="font-medium text-foreground hover:text-accent">@ssdoces.pt</a><div className="text-muted-foreground">Bastidores, novidades e encomendas</div></div>
            </li>
          </ul>
        </aside>

        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
            {sent ? (
              <div className="py-8 text-center">
                <h2 className="font-display text-3xl text-foreground">Obrigado!</h2>
                <p className="mt-2 text-muted-foreground">Vamos responder o mais rapidamente possível.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl text-foreground">Enviar mensagem</h2>
                <div className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="name" className="text-sm text-foreground">Nome</label>
                    <input id="name" name="name" type="text" required maxLength={100} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm text-foreground">Email</label>
                    <input id="email" name="email" type="email" required maxLength={255} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm text-foreground">Mensagem</label>
                    <textarea id="message" name="message" rows={5} required maxLength={1000} className="mt-1 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
                    {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    Enviar
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
