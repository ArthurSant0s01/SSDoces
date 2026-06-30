import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getAppOrigin, logMissingSupabaseEnvironment, supabaseEnvironmentStatus } from './env';

const supabaseUrl = supabaseEnvironmentStatus.url ?? 'https://invalid.supabase.local';
const supabaseKey = supabaseEnvironmentStatus.anonKey ?? 'missing-supabase-anon-key';

if (!supabaseEnvironmentStatus.isConfigured) {
  logMissingSupabaseEnvironment();
}

function createSafeAuthStorage() {
  const memoryStorage = new Map<string, string>();

  return {
    getItem(key: string) {
      try {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
        }
      } catch {
        // Fall back to memory storage.
      }

      return memoryStorage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      memoryStorage.set(key, value);

      if (typeof window === 'undefined') {
        return;
      }

      try {
        window.localStorage.setItem(key, value);
        window.sessionStorage.setItem(key, value);
      } catch {
        // Ignore storage failures so auth never crashes rendering.
      }
    },
    removeItem(key: string) {
      memoryStorage.delete(key);

      if (typeof window === 'undefined') {
        return;
      }

      try {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      } catch {
        // Ignore storage failures so auth never crashes rendering.
      }
    },
  };
}

/**
 * Supabase client instance for the browser
 * Uses the anonymous key for public operations
 * Configured with session persistence and auto-refresh
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined',
    storage: createSafeAuthStorage(),
  },
});

export const isSupabaseConfigured = supabaseEnvironmentStatus.isConfigured;

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error fetching user:', error);
    return null;
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error fetching session:', error);
    return null;
  }
};

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppOrigin()}/auth/callback`,
    },
  });
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async (provider: 'github' | 'google') => {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getAppOrigin()}/auth/callback`,
      skipBrowserWarning: true,
    },
  });
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  return supabase.auth.signOut();
};

/**
 * Sign out all sessions (from all devices)
 */
export const signOutAllDevices = async () => {
  return supabase.auth.signOut({ scope: 'global' });
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppOrigin()}/reset-password`,
  });
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  return supabase.auth.updateUser({
    password: newPassword,
  });
};

/**
 * Update user email
 */
export const updateEmail = async (newEmail: string) => {
  return supabase.auth.updateUser({
    email: newEmail,
  });
};

/**
 * Watch for authentication state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

/**
 * Send magic link (passwordless sign-in)
 */
export const sendMagicLink = async (email: string) => {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getAppOrigin()}/auth/callback`,
    },
  });
};

/**
 * Resend confirmation email
 */
export const resendConfirmationEmail = async (email: string) => {
  return supabase.auth.resend({
    type: 'signup',
    email,
  });
};
