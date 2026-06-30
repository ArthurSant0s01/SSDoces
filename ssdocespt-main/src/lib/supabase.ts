import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getAppOrigin, isDevelopment, logMissingSupabaseEnvironment, supabaseEnvironmentStatus } from './env';

if (!supabaseEnvironmentStatus.isConfigured) {
  logMissingSupabaseEnvironment();
}

const disabledSupabaseError = new Error(
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth and database features.'
);

function createDisabledQueryBuilder() {
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    eq: () => builder,
    neq: () => builder,
    in: () => builder,
    order: () => builder,
    range: () => builder,
    limit: () => builder,
    ilike: () => builder,
    like: () => builder,
    or: () => builder,
    filter: () => builder,
    contains: () => builder,
    textSearch: () => builder,
    schema: () => createDisabledSupabaseClient(),
    single: async () => ({ data: null, error: disabledSupabaseError }),
    maybeSingle: async () => ({ data: null, error: disabledSupabaseError }),
    then: (onFulfilled: any, onRejected: any) =>
      Promise.resolve({ data: null, error: disabledSupabaseError }).then(onFulfilled, onRejected),
  };

  return builder;
}

function createDisabledAuthApi() {
  return {
    getUser: async () => ({ data: { user: null }, error: disabledSupabaseError }),
    getSession: async () => ({ data: { session: null }, error: disabledSupabaseError }),
    signUp: async () => ({ data: { user: null, session: null }, error: disabledSupabaseError }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: disabledSupabaseError }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: disabledSupabaseError }),
    signOut: async () => ({ error: disabledSupabaseError }),
    signInWithOtp: async () => ({ data: { user: null, session: null }, error: disabledSupabaseError }),
    resetPasswordForEmail: async () => ({ data: null, error: disabledSupabaseError }),
    updateUser: async () => ({ data: { user: null }, error: disabledSupabaseError }),
    resend: async () => ({ data: null, error: disabledSupabaseError }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    }),
    admin: {
      getUserById: async () => ({ data: { user: null }, error: disabledSupabaseError }),
      updateUserById: async () => ({ data: { user: null }, error: disabledSupabaseError }),
      deleteUser: async () => ({ data: null, error: disabledSupabaseError }),
    },
  };
}

function createDisabledStorageApi() {
  return {
    from: () => ({
      upload: async () => ({ data: null, error: disabledSupabaseError }),
      download: async () => ({ data: null, error: disabledSupabaseError }),
      remove: async () => ({ data: null, error: disabledSupabaseError }),
      createSignedUrl: async () => ({ data: null, error: disabledSupabaseError }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  };
}

function createDisabledFunctionsApi() {
  return {
    invoke: async () => ({ data: null, error: disabledSupabaseError }),
  };
}

function createDisabledChannel() {
  const channel: any = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe() {},
    track: async () => ({ data: null, error: disabledSupabaseError }),
    presenceState: () => ({}),
  };

  return channel;
}

function createDisabledSupabaseClient() {
  const disabledClient: Partial<SupabaseClient<Database>> = {
    auth: createDisabledAuthApi() as SupabaseClient<Database>['auth'],
    from: () => createDisabledQueryBuilder() as any,
    storage: createDisabledStorageApi() as SupabaseClient<Database>['storage'],
    functions: createDisabledFunctionsApi() as SupabaseClient<Database>['functions'],
    channel: () => createDisabledChannel() as any,
    rpc: () => createDisabledQueryBuilder() as any,
    schema: () => disabledClient as SupabaseClient<Database>,
  };

  return disabledClient as SupabaseClient<Database>;
}

const supabase = supabaseEnvironmentStatus.isConfigured
  ? createClient<Database>(supabaseEnvironmentStatus.url!, supabaseEnvironmentStatus.anonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: typeof window !== 'undefined',
        storage: createSafeAuthStorage(),
      },
    })
  : createDisabledSupabaseClient();

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
 * Supabase client instance for the browser.
 * Falls back to a disabled client when env vars are missing so the app can still render.
 */
export { supabase };

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
  if (!isSupabaseConfigured && isDevelopment) {
    console.warn('Supabase auth listeners are disabled because the environment is missing.');
  }

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
