import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { updatePassword, getCurrentUser } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface SearchParams {
  code?: string;
  type?: string;
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      code: search.code as string | undefined,
      type: search.type as string | undefined,
    };
  },
  component: ResetPasswordPage,
});

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-orange-500' },
    { score: 3, label: 'Good', color: 'bg-yellow-500' },
    { score: 4, label: 'Strong', color: 'bg-blue-500' },
    { score: 5, label: 'Very Strong', color: 'bg-green-500' },
    { score: 6, label: 'Very Strong', color: 'bg-green-500' },
  ];

  return levels[Math.min(score, 6)];
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/reset-password' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Check if user has a valid session (came from email link)
    const checkSession = async () => {
      const user = await getCurrentUser();
      if (!user && !search.code) {
        setIsValidToken(false);
      }
    };

    checkSession();
  }, [search.code]);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
        setPassword('');
        setConfirmPassword('');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <AuthLayout
        title="Invalid or Expired Link"
        subtitle="This password reset link is no longer valid"
      >
        <div className="space-y-6">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              The password reset link has expired or is invalid. Please request a new one.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <a
              href="/forgot-password"
              className="block w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-center rounded-lg transition-all"
            >
              Request New Reset Link
            </a>
            <a
              href="/login"
              className="block w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium text-center rounded-lg transition-all"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={isSuccess ? 'Password Reset' : 'Create New Password'}
      subtitle={isSuccess ? 'Your password has been reset successfully' : 'Enter a strong password for your account'}
    >
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess ? (
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <p className="text-gray-300">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to dashboard...
            </p>
          </div>

          <a
            href="/dashboard"
            className="block w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-center rounded-lg transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1.5">
              New Password
            </label>
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${
                        i < passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  passwordStrength.score <= 2 ? 'text-red-400' :
                  passwordStrength.score <= 3 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              At least 8 characters with uppercase, lowercase, numbers, and symbols
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs mt-1 font-medium ${
                passwordsMatch ? 'text-green-400' : 'text-red-400'
              }`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !passwordsMatch}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}