import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AuthProvider } from "@/hooks/use-auth";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PromoBanner } from "@/components/PromoBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl text-foreground">404</div>
        <h1 className="mt-4 font-display text-2xl text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo que procura mudou de prateleira ou nunca existiu.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Algo correu menos bem</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente daqui a uns instantes ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#3D2415" },
      { title: "SSDoces — Brigadeiros artesanais em Guimarães" },
      {
        name: "description",
        content:
          "Brigadeiros artesanais feitos à mão em Guimarães. Ingredientes selecionados, produção em pequenos lotes, sabor inesquecível.",
      },
      { name: "author", content: "SSDoces" },
      { property: "og:site_name", content: "SSDoces" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "SSDoces — Brigadeiros artesanais em Guimarães" },
      {
        property: "og:description",
        content:
          "Doces artesanais premium, feitos com carinho em Guimarães. Recolha por marcação e entregas locais.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SSDoces — Brigadeiros artesanais em Guimarães" },
      { name: "description", content: "Cada brigadeiro é feito com carinho para tornar o seu momento ainda mais doce." },
      { property: "og:description", content: "Cada brigadeiro é feito com carinho para tornar o seu momento ainda mais doce." },
      { name: "twitter:description", content: "Cada brigadeiro é feito com carinho para tornar o seu momento ainda mais doce." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZTMSPeVpQKaLzvz6vAnCFglTxVF3/social-images/social-1782771834646-WhatsApp_Image_2026-06-29_at_23.23.43.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZTMSPeVpQKaLzvz6vAnCFglTxVF3/social-images/social-1782771834646-WhatsApp_Image_2026-06-29_at_23.23.43.webp" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Bakery",
          name: "SSDoces",
          description:
            "Brigadeiros artesanais feitos à mão em Guimarães, Portugal.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Guimarães",
            addressCountry: "PT",
          },
          servesCuisine: "Confeitaria portuguesa",
          priceRange: "€€",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="flex min-h-dvh flex-col">
            <PromoBanner />
            <SiteHeader />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
            <FloatingWhatsAppButton 
              phoneNumber="5511999999999"
              message="Olá! Gostaria de mais informações sobre os brigadeiros SSDoces. 😊"
            />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
