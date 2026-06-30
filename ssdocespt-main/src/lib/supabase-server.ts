import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { logMissingSupabaseEnvironment } from './env';

/**
 * Server-side Supabase client
 * Uses the service role key for admin operations
 * ONLY to be used on the server, never expose to browser
 */
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    logMissingSupabaseEnvironment();
    return createClient<Database>('https://invalid.supabase.local', 'missing-service-role-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  if (!serviceRoleKey) {
    console.error(
      'Supabase service role key is missing. Server-side admin operations will be unavailable until SUPABASE_SERVICE_ROLE_KEY is configured.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey ?? 'missing-service-role-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Get a user by ID (server-side only)
 */
export const getUser = async (userId: string) => {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error fetching user:', error);
    return null;
  }
};

/**
 * Update user metadata (server-side only)
 */
export const updateUserMetadata = async (userId: string, metadata: Record<string, any>) => {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) {
      console.error('Error updating user metadata:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error updating user metadata:', error);
    return null;
  }
};

/**
 * Delete a user (server-side only)
 */
export const deleteUser = async (userId: string) => {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting user:', error);
    return false;
  }
};
