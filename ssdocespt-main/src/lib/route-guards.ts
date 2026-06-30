import { redirect } from '@tanstack/react-router';
import { supabase } from './supabase';

/**
 * Route guard for protected routes
 * Checks if user is authenticated before allowing access
 * Redirects to login if not authenticated
 */
export const requireAuth = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw redirect({
      to: '/login',
      search: {
        redirect: window.location.pathname,
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
