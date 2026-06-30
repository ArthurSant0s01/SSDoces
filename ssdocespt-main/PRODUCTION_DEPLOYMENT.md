# Production Deployment Guide for Supabase

This guide covers the steps needed to deploy your TanStack Start application with Supabase to production.

## Pre-Deployment Checklist

### Database & Security
- [ ] Set up Row Level Security (RLS) policies on all tables
- [ ] Create database tables and migrations
- [ ] Set up backups in Supabase dashboard
- [ ] Review and test all RLS policies
- [ ] Enable SSL connection requirement
- [ ] Set up database user roles (separate read-only user if needed)

### Authentication
- [ ] Configure email templates in Supabase (confirmation, password reset, magic link)
- [ ] Enable/disable auth providers (email, OAuth) as needed
- [ ] Set up OAuth apps (GitHub, Google, etc.) with production URLs
- [ ] Configure email sending (SendGrid, Mailgun, etc.)
- [ ] Set up MFA if required
- [ ] Configure session duration and refresh token settings

### Application
- [ ] Review all environment variables
- [ ] Test all authentication flows
- [ ] Verify route protection works correctly
- [ ] Test error handling and user feedback
- [ ] Audit for console errors and warnings
- [ ] Test on mobile devices
- [ ] Performance testing with Lighthouse

### Security
- [ ] Install and run security audits: `npm audit`, `bun audit`
- [ ] Review dependencies for vulnerabilities
- [ ] Enable HTTPS only (Supabase requires it)
- [ ] Set Content Security Policy headers
- [ ] Configure CORS if needed
- [ ] Review API keys usage

## Environment Variables Setup

### Supabase Dashboard Variables

1. Get from Supabase Dashboard > Settings > API:
   - Project URL
   - Anon Key (public)
   - Service Role Key (SECRET - server only)

2. Get from Supabase Dashboard > Authentication > Providers:
   - OAuth provider credentials
   - Email provider settings

### Deploy Environment Variables

Set these in your hosting platform's environment variables section:

```
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` is SECRET and should NEVER be exposed publicly. Only set this in server-side environments.

## Hosting Platforms

### Vercel (Recommended for Next.js, but works with TanStack Start via Nitro)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
git push origin main
```

### Netlify

1. Connect your GitHub repository
2. Set build command: `bun build` (or `npm run build`)
3. Set publish directory: `dist`
4. Add environment variables in Build & Deploy settings
5. Deploy

### Your Own Server (VPS/Docker)

1. Build the application:
```bash
bun build
```

2. Create a `.env.production` file with production values

3. Start the server:
```bash
bun preview
```

4. Use a reverse proxy (Nginx) for HTTPS and caching

## Database Migrations

When you make schema changes:

1. **Local Development**:
   - Create/modify tables in Supabase dashboard
   - Update `src/lib/database.types.ts` with `supabase gen types`

2. **Production**:
   - Use Supabase SQL migrations
   - Test migrations locally first
   - Apply migrations before deploying code

### Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types from your production database
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

## Monitoring & Logging

### Supabase Monitoring

1. Navigate to Supabase Dashboard > Logs
2. Monitor:
   - Auth logs
   - Database queries
   - API usage
   - Error rates

### Application Monitoring

Integrate error tracking:

```tsx
// Example: Sentry Integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Metrics to Track

- User signup/login success rate
- Page load times
- Database query performance
- Error rates
- Active user count

## Backup Strategy

### Supabase Backups

1. Go to Supabase Dashboard > Settings > Backups
2. Enable automatic backups (daily)
3. Keep at least 7 days of backups
4. Schedule weekly manual exports

### Restore from Backup

1. Supabase Dashboard > Settings > Backups
2. Click "Restore" on desired backup
3. Confirm restoration (this creates a new instance)
4. Test before switching

## SSL/TLS Certificate

Supabase automatically provides SSL certificates. Ensure:

1. HTTPS is enforced: `https://your-domain.com`
2. Certificate is valid in browser
3. No mixed content (HTTP + HTTPS)

## Performance Optimization

### Database

- [ ] Add indexes on frequently queried columns
- [ ] Optimize queries to minimize data transfer
- [ ] Use pagination for large result sets
- [ ] Consider edge functions for complex logic

### Application

- [ ] Enable code splitting and lazy loading
- [ ] Optimize images and assets
- [ ] Use CDN for static files
- [ ] Implement caching strategies

### Example: Query Optimization

```tsx
// ❌ Bad - fetches all data
const { data } = await supabase
  .from('posts')
  .select('*');

// ✅ Good - select specific columns and limit results
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at')
  .limit(10);
```

## Disaster Recovery

### Create a Runbook

Document:
1. How to restore from backup
2. How to roll back code
3. How to scale database
4. How to handle security breaches

### Test Recovery Plans

- [ ] Restore from backup (monthly)
- [ ] Rollback code (after each deploy)
- [ ] Scale database under load
- [ ] Simulate data loss scenario

## Scaling

### When to Scale

- [ ] Database approaching row/storage limits
- [ ] API response times degrading
- [ ] Request rate limits being hit
- [ ] Error rates increasing

### Scaling Options

1. **Supabase Plan Upgrade**:
   - Upgrade from Free to Pro tier
   - Increase compute resources

2. **Database Optimization**:
   - Add indexes
   - Archive old data
   - Partition large tables

3. **Application**:
   - Implement caching layer (Redis)
   - Add CDN for static content
   - Optimize queries

## Post-Deployment

### Monitoring First Week

- [ ] Monitor error logs daily
- [ ] Check user feedback for issues
- [ ] Verify all auth flows working
- [ ] Check performance metrics
- [ ] Monitor database performance

### Long-term Maintenance

- [ ] Monthly security audits
- [ ] Quarterly dependency updates
- [ ] Review costs and optimize
- [ ] Archive old logs
- [ ] Update documentation

## Troubleshooting

### Common Issues

**CORS Errors**
```
Solution: Add domain to Supabase > Settings > Auth > Site URL
```

**Auth State Not Persisting**
```
Solution: Verify browser localStorage is enabled
```

**Database Connection Timeout**
```
Solution: Check connection string, network issues, or upgrade plan
```

**High Latency**
```
Solution: Review slow queries in Supabase > Logs
```

## Additional Resources

- [Supabase Deployment Docs](https://supabase.com/docs/guides/hosting/overview)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/framework/react/guide/ssr-deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Netlify Deployment Guide](https://docs.netlify.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Support

For issues:

1. Check [Supabase Documentation](https://supabase.com/docs)
2. Visit [Supabase Discord Community](https://discord.supabase.com)
3. Check [GitHub Issues](https://github.com/supabase/supabase/issues)
4. Contact [Supabase Support](https://app.supabase.com/support/new)
