import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, Mail } from 'lucide-react';

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { user, session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Check if email is already verified
    const checkVerification = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        setIsVerified(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    };

    checkVerification();
  }, []);

  useEffect(() => {
    // Countdown for resend button
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setError(null);
    setIsSending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        setError(error.message);
      } else {
        setCanResend(false);
        setCountdown(60);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  if (isVerified) {
    return (
      <AuthLayout title="Email Verified" subtitle="You're all set!">
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <p className="text-gray-300">
              Your email has been verified successfully!
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent you a confirmation link"
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-2">
          <p className="text-gray-300">
            We've sent a confirmation link to:
          </p>
          <p className="text-blue-400 font-medium break-all">
            {user?.email}
          </p>
        </div>

        {/* Instructions */}
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <AlertDescription className="text-blue-200 text-sm space-y-2">
            <p>Click the link in the email to verify your account.</p>
            <p>The link expires in 24 hours.</p>
            <p>Check your spam folder if you don't see the email.</p>
          </AlertDescription>
        </Alert>

        {/* Resend Section */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center">
            Didn't receive the email?
          </p>

          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Resend in {countdown}s
            </div>
          )}

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={!canResend || isSending}
            className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : canResend ? 'Resend Email' : 'Resending...'}
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <a
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}