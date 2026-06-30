import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
  requiredRole?: 'user' | 'admin';
}

/**
 * ProtectedRoute Component
 * Wraps components to enforce authentication and other requirements
 * 
 * @example
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute requireEmailVerified>
 *   <RestrictedContent />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  requireEmailVerified = false,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    if (!loading && requireEmailVerified && !user?.email_confirmed_at) {
      navigate({ to: '/verify-email' });
      return;
    }

    if (!loading && requiredRole && user?.user_metadata?.role !== requiredRole) {
      navigate({ to: '/' });
      return;
    }
  }, [loading, isAuthenticated, user, requireEmailVerified, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireEmailVerified && !user?.email_confirmed_at) {
    return null;
  }

  if (requiredRole && user?.user_metadata?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access this page</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * useProtectedRoute Hook
 * Use this hook in your route components for more control
 * 
 * @example
 * const { user, isAllowed } = useProtectedRoute('admin');
 * if (!isAllowed) return <div>Not allowed</div>;
 */
export const useProtectedRoute = (requiredRole?: string) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [loading, isAuthenticated, navigate]);

  const isAllowed = !requiredRole || user?.user_metadata?.role === requiredRole;

  return {
    user,
    isAuthenticated,
    loading,
    isAllowed,
  };
};
