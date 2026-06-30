const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

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
  console.error(
    `Supabase is not configured. Missing environment variables: ${supabaseEnvironmentStatus.missingKeys.join(', ')}. ` +
      'The app will continue to render, but auth and database features will be unavailable until these variables are added.'
  );
}

export function getAppOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return import.meta.env.VITE_SITE_URL || 'https://ssdoces.com.br';
}

export function getCurrentPathname() {
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return window.location.pathname;
  }

  return '/';
}