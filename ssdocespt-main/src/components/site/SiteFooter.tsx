import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const whatsappMessage = encodeURIComponent('Olá! Eu gostaria de receber atualizações da minha encomenda.');

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container-prose py-16">
        <NewsletterSignup
          title="Receba Novidades SSDoces"
          description="Novas caixas, horários de recolha e campanhas especiais diretamente no seu email"
        />
      </div>

      <div className="container-prose grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-foreground">SSDoces</div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Brigadeiros artesanais feitos com carinho. Recolha presencial em Guimarães, com morada exata enviada após confirmação da encomenda.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={`https://wa.me/351930935667?text=${whatsappMessage}`}
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:bg-foreground hover:text-background"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/ssdoces.pt"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:bg-foreground hover:text-background"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="mailto:sosdoces.pt@gmail.com"
              aria-label="Email"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:bg-foreground hover:text-background"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Navegar
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/produtos" className="text-foreground/80 hover:text-foreground">Produtos</Link></li>
            <li><Link to="/sobre" className="text-foreground/80 hover:text-foreground">Sobre</Link></li>
            <li><Link to="/blog" className="text-foreground/80 hover:text-foreground">Diário</Link></li>
            <li><Link to="/faq" className="text-foreground/80 hover:text-foreground">FAQ</Link></li>
            <li><Link to="/contacto" className="text-foreground/80 hover:text-foreground">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Visite-nos
          </div>
          <address className="mt-4 not-italic text-sm text-foreground/80">
            Guimarães, Portugal
            <br />
            Apenas recolha presencial
            <br />
            Segunda a Sábado · 10h às 19h
          </address>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>WhatsApp: +351 930 935 667</p>
            <p>Email: sosdoces.pt@gmail.com</p>
            <p>Instagram: @ssdoces.pt</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/privacidade" className="text-muted-foreground hover:text-foreground">Privacidade</Link></li>
            <li><Link to="/termos" className="text-muted-foreground hover:text-foreground">Termos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-prose flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} SSDoces. Todos os direitos reservados.</div>
          <div>Feito com carinho em Guimarães. Recolha confirmada por WhatsApp.</div>
        </div>
      </div>
    </footer>
  );
}
