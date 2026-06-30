import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { SupabaseUnavailablePage } from '@/components/SupabaseUnavailablePage';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase SDK automatically handles the callback
        // This route is mainly for processing the auth response
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          return;
        }

        if (session) {
          // Redirect to dashboard on successful auth
          navigate({ to: '/dashboard' });
        } else {
          // No session found, redirect to login
          navigate({ to: '/login' });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  if (!isSupabaseConfigured) {
    return <SupabaseUnavailablePage title="Autenticação indisponível" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900">Authentication Error</h1>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Processing authentication...</h1>
        <p className="mt-2 text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
