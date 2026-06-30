import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and anonymous key are required. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
  );
}

/**
 * Supabase client instance for the browser
 * Uses the anonymous key for public operations
 * Configured with session persistence and auto-refresh
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session across browser tabs and refreshes
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Storage options for better session persistence
    storage: {
      getItem: (key: string) => {
        // Use localStorage with fallback to sessionStorage
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        // Store in both localStorage and sessionStorage
        localStorage.setItem(key, value);
        sessionStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      },
    },
  },
});

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
      // Redirect URL for email confirmation
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      // Redirect after OAuth flow
      redirectTo: `${window.location.origin}/auth/callback`,
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
    redirectTo: `${window.location.origin}/reset-password`,
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
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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
