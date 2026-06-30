import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { isSupabaseConfigured, resetPassword } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { SupabaseUnavailablePage } from '@/components/SupabaseUnavailablePage';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  if (!isSupabaseConfigured) {
    return <SupabaseUnavailablePage title="Recuperação de senha indisponível" />;
  }

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      } else {
        setIsSubmitted(true);
        setEmail('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? 'Check Your Email' : 'Reset Password'}
      subtitle={isSubmitted ? 'Follow the link to reset your password' : 'Enter your email to receive a reset link'}
    >
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {isSubmitted ? (
        <div className="space-y-6">
          {/* Success State */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <p className="text-gray-300">
              We've sent a password reset link to:
            </p>
            <p className="text-blue-400 font-medium break-all">{email}</p>
          </div>

          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertDescription className="text-blue-200 text-sm">
              The reset link expires in 1 hour. If you don't see the email, check your spam folder.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">
              Didn't receive the email?
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all"
            >
              Try another email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the email address associated with your account
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </a>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}