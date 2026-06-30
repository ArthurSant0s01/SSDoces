import { supabase } from './supabase';
import type { Database } from './database.types';

/**
 * Type-safe Supabase queries using TypeScript
 * This file demonstrates best practices for working with Supabase
 */

// Type definitions for better DX
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Fetch user profile
 */
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

/**
 * Create a new profile
 */
export const createProfile = async (
  profile: ProfileInsert
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
};

/**
 * Delete user profile
 */
export const deleteProfile = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting profile:', error);
    return false;
  }

  return true;
};

/**
 * Fetch profiles with pagination
 */
export const fetchProfiles = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ profiles: Profile[]; total: number; hasMore: boolean } | null> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) {
    console.error('Error fetching profiles:', error);
    return null;
  }

  return {
    profiles: data,
    total: count || 0,
    hasMore: (count || 0) > end + 1,
  };
};

/**
 * Search profiles by username
 */
export const searchProfiles = async (
  query: string
): Promise<Profile[] | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`);

  if (error) {
    console.error('Error searching profiles:', error);
    return null;
  }

  return data;
};

/**
 * Subscribe to real-time profile updates
 */
export const subscribeToProfile = (
  userId: string,
  callback: (profile: Profile) => void
) => {
  const channel = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Profile);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

/**
 * Batch operations
 */
export const batchCreateProfiles = async (
  profiles: ProfileInsert[]
): Promise<Profile[] | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profiles)
    .select();

  if (error) {
    console.error('Error batch creating profiles:', error);
    return null;
  }

  return data;
};

/**
 * Transaction-like operations (manual)
 * Note: Supabase doesn't have native transaction support in JS SDK
 * Implement logic to handle failures appropriately
 */
export const transferBetweenUsers = async (
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<boolean> => {
  try {
    // This is a simplified example
    // In production, use Supabase Edge Functions for transactional logic
    
    const fromProfile = await fetchProfile(fromUserId);
    const toProfile = await fetchProfile(toUserId);

    if (!fromProfile || !toProfile) {
      throw new Error('One or both users not found');
    }

    // Perform transfer
    const updated = await Promise.all([
      updateProfile(fromUserId, { bio: 'Updated' }),
      updateProfile(toUserId, { bio: 'Updated' }),
    ]);

    return updated.every((u) => u !== null);
  } catch (error) {
    console.error('Error transferring between users:', error);
    return false;
  }
};

/**
 * Error handling patterns
 */
export const handleDatabaseError = (
  error: any
): { message: string; code?: string } => {
  // Supabase specific errors
  if (error.code === 'PGRST116') {
    return { message: 'Record not found', code: error.code };
  }

  if (error.code === '23505') {
    return { message: 'Duplicate entry', code: error.code };
  }

  if (error.code === '42P01') {
    return { message: 'Table not found', code: error.code };
  }

  // Network errors
  if (error.message?.includes('network')) {
    return { message: 'Network error. Please check your connection.' };
  }

  // Generic error
  return { message: 'An error occurred. Please try again.' };
};
