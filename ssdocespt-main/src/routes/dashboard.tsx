import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/route-guards';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured, signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogOut, Settings, Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SupabaseUnavailablePage } from '@/components/SupabaseUnavailablePage';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isEmailVerified } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isSupabaseConfigured) {
    return <SupabaseUnavailablePage title="Dashboard indisponível" />;
  }

  const handleSignOut = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signOut();
      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.email}!</p>
          </div>
          <a
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Account Settings
          </a>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Verification Alert */}
        {!isEmailVerified && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <p className="font-medium mb-2">Please verify your email</p>
              <p className="text-sm mb-3">
                A confirmation link has been sent to {user?.email}
              </p>
              <a
                href="/verify-email"
                className="inline-block text-yellow-700 hover:text-yellow-900 font-medium text-sm"
              >
                Verify now →
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Email Card */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Email</h3>
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 break-all">{user?.email}</p>
          </div>

          {/* Email Verified Card */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Email Status</h3>
              <CheckCircle2 className={`w-5 h-5 ${isEmailVerified ? 'text-green-500' : 'text-gray-300'}`} />
            </div>
            <p className={`text-lg font-semibold ${isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {isEmailVerified ? 'Verified' : 'Pending'}
            </p>
          </div>

          {/* User ID Card */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">User ID</h3>
            </div>
            <p className="text-xs font-mono text-gray-500 break-all">{user?.id}</p>
          </div>
        </div>

        {/* Protected Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/account"
                className="block px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium rounded-lg transition-colors text-center"
              >
                Update Profile
              </a>
              <a
                href="/account"
                className="block px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium rounded-lg transition-colors text-center"
              >
                Change Password
              </a>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">Last Sign In</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Account Created</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">User Role</dt>
                <dd className="text-sm text-gray-900">
                  {user?.user_metadata?.role || 'User'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature
              title="Sign Up"
              description="Create a new account with email and password"
              status="active"
            />
            <Feature
              title="Sign In"
              description="Log in with your credentials or OAuth"
              status="active"
            />
            <Feature
              title="Email Verification"
              description="Verify your email address"
              status={isEmailVerified ? 'complete' : 'pending'}
            />
            <Feature
              title="Password Reset"
              description="Reset your password via email"
              status="active"
            />
            <Feature
              title="Account Settings"
              description="Update your profile and preferences"
              status="active"
            />
            <Feature
              title="Session Persistence"
              description="Your session is saved automatically"
              status="active"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureProps {
  title: string;
  description: string;
  status: 'active' | 'pending' | 'complete';
}

function Feature({ title, description, status }: FeatureProps) {
  const statusColors = {
    active: 'bg-blue-50 border-blue-200 text-blue-700',
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    complete: 'bg-green-50 border-green-200 text-green-700',
  };

  const statusLabels = {
    active: '✓ Active',
    pending: '⏳ Pending',
    complete: '✓ Complete',
  };

  return (
    <div className={`p-4 border rounded-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <span className="text-xs font-medium">{statusLabels[status]}</span>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}
