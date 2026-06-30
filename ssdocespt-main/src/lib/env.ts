const viteEnv = import.meta.env as Record<string, string | undefined>;

function readEnvValue(key: string) {
  return viteEnv[key]?.trim() || process.env[key]?.trim() || undefined;
}

export const isDevelopment = Boolean(viteEnv.DEV || process.env.NODE_ENV !== 'production');

const supabaseUrl = readEnvValue('VITE_SUPABASE_URL');
const supabaseAnonKey = readEnvValue('VITE_SUPABASE_ANON_KEY');

export const supabaseEnvironmentStatus = {
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  missingKeys: [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
  ].filter((key): key is string => key !== null),
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};

let hasLoggedSupabaseEnvironmentIssue = false;

export function logMissingSupabaseEnvironment() {
  if (supabaseEnvironmentStatus.isConfigured || hasLoggedSupabaseEnvironmentIssue) {
    return;
  }

  hasLoggedSupabaseEnvironmentIssue = true;
  if (isDevelopment) {
    console.warn(
      `Supabase is not configured. Missing environment variables: ${supabaseEnvironmentStatus.missingKeys.join(', ')}. ` +
        'The app will continue to render, but auth and database features will be unavailable until these variables are added.'
    );
  }
}

export function getAppOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return readEnvValue('VITE_SITE_URL') || 'https://ssdoces.pt';
}

export function getCurrentPathname() {
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return window.location.pathname;
  }

  return '/';
}