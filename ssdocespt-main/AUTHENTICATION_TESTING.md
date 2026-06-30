# Authentication Testing & Verification Guide

This guide will help you verify that all authentication features are working correctly.

## Pre-Setup Checklist

Before testing, ensure you have:

- [ ] Supabase project created
- [ ] API keys obtained
- [ ] `.env.local` file with credentials
- [ ] `@supabase/supabase-js` installed
- [ ] Dev server running (`bun dev`)
- [ ] Browser console open for debugging

## Test Scenarios

### ✅ Test 1: Email & Password Sign Up

**Steps:**
1. Navigate to `http://localhost:5173/sign-up`
2. Observe: Dark beautiful auth page with logo
3. Fill form:
   - Full Name: "Test User"
   - Email: "test+unique@example.com" (use new email each time)
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
4. Check Terms checkbox
5. Click "Create Account"

**Expected Results:**
- [ ] No errors displayed
- [ ] Success message appears: "Sign up successful! Please check your email to verify your account."
- [ ] Email received from noreply@example.com
- [ ] Email contains confirmation link
- [ ] Form clears after success
- [ ] Can see email in Supabase dashboard > Authentication > Users

**If Failed:**
- Check browser console for errors
- Verify email in `.env.local`
- Check Supabase Auth email settings
- Check spam folder for email

---

### ✅ Test 2: Email Verification

**Prerequisites:** Completed Test 1

**Steps:**
1. Check email for confirmation link
2. Click link in confirmation email
3. Browser should redirect to `/auth/callback`
4. Then redirect to `/dashboard`

**Expected Results:**
- [ ] Email link works
- [ ] Redirects to dashboard
- [ ] User is authenticated
- [ ] "Email Status" shows "Verified" on dashboard
- [ ] Can see in Supabase: user shows confirmed_at timestamp

**If Failed:**
- Check email for link
- Verify redirect URL in `.env.local`
- Check Supabase Auth > Site URL setting

---

### ✅ Test 3: Email & Password Sign In

**Prerequisites:** Verified email from Test 2

**Steps:**
1. Sign out by clicking "Sign Out" or visiting any public page
2. Navigate to `http://localhost:5173/login`
3. Fill form:
   - Email: email from Test 1
   - Password: "SecurePass123!"
4. Click "Sign In"

**Expected Results:**
- [ ] Form validates without errors
- [ ] "Signing in..." appears briefly
- [ ] Redirected to `/dashboard`
- [ ] Dashboard shows correct email
- [ ] Session persists on page refresh
- [ ] Can access `/account` page

**If Failed:**
- Verify credentials in Supabase dashboard
- Check password is correct
- Verify email is confirmed
- Check browser console for errors

---

### ✅ Test 4: Session Persistence

**Prerequisites:** Signed in from Test 3

**Steps:**
1. Confirm you're on dashboard and logged in
2. Refresh page (F5)
3. Observe session
4. Close browser tab (keep browser open)
5. Open new tab, navigate to localhost:5173
6. Check auth state

**Expected Results:**
- [ ] After refresh: Still logged in, no redirect
- [ ] Dashboard loads immediately with user info
- [ ] New tab: Auto-logged in if using same browser
- [ ] User info persists across tabs

**If Failed:**
- Check localStorage/sessionStorage in DevTools
- Verify Supabase client config in `src/lib/supabase.ts`
- Check browser privacy/cookie settings
- Try in private window to test

---

### ✅ Test 5: OAuth Sign In (Google)

**Prerequisites:** Google OAuth configured in Supabase

**Steps:**
1. Go to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Select Google account
4. Allow permissions
5. Browser should redirect back

**Expected Results:**
- [ ] Redirects to Google OAuth flow
- [ ] After approval, redirects to `/auth/callback`
- [ ] Then redirects to `/dashboard`
- [ ] New user created in Supabase
- [ ] Can see user in Authentication > Users

**If Failed:**
- Verify Google OAuth credentials in Supabase
- Check redirect URL matches OAuth config
- Try in incognito window
- Check console for CORS errors

---

### ✅ Test 6: OAuth Sign In (GitHub)

**Prerequisites:** GitHub OAuth configured in Supabase

**Steps:**
1. Sign out first
2. Go to `http://localhost:5173/login`
3. Click "Sign in with GitHub"
4. Authorize application
5. Browser should redirect back

**Expected Results:**
- [ ] Similar to Google test
- [ ] Can sign in with GitHub account
- [ ] User created in Supabase
- [ ] Email linked to GitHub account

**If Failed:**
- Verify GitHub OAuth app credentials
- Check redirect URL in GitHub OAuth settings
- Verify app is authorized in GitHub

---

### ✅ Test 7: Forgot Password

**Steps:**
1. Go to `http://localhost:5173/login`
2. Click "Forgot?" link
3. Redirects to `/forgot-password`
4. Enter email from Test 1
5. Click "Send Reset Link"

**Expected Results:**
- [ ] Page shows "Check Your Email" state
- [ ] Email received from Supabase
- [ ] Email contains password reset link
- [ ] Can see "Resend in 60s" countdown
- [ ] Button becomes "Resend Email" after 60 seconds

**If Failed:**
- Check email inbox and spam
- Verify email provider configured
- Try resending after countdown
- Check Supabase logs

---

### ✅ Test 8: Reset Password

**Prerequisites:** Completed Test 7

**Steps:**
1. Click password reset link in email
2. Should redirect to `/reset-password`
3. Observe form with password fields
4. Enter new password: "NewSecure456!"
5. Confirm password: "NewSecure456!"
6. Click "Reset Password"

**Expected Results:**
- [ ] Form validates password match
- [ ] Password strength indicator shows
- [ ] Success page appears after submit
- [ ] Redirects to `/dashboard` after 2 seconds
- [ ] Can sign in with new password
- [ ] Old password no longer works

**If Failed:**
- Check password meets requirements
- Verify passwords match
- Check email link is still valid (1 hour expiration)
- Check browser console for errors

---

### ✅ Test 9: Protected Routes

**Steps:**
1. Sign out completely
2. Try to visit `http://localhost:5173/dashboard`
3. Try to visit `http://localhost:5173/account`

**Expected Results:**
- [ ] Redirected to `/login`
- [ ] Can't access dashboard without logging in
- [ ] Can't access account settings without logging in
- [ ] After logging in, can access routes

**If Failed:**
- Check `requireAuth` guard implementation
- Verify route has `beforeLoad` configured
- Check console for errors

---

### ✅ Test 10: Account Settings

**Prerequisites:** Logged in from Test 3

**Steps:**
1. Go to `http://localhost:5173/account`
2. Update profile:
   - Full Name: "Updated Name"
   - Username: "newusername"
   - Bio: "Hello World"
3. Click "Save Changes"

**Expected Results:**
- [ ] Success message appears
- [ ] Fields update successfully
- [ ] Changes persist after refresh
- [ ] Changes appear in Supabase dashboard

**If Failed:**
- Check browser console for errors
- Verify user has permission to update
- Check Supabase RLS policies
- Verify profile table exists

---

### ✅ Test 11: Change Password

**Prerequisites:** Logged in from Test 3

**Steps:**
1. Go to `http://localhost:5173/account`
2. Find "Change Password" section
3. Enter new password: "AnotherPass789!"
4. Confirm: "AnotherPass789!"
5. Click "Change Password"

**Expected Results:**
- [ ] Success message appears
- [ ] Can sign out and sign in with new password
- [ ] Old password no longer works

**If Failed:**
- Check password requirements
- Verify passwords match
- Check for errors in console

---

### ✅ Test 12: Email Verification Requirement

**Steps:**
1. Create new account
2. Don't verify email (don't click link)
3. Sign in to dashboard
4. Try to access `/verify-email`

**Expected Results:**
- [ ] Can see verification prompt
- [ ] Can resend email
- [ ] Email resend countdown works
- [ ] After verifying, shows success

**If Failed:**
- Verify email configuration
- Check link in email is correct
- Verify Supabase email settings

---

### ✅ Test 13: Sign Out (Current Device)

**Prerequisites:** Logged in from Test 3

**Steps:**
1. Go to `http://localhost:5173/account`
2. Scroll to "Danger Zone"
3. Click "Sign Out All Sessions"
4. Click "Sign Out All Sessions" in confirmation

**Expected Results:**
- [ ] Signed out immediately
- [ ] Redirected to home page
- [ ] Session cleared from storage
- [ ] Can't access protected routes

**If Failed:**
- Check `signOut` function
- Verify localStorage is cleared
- Check browser DevTools > Application

---

### ✅ Test 14: Password Strength Indicator

**Steps:**
1. Go to `/sign-up`
2. Start typing in password field
3. Watch strength indicator update
4. Try passwords: weak → strong

**Expected Results:**
- [ ] Strength bar shows visually
- [ ] Label updates: "Weak" → "Strong"
- [ ] Color changes: red → orange → yellow → blue → green
- [ ] Requirements shown

**If Failed:**
- Check password strength calculation
- Verify indicator renders

---

### ✅ Test 15: Show/Hide Password

**Steps:**
1. Go to `/login` or `/sign-up`
2. Type in password field
3. Click eye icon to toggle visibility

**Expected Results:**
- [ ] Password visibility toggles
- [ ] Shows "••••" when hidden
- [ ] Shows actual text when visible
- [ ] Eye icon changes

**If Failed:**
- Check eye icon implementation
- Verify input type switches

---

### ✅ Test 16: Form Validation

**Steps:**
1. Go to `/sign-up`
2. Try submitting with empty fields
3. Try email that's already registered
4. Try weak password (less than 8 chars)
5. Try mismatched passwords

**Expected Results:**
- [ ] Required field errors show
- [ ] Email already exists error shows
- [ ] Password too weak error shows
- [ ] Passwords don't match error shows
- [ ] Submit button disabled until valid

**If Failed:**
- Check form validation logic
- Verify error messages display
- Check field requirements

---

### ✅ Test 17: Responsive Design

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test viewport sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1920px
4. Test all auth pages

**Expected Results:**
- [ ] Mobile: Single column, readable text
- [ ] Tablet: Proper spacing, centered
- [ ] Desktop: Good use of space
- [ ] No horizontal scroll
- [ ] Forms responsive

**If Failed:**
- Check TailwindCSS responsive classes
- Verify media queries
- Test in real mobile device

---

### ✅ Test 18: Error Handling

**Steps:**
1. Disable internet connection
2. Try sign in
3. Enable internet
4. Try signing in with wrong credentials
5. Try signing up with existing email

**Expected Results:**
- [ ] Network error shows user-friendly message
- [ ] Invalid credentials shows error
- [ ] Duplicate email shows error
- [ ] Errors don't crash app
- [ ] Can retry operations

**If Failed:**
- Check error handling code
- Verify error messages are helpful
- Check console for unhandled errors

---

### ✅ Test 19: Dark Theme

**Steps:**
1. Visit any auth page
2. Check design appearance
3. Verify color scheme

**Expected Results:**
- [ ] Dark background (slate-900)
- [ ] White/light text
- [ ] Gradient accents (blue/purple)
- [ ] Readable contrast
- [ ] Professional appearance

**If Failed:**
- Check TailwindCSS dark classes
- Verify background colors
- Check text colors for contrast

---

### ✅ Test 20: Browser Storage

**Steps:**
1. Sign in to account
2. Open DevTools > Application
3. Check localStorage
4. Check sessionStorage
5. Sign out

**Expected Results:**
- [ ] Session data stored after sign in
- [ ] Data includes auth token
- [ ] Data cleared after sign out
- [ ] Can see `sb-*` keys (Supabase)

**If Failed:**
- Check storage implementation
- Verify Supabase storage config
- Check browser storage settings

---

## Performance Checks

- [ ] Pages load in < 2 seconds
- [ ] Auth redirects smooth
- [ ] No console errors
- [ ] No memory leaks
- [ ] Responsive interactions instant
- [ ] Form submission fast

## Security Checks

- [ ] Session tokens not visible in URL
- [ ] Passwords not logged
- [ ] No sensitive data in localStorage (only tokens)
- [ ] HTTPS required for production
- [ ] CORS properly configured
- [ ] RLS policies enforced

## Final Verification

After all tests pass:

- [ ] All 20 tests passing
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production

## Troubleshooting Common Issues

### "Cannot find module '@supabase/supabase-js'"
```bash
bun add @supabase/supabase-js
```

### "Supabase URL and anonymous key are required"
- Check `.env.local` exists
- Verify `VITE_SUPABASE_URL` is set
- Verify `VITE_SUPABASE_ANON_KEY` is set
- Restart dev server

### "Redirect URL mismatch"
- Go to Supabase > Settings > Auth
- Add `http://localhost:5173/auth/callback`
- For production, add your domain

### "Email not received"
- Check spam folder
- Verify email in Supabase settings
- Check auth logs in Supabase
- Verify email provider configured

### "Session not persisting"
- Check localStorage is enabled
- Clear browser storage and try again
- Check browser privacy settings
- Test in private window

## Documentation References

- [Full Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- [Implementation Summary](./AUTHENTICATION_IMPLEMENTATION.md)

---

**Once all tests pass, your authentication system is production-ready! 🎉**
