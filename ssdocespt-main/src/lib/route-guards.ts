import { redirect } from '@tanstack/react-router';
import { getCurrentPathname, isDevelopment } from './env';
import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Route guard for protected routes
 * Checks if user is authenticated before allowing access
 * Redirects to login if not authenticated
 */
export const requireAuth = async () => {
  if (!isSupabaseConfigured) {
    if (isDevelopment) {
      console.warn(
        'Authentication is unavailable because Supabase is not configured. Skipping auth guard and letting the route render a fallback state.'
      );
    }
    return null;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw redirect({
      to: '/login',
      search: {
        redirect: getCurrentPathname(),
      },
    });
  }

  return session;
};

/**
 * Route guard for guest-only routes (login, register, etc.)
 * Redirects to home if user is already authenticated
 */
export const requireGuest = async () => {
  if (!isSupabaseConfigured) {
    if (isDevelopment) {
      console.warn(
        'Guest auth guard skipped because Supabase is not configured. The route will render a friendly fallback page instead.'
      );
    }
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect({
      to: '/',
    });
  }

  return null;
};

/**
 * Route guard for admin-only routes
 * You may need to adjust this based on your user metadata structure
 */
export const requireAdmin = async () => {
  if (!isSupabaseConfigured) {
    if (isDevelopment) {
      console.warn(
        'Admin auth guard skipped because Supabase is not configured. The route will render a friendly fallback page instead.'
      );
    }
    return null;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw redirect({
      to: '/login',
    });
  }

  // Check if user has admin role in their metadata
  const isAdmin = session.user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    throw redirect({
      to: '/',
    });
  }

  return session;
};
