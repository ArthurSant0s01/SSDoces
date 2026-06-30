# SSDoces Database Deployment Checklist

Complete checklist for deploying the SSDoces database to Supabase production.

## Pre-Deployment

### ✅ Database Design Review
- [x] All 12 tables defined
- [x] Relationships mapped
- [x] Constraints validated
- [x] Indexes planned
- [x] RLS policies designed
- [x] Views created
- [x] Functions implemented

### ✅ Backup & Recovery Plan
- [ ] Backup strategy documented
- [ ] Restore procedure tested
- [ ] Recovery time objective (RTO) defined: 1 hour
- [ ] Recovery point objective (RPO) defined: 1 day
- [ ] Backup location: Supabase automated + manual exports
- [ ] Backup frequency: Daily

### ✅ Security Audit
- [ ] RLS policies reviewed
- [ ] Admin role restricted
- [ ] Service role key stored securely
- [ ] API keys rotated
- [ ] Sensitive data identified
- [ ] Encryption at rest enabled
- [ ] SSL/TLS enforced

### ✅ Performance Baseline
- [ ] Query performance profiled
- [ ] Index coverage analyzed
- [ ] Schema normalized
- [ ] Partitioning strategy evaluated
- [ ] Cache strategy planned

---

## Deployment Steps

### Step 1: Prepare Supabase Project
- [ ] Create Supabase project
- [ ] Navigate to SQL Editor
- [ ] Set project timezone to America/Sao_Paulo
- [ ] Enable extensions if needed

### Step 2: Run Migration 1 - Schema
```
File: migrations/001_create_ssDoces_schema.sql
```

**Actions:**
- [ ] Copy entire SQL file
- [ ] Create new query in SQL Editor
- [ ] Paste SQL content
- [ ] Review for syntax errors
- [ ] Execute migration
- [ ] Verify: 12 tables created

**Expected Output:**
```
✓ 12 tables created
✓ 40+ indexes created
✓ RLS enabled on all tables
✓ 12 sets of policies created
✓ Triggers created
✓ Functions created
```

**Verification Query:**
```sql
SELECT count(*) as table_count FROM pg_tables WHERE schemaname = 'public';
-- Should return: 13 (12 + audit_log)

SELECT count(*) as index_count FROM pg_indexes WHERE schemaname = 'public';
-- Should return: 40+

SELECT count(*) as policy_count FROM pg_policies;
-- Should return: 30+
```

**Rollback Plan:**
```sql
-- If needed, drop all tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS newsletter CASCADE;
DROP TABLE IF EXISTS loyalty_points CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
```

### Step 3: Run Migration 2 - Sample Data
```
File: migrations/002_seed_sample_data.sql
```

**Actions:**
- [ ] Copy SQL file
- [ ] Create new query
- [ ] Execute migration
- [ ] Verify: Sample data inserted

**Expected Output:**
```
✓ 5 categories inserted
✓ 5 products inserted
✓ Inventory records created
✓ Newsletter subscribers added
✓ Sample coupons created
```

**Verification Query:**
```sql
SELECT 'categories' as table, count(*) as count FROM categories
UNION ALL
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'coupons', count(*) FROM coupons;
```

**Rollback Plan:**
```sql
-- Delete all sample data
DELETE FROM notifications;
DELETE FROM notifications CASCADE;
DELETE FROM audit_log;
DELETE FROM newsletter;
DELETE FROM loyalty_points;
DELETE FROM order_items CASCADE;
DELETE FROM orders CASCADE;
DELETE FROM coupons;
DELETE FROM favorites;
DELETE FROM reviews;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM categories;
```

### Step 4: Run Migration 3 - Advanced Features
```
File: migrations/003_advanced_features.sql
```

**Actions:**
- [ ] Copy SQL file
- [ ] Create new query
- [ ] Execute migration
- [ ] Verify: Views and functions created

**Expected Output:**
```
✓ 5 views created
✓ Reporting functions created
✓ Full-text search configured
✓ Notification helpers created
✓ Audit logging enabled
```

**Verification Query:**
```sql
SELECT count(*) as view_count FROM pg_views WHERE schemaname = 'public';
-- Should return: 5+

SELECT count(*) as function_count FROM pg_proc 
WHERE schemaname = 'public' AND prokind = 'f';
-- Should return: 10+
```

### Step 5: Configure Authentication
- [ ] Enable Row Level Security
- [ ] Create admin user:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'admin@ssdoces.com';
  ```
- [ ] Create test customer users
- [ ] Test RLS policies with each role

### Step 6: Test Data Access
- [ ] Test public access (active categories/products)
- [ ] Test user access (own orders/reviews)
- [ ] Test admin access (all data)
- [ ] Test insert permissions
- [ ] Test update permissions
- [ ] Test delete permissions

### Step 7: Enable Backups
- [ ] Go to Project Settings > Backups
- [ ] Enable daily automated backups
- [ ] Set backup window: 2 AM UTC
- [ ] Set retention: 30 days
- [ ] Test backup restoration

### Step 8: Enable Monitoring
- [ ] Set up query performance monitoring
- [ ] Configure alerts for slow queries
- [ ] Monitor database size growth
- [ ] Review logs for errors

### Step 9: Documentation
- [ ] Update API documentation
- [ ] Create database diagram
- [ ] Document RLS policies
- [ ] Create query examples
- [ ] Document backup procedure

### Step 10: Go-Live
- [ ] Update application .env with correct credentials
- [ ] Test full application flow
- [ ] Run smoke tests
- [ ] Monitor for errors
- [ ] Have rollback plan ready

---

## Post-Deployment

### Day 1: Monitor
- [ ] Check query performance
- [ ] Review error logs
- [ ] Monitor database connections
- [ ] Verify backups running
- [ ] Test all user flows

### Week 1: Optimize
- [ ] Analyze slow queries
- [ ] Add indexes if needed
- [ ] Adjust RLS if performance impacted
- [ ] Review storage usage
- [ ] Document performance baseline

### Month 1: Review
- [ ] Audit all RLS policies
- [ ] Review database growth
- [ ] Check backup restore success
- [ ] Analyze user patterns
- [ ] Plan future scaling

---

## Table Creation Dependency Order

**IMPORTANT:** Create tables in this order due to foreign key constraints:

1. ✅ `profiles` - Extends auth.users
2. ✅ `categories` - Independent
3. ✅ `products` - References categories
4. ✅ `inventory` - References products
5. ✅ `reviews` - References products, profiles
6. ✅ `favorites` - References products, profiles
7. ✅ `coupons` - Independent
8. ✅ `orders` - References profiles, coupons
9. ✅ `order_items` - References orders, products
10. ✅ `loyalty_points` - References profiles
11. ✅ `newsletter` - References profiles
12. ✅ `notifications` - References profiles, orders

---

## RLS Policies Deployment

All RLS policies are created in Migration 1. Verify with:

```sql
-- List all policies
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
ORDER BY tablename;

-- Test policy effectiveness
SET ROLE authenticated;  -- Switch to user role
SELECT * FROM orders;     -- Should only see own orders

SET ROLE postgres;        -- Switch back to admin
```

---

## Performance Targets

Set performance expectations for capacity planning:

| Metric | Target | Notes |
|--------|--------|-------|
| Max Users | 10,000 | Before vertical scaling needed |
| Max Orders/Day | 1,000 | Before query optimization needed |
| Max Products | 1,000 | Typical e-commerce scale |
| Query P99 | 200ms | 99th percentile response time |
| DB Size | 1 GB | Before archiving needed |
| Connections | 20 | Supabase default |

---

## Scaling Plan

If you exceed targets, implement:

1. **Database:**
   - [ ] Partition large tables by date
   - [ ] Archive old orders (> 1 year)
   - [ ] Read replicas for analytics
   - [ ] Connection pooling optimization

2. **Application:**
   - [ ] Implement caching layer (Redis)
   - [ ] Add CDN for static assets
   - [ ] Optimize queries (N+1 prevention)
   - [ ] Batch operations

3. **Infrastructure:**
   - [ ] Upgrade Supabase plan
   - [ ] Enable point-in-time recovery
   - [ ] Set up automated failover
   - [ ] Monitor resource usage

---

## Emergency Procedures

### Database Connection Issues
```sql
-- Check current connections
SELECT count(*) as active_connections FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - INTERVAL '1 hour';
```

### Corrupted Index
```sql
-- Reindex table
REINDEX TABLE products;

-- Or specific index
REINDEX INDEX idx_products_slug;
```

### RLS Policy Issue
```sql
-- Temporarily disable RLS (ADMIN ONLY)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### Data Recovery
```sql
-- Restore from backup via Supabase Dashboard:
-- Project Settings > Backups > Restore from backup
```

---

## Rollback Procedures

### Full Rollback (if deployment fails)
1. Go to Supabase Project Settings > Backups
2. Click "Restore" on latest backup before migration
3. Verify data integrity
4. Notify team of rollback

### Partial Rollback (specific table)
```sql
-- Delete problematic table and recreate
DROP TABLE IF EXISTS new_table CASCADE;

-- Run migration for just that table
-- Test thoroughly before deploying again
```

---

## Deployment Communication

### Pre-Deployment Notice
```
Date: [deployment date]
Time: [start time - end time] UTC
Duration: [estimated duration]
Impact: Database schema update, no downtime expected
Backout Plan: Automatic via Supabase backup restore
```

### Post-Deployment Verification
```
✓ All tables created successfully
✓ Indexes created and active
✓ RLS policies enforced
✓ Sample data loaded
✓ Views operational
✓ Functions available
✓ Performance baseline met
✓ Backups running
✓ Monitoring active
```

---

## Sign-Off

- [ ] **Database Admin**: Deployment verified
- [ ] **Application Team**: Integration tested
- [ ] **Security Team**: RLS policies approved
- [ ] **Operations Team**: Monitoring configured
- [ ] **Project Manager**: Go-live approved

---

## Appendix: Quick Reference

### Common Commands

**Check table count:**
```sql
SELECT count(*) FROM pg_tables WHERE schemaname = 'public';
```

**Check index count:**
```sql
SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';
```

**Check RLS policies:**
```sql
SELECT tablename, count(*) FROM pg_policies GROUP BY tablename;
```

**Check database size:**
```sql
SELECT pg_size_pretty(pg_database_size('ssdoces'));
```

**Check table sizes:**
```sql
SELECT * FROM vw_table_stats;
```

---

**Created:** 2026-06-30  
**Version:** 1.0  
**Status:** Ready for Deployment
