import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { requireGuest } from '@/lib/route-guards';
import { signIn, signInWithOAuth } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Github, Mail } from 'lucide-react';

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    await requireGuest();
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Sign in successful! Redirecting...');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setOauthLoading(provider);

    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={oauthLoading !== null}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-4 h-4" />
          {oauthLoading === 'google' ? 'Signing in...' : 'Sign in with Google'}
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={oauthLoading !== null}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Github className="w-4 h-4" />
          {oauthLoading === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
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
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/sign-up" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create one
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
