/**
 * Advanced Supabase Features & Patterns
 * This file demonstrates real-time subscriptions, file storage, and other advanced features
 */

import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Real-time Subscriptions
 * Listen for real-time database changes across all clients
 */

export const subscribeToTable = (
  tableName: string,
  callback: (payload: any) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const channel = supabase
    .channel(`${tableName}:*`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${tableName}`);
      } else if (status === 'CHANNEL_ERROR') {
        onError?.(new Error(`Channel error for ${tableName}`));
      }
    });

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
  };
};

/**
 * File Storage Operations
 * Upload, download, and delete files from Supabase Storage
 */

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; url: string } | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Unexpected error uploading file:', error);
    return null;
  }
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting file:', error);
    return false;
  }
};

export const getFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const getFileDownloadUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error);
    return null;
  }
};

/**
 * Edge Functions
 * Call Supabase Edge Functions for complex server-side logic
 */

export const callEdgeFunction = async <T = any>(
  functionName: string,
  payload?: Record<string, any>
): Promise<{ data: T; error: any } | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`Error calling edge function ${functionName}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error calling edge function ${functionName}:`, error);
    return null;
  }
};

/**
 * Example: Process payment via Edge Function
 */
export const processPayment = async (
  amount: number,
  paymentMethodId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  const result = await callEdgeFunction('process-payment', {
    amount,
    paymentMethodId,
  });

  if (!result || result.error) {
    return {
      success: false,
      error: 'Payment processing failed',
    };
  }

  return {
    success: true,
    transactionId: result.data.transactionId,
  };
};

/**
 * Real-time Presence
 * Track user presence and online status
 */

export const initializePresence = (userId: string, metadata?: Record<string, any>) => {
  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Active users:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          ...metadata,
          last_seen: new Date().toISOString(),
        });
      }
    });

  return channel;
};

/**
 * Database Full Text Search
 * Search across text fields efficiently
 */

export const fullTextSearch = async (
  tableName: string,
  searchColumn: string,
  query: string,
  limit: number = 10
): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .textSearch(searchColumn, query)
      .limit(limit);

    if (error) {
      console.error('Error searching:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error searching:', error);
    return null;
  }
};

/**
 * Retry Logic with Exponential Backoff
 * Useful for handling rate limits and transient failures
 */

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T | null> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      console.warn(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error('All retry attempts failed:', lastError);
  return null;
};

/**
 * Batch Insert with Error Handling
 * Efficiently insert multiple rows with error recovery
 */

export const batchInsertWithFallback = async (
  tableName: string,
  rows: any[],
  batchSize: number = 1000
): Promise<{ inserted: number; failed: number }> => {
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();

      if (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        failed += batch.length;
      } else {
        inserted += data?.length || batch.length;
      }
    } catch (error) {
      console.error(`Batch ${i / batchSize + 1} unexpected error:`, error);
      failed += batch.length;
    }
  }

  return { inserted, failed };
};

/**
 * Reactive Query Hook Setup
 * For use in React components with real-time updates
 */

export const useRealtimeTable = (
  tableName: string,
  callback: (data: any[]) => void
): (() => void) => {
  // This would be used in a React hook to manage subscriptions
  return subscribeToTable(tableName, callback);
};

/**
 * Error Handling Utilities
 */

export const handleSupabaseError = (error: any): string => {
  if (error.code === 'PGRST301') {
    return 'The result contains too many rows. Please filter your query.';
  }

  if (error.code === 'PGRST306') {
    return 'Not more than 100 rows can be deleted at a time. Please batch your deletes.';
  }

  if (error.message?.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }

  if (error.message?.includes('connection')) {
    return 'Network connection error. Please check your internet.';
  }

  return error.message || 'An unknown error occurred.';
};
