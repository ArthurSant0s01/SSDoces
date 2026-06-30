import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, onAuthStateChange } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to recover session on mount
    const recoverSession = async () => {
      try {
        // First, try to get stored session from localStorage via Supabase
        const {
          data: { session: recoveredSession },
        } = await supabase.auth.getSession();

        if (recoveredSession) {
          setSession(recoveredSession);
          setUser(recoveredSession.user);
        }
      } catch (error) {
        console.error('Error recovering session:', error);
      } finally {
        setLoading(false);
      }
    };

    recoverSession();

    // Subscribe to auth state changes
    // This handles: sign in, sign up, sign out, token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      // Handle specific events for logging or analytics
      switch (event) {
        case 'SIGNED_IN':
          console.debug('User signed in');
          break;
        case 'SIGNED_OUT':
          console.debug('User signed out');
          break;
        case 'TOKEN_REFRESHED':
          console.debug('Token refreshed');
          break;
        case 'USER_UPDATED':
          console.debug('User updated');
          break;
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const isEmailVerified = !!user?.email_confirmed_at;

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 * 
 * @example
 * const { user, isAuthenticated, loading } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to wait for auth to load
 * Useful for checking if user is authenticated before rendering
 * 
 * @example
 * const isReady = useAuthReady();
 * if (!isReady) return <LoadingSpinner />;
 */
export const useAuthReady = () => {
  const { loading } = useAuth();
  return !loading;
};

/**
 * Hook to ensure user is authenticated
 * Redirects to login if not
 * 
 * @example
 * const user = useRequireAuth();
 */
export const useRequireAuth = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (!loading && !isAuthenticated) {
    throw new Error('User not authenticated');
  }

  return user;
};
