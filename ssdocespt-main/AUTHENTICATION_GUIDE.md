# Complete Authentication Guide

This guide covers the complete authentication system implemented for your TanStack Start project using Supabase.

## 📚 Table of Contents

1. [Features](#features)
2. [User Flows](#user-flows)
3. [API Reference](#api-reference)
4. [Protected Routes](#protected-routes)
5. [Session Persistence](#session-persistence)
6. [Email Verification](#email-verification)
7. [Password Management](#password-management)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## ✨ Features

### Authentication Methods
- ✅ Email & Password Sign Up
- ✅ Email & Password Sign In
- ✅ OAuth Sign In (Google, GitHub)
- ✅ Email Verification
- ✅ Forgot Password
- ✅ Reset Password
- ✅ Session Persistence
- ✅ Logout (Current Device)
- ✅ Logout All Devices

### UI Features
- ✅ Beautiful Responsive Pages
- ✅ Real-time Form Validation
- ✅ Password Strength Indicator
- ✅ Loading States
- ✅ Error Messages
- ✅ Success Notifications
- ✅ Protected Routes
- ✅ Role-Based Access Control

## 🔄 User Flows

### Sign Up Flow
```
1. User visits /sign-up
2. Enters email, password, full name
3. Agrees to terms & conditions
4. Submits form
5. Email verification sent to inbox
6. User clicks link to verify
7. Account activated
```

### Sign In Flow
```
1. User visits /login
2. Chooses: Email/Password, Google, or GitHub
3. For Email/Password:
   - Enters credentials
   - Validates and submits
   - Redirects to /dashboard
4. For OAuth:
   - Redirects to OAuth provider
   - Completes authorization
   - Redirected back to /auth/callback
   - Then to /dashboard
```

### Forgot Password Flow
```
1. User visits /forgot-password
2. Enters email address
3. Receives password reset email
4. Clicks reset link
5. Visits /reset-password
6. Sets new password
7. Redirected to /dashboard
```

### Session Persistence
```
1. User signs in
2. Session stored in localStorage & sessionStorage
3. Page refresh maintains session
4. Browser restart recovers session
5. Token auto-refreshes before expiration
```

## 🔌 API Reference

### Authentication Functions

#### Sign Up
```typescript
import { signUp } from '@/lib/supabase';

const { data, error } = await signUp('user@example.com', 'password123');
if (error) {
  console.error(error);
} else {
  console.log('Signup successful, check email');
}
```

#### Sign In
```typescript
import { signIn } from '@/lib/supabase';

const { data, error } = await signIn('user@example.com', 'password123');
if (error) {
  console.error(error);
} else {
  console.log('Logged in:', data.user);
}
```

#### OAuth Sign In
```typescript
import { signInWithOAuth } from '@/lib/supabase';

const { error } = await signInWithOAuth('google');
// or
const { error } = await signInWithOAuth('github');
```

#### Sign Out
```typescript
import { signOut } from '@/lib/supabase';

const { error } = await signOut(); // Current device
```

#### Sign Out All Devices
```typescript
import { signOutAllDevices } from '@/lib/supabase';

const { error } = await signOutAllDevices(); // All devices
```

#### Reset Password
```typescript
import { resetPassword } from '@/lib/supabase';

const { error } = await resetPassword('user@example.com');
// Sends email with reset link
```

#### Update Password
```typescript
import { updatePassword } from '@/lib/supabase';

const { error } = await updatePassword('newPassword123');
// User must be authenticated
```

#### Get Current User
```typescript
import { getCurrentUser } from '@/lib/supabase';

const user = await getCurrentUser();
if (user) {
  console.log('User:', user.email);
}
```

#### Get Session
```typescript
import { getSession } from '@/lib/supabase';

const session = await getSession();
if (session) {
  console.log('Access token:', session.access_token);
}
```

#### Resend Email
```typescript
import { resendConfirmationEmail } from '@/lib/supabase';

const { error } = await resendConfirmationEmail('user@example.com');
```

### React Hooks

#### useAuth
```typescript
import { useAuth } from '@/hooks/use-auth';

export const MyComponent = () => {
  const { user, session, loading, isAuthenticated, isEmailVerified } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <p>User: {user?.email}</p>
        <p>Email Verified: {isEmailVerified ? 'Yes' : 'No'}</p>
      </div>
    );
  }

  return <div>Please sign in</div>;
};
```

#### useAuthReady
```typescript
import { useAuthReady } from '@/hooks/use-auth';

export const MyComponent = () => {
  const isReady = useAuthReady();

  if (!isReady) return <LoadingSpinner />;

  return <YourContent />;
};
```

#### useRequireAuth
```typescript
import { useRequireAuth } from '@/hooks/use-auth';

export const ProtectedComponent = () => {
  const user = useRequireAuth(); // Throws if not authenticated

  return <div>User: {user.email}</div>;
};
```

### Route Guards

#### requireAuth
```typescript
export const Route = createFileRoute('/protected')({
  beforeLoad: async () => {
    await requireAuth(); // Redirects to /login if not authenticated
  },
  component: ProtectedPage,
});
```

#### requireGuest
```typescript
export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    await requireGuest(); // Redirects to / if already authenticated
  },
  component: LoginPage,
});
```

#### requireAdmin
```typescript
export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    await requireAdmin(); // Must have admin role
  },
  component: AdminPage,
});
```

### ProtectedRoute Component

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const MyComponent = () => {
  return (
    <ProtectedRoute>
      <ProtectedContent />
    </ProtectedRoute>
  );
};

// With email verification requirement
<ProtectedRoute requireEmailVerified>
  <VerifiedContent />
</ProtectedRoute>

// With role requirement
<ProtectedRoute requiredRole="admin">
  <AdminContent />
</ProtectedRoute>
```

## 🛡️ Protected Routes

### Available Routes

| Route | Protection | Purpose |
|-------|-----------|---------|
| `/login` | Guest only | Sign in page |
| `/sign-up` | Guest only | Registration page |
| `/forgot-password` | Public | Request password reset |
| `/reset-password` | Public | Reset password via link |
| `/auth/callback` | Public | OAuth callback handler |
| `/verify-email` | Public | Email verification prompt |
| `/dashboard` | Protected | User dashboard |
| `/account` | Protected | Account settings |

### Creating Protected Routes

```typescript
// Protect a route
export const Route = createFileRoute('/my-protected-page')({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: MyProtectedPage,
});

// Create layout for multiple protected routes
export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: AppLayout,
});
```

## 💾 Session Persistence

### How It Works

1. **Browser Storage**: Sessions stored in both `localStorage` and `sessionStorage`
2. **Auto Recovery**: Session automatically recovered on page load
3. **Token Refresh**: Access tokens automatically refreshed before expiration
4. **Event Handling**: Auth state changes trigger updates across tabs

### Session Lifecycle

```typescript
// User signs in
const { data, error } = await signIn(email, password);
// Session automatically saved

// Page refresh
// Session automatically recovered
const { user } = useAuth(); // User still available

// 59 minutes later (default expiration is 1 hour)
// Token automatically refreshed in background

// Sign out
const { error } = await signOut();
// Session cleared from storage
```

### Custom Storage

The Supabase client uses a custom storage implementation that supports both localStorage and sessionStorage:

```typescript
storage: {
  getItem: (key) => localStorage.getItem(key) || sessionStorage.getItem(key),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
}
```

## ✉️ Email Verification

### Email Verification Flow

1. **After Sign Up**:
   - Confirmation email sent automatically
   - User clicks link in email
   - Email marked as verified
   - User can access protected features

2. **Manual Verification**:
   ```typescript
   import { resendConfirmationEmail } from '@/lib/supabase';
   
   await resendConfirmationEmail('user@example.com');
   // Email resent to user
   ```

3. **Check Verification Status**:
   ```typescript
   const { user, isEmailVerified } = useAuth();
   
   if (!isEmailVerified) {
     // Show verification prompt
   }
   ```

### Verification Routes

- `/verify-email` - Shows email verification status
- Can resend confirmation email
- Countdown before allowing resend (60 seconds)

## 🔐 Password Management

### Password Requirements

- Minimum 8 characters
- Uppercase letter (A-Z)
- Lowercase letter (a-z)
- Number (0-9)
- Special character (!@#$%^&*)

### Change Password

```typescript
// In authenticated session
import { updatePassword } from '@/lib/supabase';

const { error } = await updatePassword('newPassword123');
```

### Reset Password

```typescript
// For forgotten password
import { resetPassword } from '@/lib/supabase';

const { error } = await resetPassword('user@example.com');
// Email sent with reset link
// User clicks link, enters new password
// Password updated
```

## ⚠️ Error Handling

### Common Errors

```typescript
// Email already exists
if (error?.message === 'User already registered') {
  // Handle duplicate email
}

// Invalid credentials
if (error?.message === 'Invalid login credentials') {
  // Handle login failure
}

// Email not confirmed
if (error?.message === 'Email not confirmed') {
  // Redirect to verification page
}

// Network error
if (error?.message?.includes('network')) {
  // Handle offline state
}
```

### Error States in Components

```typescript
const [error, setError] = useState<string | null>(null);

try {
  const { error } = await signIn(email, password);
  if (error) {
    setError(error.message);
  }
} catch (err) {
  setError('An unexpected error occurred');
}
```

## ✅ Best Practices

### Security
- ✅ Never store passwords in your app
- ✅ Always use HTTPS in production
- ✅ Validate input on both client and server
- ✅ Keep tokens short-lived
- ✅ Never expose service role key
- ✅ Use Row Level Security on database

### Performance
- ✅ Debounce auth state checks
- ✅ Cache user data when possible
- ✅ Use React.memo for auth-dependent components
- ✅ Minimize re-renders in AuthProvider

### UX
- ✅ Show loading states
- ✅ Provide clear error messages
- ✅ Display password strength indicator
- ✅ Allow OAuth sign-in options
- ✅ Support passwordless sign-in (magic links)
- ✅ Remember login preferences

### Code
```typescript
// ✅ Good: Use hooks in components
export const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  // ...
};

// ❌ Bad: Direct supabase access
export const MyComponent = () => {
  const user = supabase.auth.user();
  // ...
};

// ✅ Good: Type-safe queries
const { data, error } = await supabase
  .from('users')
  .select('id, email')
  .eq('id', userId)
  .single();

// ❌ Bad: Selecting all columns
const { data, error } = await supabase
  .from('users')
  .select('*');
```

## 🆘 Troubleshooting

### Session Not Persisting

**Problem**: User logged out after page refresh

**Solutions**:
1. Check if localStorage is enabled
2. Verify environment variables are set
3. Check browser console for errors
4. Clear browser storage and try again

```typescript
// Test session persistence
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

### Email Verification Not Working

**Problem**: User doesn't receive confirmation email

**Solutions**:
1. Check spam/junk folder
2. Verify email configuration in Supabase
3. Check auth logs in Supabase dashboard
4. Resend email manually

```typescript
import { resendConfirmationEmail } from '@/lib/supabase';
await resendConfirmationEmail('user@example.com');
```

### OAuth Not Working

**Problem**: OAuth sign-in fails

**Solutions**:
1. Verify OAuth provider credentials in Supabase
2. Check redirect URL matches OAuth provider settings
3. Ensure OAuth app is approved in provider console
4. Check browser console for errors

### CORS Errors

**Problem**: "CORS error" when accessing Supabase

**Solutions**:
1. Add domain to Supabase > Settings > Auth > Site URL
2. For localhost: `http://localhost:5173`
3. For production: `https://yourdomain.com`

### Password Reset Link Expires

**Problem**: "Invalid or expired link" on reset page

**Solutions**:
1. Links expire in 1 hour - request new one
2. Check email hasn't been in spam
3. Try resetting password again

## 📞 Support

For issues or questions:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## 🚀 Next Steps

1. **Set up Supabase project** if not done yet
2. **Configure email provider** for transactional emails
3. **Enable OAuth providers** (Google, GitHub)
4. **Test all auth flows** in development
5. **Set up RLS policies** on database
6. **Deploy to production**
7. **Monitor auth logs** in Supabase
8. **Track user analytics** for engagement
