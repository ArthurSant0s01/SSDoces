-- SSDoces Advanced SQL Features & Views
-- Useful queries, views, and helper functions for common operations

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View: Products with inventory and rating info
CREATE OR REPLACE VIEW vw_products_detailed AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.category_id,
  c.name AS category_name,
  p.price,
  p.discount_price,
  CASE
    WHEN p.discount_price IS NOT NULL
    THEN ROUND(((p.price - p.discount_price) / p.price * 100)::numeric, 2)
    ELSE 0
  END AS discount_percentage,
  p.image_url,
  p.is_featured,
  p.is_active,
  p.rating,
  p.rating_count,
  i.quantity_available,
  i.quantity_reserved,
  (i.quantity_available - i.quantity_reserved) AS quantity_sellable,
  i.low_stock_alert,
  p.created_at,
  p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.is_active = TRUE;

-- View: Customer orders with total summary
CREATE OR REPLACE VIEW vw_orders_summary AS
SELECT
  o.id,
  o.order_number,
  o.user_id,
  p.full_name,
  p.email,
  COUNT(oi.id) AS item_count,
  SUM(oi.quantity) AS total_quantity,
  o.subtotal,
  o.tax,
  o.shipping_cost,
  o.discount_amount,
  o.total,
  o.status,
  o.payment_status,
  o.created_at,
  o.updated_at
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY
  o.id, o.order_number, o.user_id, p.full_name, p.email,
  o.subtotal, o.tax, o.shipping_cost, o.discount_amount, o.total,
  o.status, o.payment_status, o.created_at, o.updated_at;

-- View: Product reviews with user info
CREATE OR REPLACE VIEW vw_reviews_detailed AS
SELECT
  r.id,
  r.product_id,
  p.name AS product_name,
  r.user_id,
  pr.full_name AS user_name,
  pr.avatar_url,
  r.rating,
  r.title,
  r.content,
  r.is_verified_purchase,
  r.status,
  (r.helpful_count + r.unhelpful_count) AS total_votes,
  r.created_at,
  r.updated_at
FROM reviews r
LEFT JOIN products p ON r.product_id = p.id
LEFT JOIN profiles pr ON r.user_id = pr.id
WHERE r.status = 'approved'
ORDER BY r.created_at DESC;

-- View: Sales analytics by category
CREATE OR REPLACE VIEW vw_sales_by_category AS
SELECT
  c.id,
  c.name,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(oi.quantity) AS total_items_sold,
  SUM(oi.total_price) AS total_revenue,
  AVG(p.rating) AS avg_product_rating,
  DATE_TRUNC('month', o.created_at) AS month
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled')
GROUP BY c.id, c.name, DATE_TRUNC('month', o.created_at);

-- View: Customer loyalty status
CREATE OR REPLACE VIEW vw_customer_loyalty AS
SELECT
  p.id,
  p.email,
  p.full_name,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS lifetime_spending,
  COALESCE(lp.total_points, 0) AS loyalty_points,
  COALESCE(lp.tier, 'bronze') AS loyalty_tier,
  MAX(o.created_at) AS last_order_date,
  p.created_at AS customer_since
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id AND o.status NOT IN ('cancelled')
LEFT JOIN loyalty_points lp ON p.id = lp.user_id
GROUP BY p.id, p.email, p.full_name, lp.total_points, lp.tier, p.created_at;

-- ============================================================================
-- REPORTING FUNCTIONS
-- ============================================================================

-- Function: Get sales statistics for a date range
CREATE OR REPLACE FUNCTION get_sales_stats(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE (
  total_revenue DECIMAL,
  total_orders BIGINT,
  avg_order_value DECIMAL,
  total_customers BIGINT,
  repeat_customers BIGINT
) AS $$
WITH order_stats AS (
  SELECT
    COUNT(*) as order_count,
    SUM(total) as total_rev,
    COUNT(DISTINCT user_id) as customer_count,
    SUM(CASE WHEN user_id IN (
      SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) > 1
    ) THEN 1 ELSE 0 END) as repeat_count
  FROM orders
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date
    AND status NOT IN ('cancelled')
)
SELECT
  ROUND(total_rev::numeric, 2) as total_revenue,
  order_count,
  ROUND((total_rev::numeric / NULLIF(order_count, 0)), 2) as avg_order_value,
  customer_count,
  repeat_count
FROM order_stats;
$$ LANGUAGE SQL STABLE;

-- Function: Get top products by sales
CREATE OR REPLACE FUNCTION get_top_products(
  p_limit INTEGER DEFAULT 10,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  quantity_sold BIGINT,
  revenue DECIMAL,
  avg_rating DECIMAL
) AS $$
SELECT
  p.id,
  p.name,
  SUM(oi.quantity)::BIGINT,
  ROUND(SUM(oi.total_price)::numeric, 2),
  p.rating
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= CURRENT_TIMESTAMP - (p_period_days || ' days')::INTERVAL
  AND o.status NOT IN ('cancelled')
GROUP BY p.id, p.name, p.rating
ORDER BY SUM(oi.total_price) DESC
LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- Function: Get customer purchase history
CREATE OR REPLACE FUNCTION get_customer_purchases(p_user_id UUID)
RETURNS TABLE (
  order_number TEXT,
  order_date TIMESTAMP,
  total_amount DECIMAL,
  item_count INTEGER,
  status TEXT
) AS $$
SELECT
  o.order_number,
  o.created_at,
  o.total,
  COUNT(oi.id)::INTEGER,
  o.status
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = p_user_id
GROUP BY o.id, o.order_number, o.created_at, o.total, o.status
ORDER BY o.created_at DESC;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

-- Procedure: Update product ratings based on reviews
CREATE OR REPLACE FUNCTION update_product_ratings()
RETURNS TABLE (
  product_id UUID,
  old_rating DECIMAL,
  new_rating DECIMAL,
  review_count INTEGER
) AS $$
UPDATE products p
SET
  rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM reviews r
    WHERE r.product_id = p.id AND r.status = 'approved'
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.product_id = p.id AND r.status = 'approved'
  )
WHERE p.id IN (
  SELECT DISTINCT product_id FROM reviews WHERE updated_at > NOW() - INTERVAL '1 hour'
)
RETURNING
  p.id,
  p.rating,
  (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE product_id = p.id AND status = 'approved'),
  (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND status = 'approved')::INTEGER;
$$ LANGUAGE SQL;

-- Procedure: Archive old orders
CREATE OR REPLACE FUNCTION archive_old_orders(p_days INTEGER DEFAULT 365)
RETURNS TABLE (
  archived_count BIGINT,
  total_archived_value DECIMAL
) AS $$
WITH archived AS (
  UPDATE orders
  SET updated_at = CURRENT_TIMESTAMP
  WHERE created_at < CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    AND status IN ('delivered', 'cancelled')
  RETURNING id, total
)
SELECT
  COUNT(*)::BIGINT,
  ROUND(SUM(total)::numeric, 2)
FROM archived;
$$ LANGUAGE SQL;

-- Procedure: Reset inventory low stock alerts
CREATE OR REPLACE FUNCTION reset_low_stock_alerts()
RETURNS TABLE (
  updated_count BIGINT
) AS $$
UPDATE inventory
SET low_stock_alert = FALSE
WHERE low_stock_alert = TRUE
  AND quantity_available > reorder_level
RETURNING id;
$$ LANGUAGE SQL;

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

-- Create audit table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- PERFORMANCE TUNING QUERIES
-- ============================================================================

-- Query: Find slow queries and table sizes
CREATE OR REPLACE VIEW vw_table_stats AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) AS index_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Query: Index usage statistics
CREATE OR REPLACE VIEW vw_index_usage AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================

-- Add search column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index on search vector
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector);

-- Function: Update product search vector
CREATE OR REPLACE FUNCTION update_product_search()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('portuguese', COALESCE(NEW.name, '')) ||
    to_tsvector('portuguese', COALESCE(NEW.description, '')) ||
    to_tsvector('portuguese', COALESCE(NEW.long_description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update search vector on product changes
CREATE TRIGGER products_search_update BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search();

-- Function: Full-text search products
CREATE OR REPLACE FUNCTION search_products(p_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  rating DECIMAL,
  rank REAL
) AS $$
SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.rating,
  ts_rank(p.search_vector, to_tsquery('portuguese', p_query)) AS rank
FROM products p
WHERE p.search_vector @@ to_tsquery('portuguese', p_query)
  AND p.is_active = TRUE
ORDER BY rank DESC;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- NOTIFICATION HELPERS
-- ============================================================================

-- Function: Create order notification
CREATE OR REPLACE FUNCTION create_order_notification(
  p_order_id UUID,
  p_type TEXT DEFAULT 'order',
  p_title TEXT DEFAULT 'Pedido atualizado'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM orders WHERE id = p_order_id;

  INSERT INTO notifications (user_id, title, content, type, related_order_id, notification_method)
  VALUES (
    v_user_id,
    p_title,
    'Seu pedido foi atualizado. Clique para ver detalhes.',
    p_type::TEXT CHECK (p_type IN ('order', 'promotion', 'system', 'loyalty', 'review', 'reminder')),
    p_order_id,
    'in_app'
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES & USAGE
-- ============================================================================

-- Views Usage:
-- SELECT * FROM vw_products_detailed WHERE is_active = TRUE;
-- SELECT * FROM vw_orders_summary WHERE status = 'pending';
-- SELECT * FROM vw_reviews_detailed LIMIT 10;
-- SELECT * FROM vw_customer_loyalty ORDER BY lifetime_spending DESC;
--
-- Functions Usage:
-- SELECT * FROM get_sales_stats('2026-01-01', '2026-12-31');
-- SELECT * FROM get_top_products(10, 30);
-- SELECT * FROM get_customer_purchases('user-uuid-here');
--
-- Search Usage:
-- SELECT * FROM search_products('brigadeiro chocolate');
--
-- Maintenance:
-- SELECT * FROM update_product_ratings();
-- SELECT * FROM reset_low_stock_alerts();
