import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Server-side Supabase client
 * Uses the service role key for admin operations
 * ONLY to be used on the server, never expose to browser
 */
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase URL and service role key are required for server operations. ' +
      'Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data.user;
};

/**
 * Update user metadata (server-side only)
 */
export const updateUserMetadata = async (userId: string, metadata: Record<string, any>) => {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) {
    console.error('Error updating user metadata:', error);
    return null;
  }

  return data.user;
};

/**
 * Delete a user (server-side only)
 */
export const deleteUser = async (userId: string) => {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
};
