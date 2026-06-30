# Supabase Configuration Guide

This document outlines the Supabase setup for this TanStack Start project.

## Overview

Supabase is an open-source Firebase alternative providing:
- PostgreSQL database
- Real-time subscriptions
- Authentication (email, OAuth, etc.)
- Row-level security (RLS)
- Edge functions
- Storage for files

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts              # Client initialization and helper functions
│   ├── database.types.ts         # TypeScript types for your database
│   └── route-guards.ts           # Route protection middleware
├── hooks/
│   └── use-auth.tsx              # Authentication context and hook
└── components/
    └── auth/
        └── AuthForm.tsx          # Example authentication form
```

## Environment Variables

1. Create a `.env.local` file in the project root (use `.env.example` as a template)

2. Required variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Get these from [Supabase Dashboard](https://app.supabase.com):
   - Navigate to Settings > API
   - Copy the Project URL and Anonymous Key (public)

⚠️ **Security Note**: Never commit `.env.local` to version control. The `.gitignore` file already excludes `*.local` files.

## Setup Instructions

### 1. Install Dependencies

```bash
# Using bun
bun add @supabase/supabase-js

# Using npm
npm install @supabase/supabase-js

# Using yarn
yarn add @supabase/supabase-js
```

### 2. Initialize Supabase Project

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the Project URL and Anonymous Key
4. Add them to your `.env.local` file

### 3. Set Up Authentication

Wrap your root component with the `AuthProvider`:

```tsx
// src/routes/__root.tsx
import { AuthProvider } from '@/hooks/use-auth';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  ),
});
```

### 4. Use Authentication in Components

```tsx
import { useAuth } from '@/hooks/use-auth';
import { signIn, signOut } from '@/lib/supabase';

export const MyComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return <div>Welcome, {user?.email}!</div>;
  }

  return <div>Please sign in</div>;
};
```

### 5. Protect Routes

Use route guards in your TanStack Router routes:

```tsx
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await requireAuth();
  },
  component: () => <Dashboard />,
});
```

## Available Functions

### Authentication

- `getCurrentUser()` - Get the current authenticated user
- `signUp(email, password)` - Register a new user
- `signIn(email, password)` - Sign in with email/password
- `signInWithOAuth(provider)` - Sign in with OAuth (GitHub, Google, etc.)
- `signOut()` - Sign out the current user
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update user's password
- `onAuthStateChange(callback)` - Listen for auth state changes

### Route Guards

- `requireAuth()` - Ensure user is authenticated
- `requireGuest()` - Ensure user is NOT authenticated (for login/signup pages)
- `requireAdmin()` - Ensure user is admin

## Database Schema Example

Create these tables in your Supabase dashboard:

### profiles
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  role text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile" on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles for update
  using (auth.uid() = id);
```

### Enable Row Level Security (RLS)

1. Go to Supabase Dashboard > Authentication
2. Enable Row Level Security on your tables
3. Create appropriate policies for access control

## Security Best Practices

1. **Never expose service role key**: Keep `SUPABASE_SERVICE_ROLE_KEY` only on server
2. **Use Row Level Security**: Enforce access control at the database level
3. **Validate input**: Always validate user input on both client and server
4. **Environment variables**: Use `VITE_*` prefix only for public variables
5. **HTTPS only**: Always use HTTPS in production (Supabase requires it)
6. **Refresh tokens**: Supabase handles token refresh automatically

## Production Checklist

- [ ] Set environment variables in your hosting platform
- [ ] Enable Row Level Security on all tables
- [ ] Configure auth providers (email, OAuth) in Supabase dashboard
- [ ] Set up email templates (password reset, confirmation, etc.)
- [ ] Test authentication flow in production environment
- [ ] Monitor Supabase logs for errors
- [ ] Set up Supabase backups
- [ ] Configure custom domain (if needed)

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Troubleshooting

### "Supabase URL and anonymous key are required"
- Ensure `.env.local` exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding env vars

### Auth state not updating
- Verify `AuthProvider` wraps your root component
- Check browser console for errors
- Ensure auth listeners are properly subscribed

### CORS errors
- Add your domain to Supabase > Settings > Auth > Site URL
- For localhost: `http://localhost:5173`

### Row Level Security denying access
- Check Supabase > SQL Editor > Policies
- Verify policies match your auth flow
- Test with Supabase dashboard RLS policies
