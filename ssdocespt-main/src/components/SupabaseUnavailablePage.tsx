type SupabaseUnavailablePageProps = {
  title?: string;
  message?: string;
};

export function SupabaseUnavailablePage({
  title = 'Serviço temporariamente indisponível',
  message =
    'A aplicação está online, mas a integração com Supabase não está configurada neste ambiente. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar autenticação e dados dinâmicos.',
}: SupabaseUnavailablePageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Configuração pendente
        </div>
        <h1 className="mt-3 font-display text-3xl text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          A página principal continua disponível e o restante da interface pode ser navegado.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Voltar ao início
          </a>
          <a
            href="mailto:sosdoces.pt@gmail.com"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Falar com suporte
          </a>
        </div>
      </div>
    </div>
  );
}