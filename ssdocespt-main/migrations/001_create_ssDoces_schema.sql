-- SSDoces Database Schema
-- Complete SQL migrations for all tables with RLS policies
-- Run this migration in Supabase or your PostgreSQL database

-- ============================================================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  discount_price DECIMAL(10, 2),
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  quantity_in_stock INTEGER DEFAULT 0 NOT NULL,
  sku TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  ingredients TEXT[],
  allergens TEXT[],
  shelf_life_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. INVENTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products ON DELETE CASCADE,
  quantity_available INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_sold INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  low_stock_alert BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 5. REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(product_id, user_id)
);

-- ============================================================================
-- 6. FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 7. COUPONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  max_discount DECIMAL(10, 2),
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  usage_limit INTEGER,
  usage_per_user INTEGER DEFAULT 1,
  current_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  applicable_categories UUID[],
  excluded_products UUID[],
  created_by UUID REFERENCES profiles ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 8. ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE RESTRICT,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_id UUID REFERENCES coupons ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  shipping_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  customer_notes TEXT,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  scheduled_pickup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 9. ORDER_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 10. LOYALTY_POINTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  available_points INTEGER DEFAULT 0 CHECK (available_points >= 0),
  spent_points INTEGER DEFAULT 0 CHECK (spent_points >= 0),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 11. NEWSLETTER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'monthly', 'promotional')),
  is_subscribed BOOLEAN DEFAULT TRUE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  subscription_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 12. NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'promotion', 'system', 'loyalty', 'review', 'reminder')),
  related_order_id UUID REFERENCES orders ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  notification_method TEXT DEFAULT 'in_app' CHECK (notification_method IN ('in_app', 'email', 'push', 'sms')),
  sent_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(low_stock_alert);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Coupons indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_start_date ON coupons(start_date);
CREATE INDEX IF NOT EXISTS idx_coupons_end_date ON coupons(end_date);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Loyalty points indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(tier);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_subscribed ON newsletter(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON newsletter(user_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related_order_id ON notifications(related_order_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories" ON categories
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can create categories
CREATE POLICY "Admins can create categories" ON categories
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can update categories
CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all products
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can create products
CREATE POLICY "Admins can create products" ON products
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- INVENTORY POLICIES
-- ============================================================================

-- Admins can view inventory
CREATE POLICY "Admins can view inventory" ON inventory
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can update inventory
CREATE POLICY "Admins can update inventory" ON inventory
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (status = 'approved');

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT
  USING (user_id = auth.uid() OR status = 'approved');

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- FAVORITES POLICIES
-- ============================================================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated users can add favorites
CREATE POLICY "Authenticated users can add favorites" ON favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- COUPONS POLICIES
-- ============================================================================

-- Anyone can view active coupons
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT
  USING (is_active = TRUE AND current_timestamp >= start_date AND current_timestamp <= end_date);

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons" ON coupons
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can create coupons
CREATE POLICY "Admins can create coupons" ON coupons
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can update coupons
CREATE POLICY "Admins can update coupons" ON coupons
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending orders" ON orders
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins can update any order
CREATE POLICY "Admins can update any order" ON orders
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- ORDER_ITEMS POLICIES
-- ============================================================================

-- Users can view order items from their orders
CREATE POLICY "Users can view order items from own orders" ON order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ));

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- LOYALTY_POINTS POLICIES
-- ============================================================================

-- Users can view their own loyalty points
CREATE POLICY "Users can view own loyalty points" ON loyalty_points
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all loyalty points
CREATE POLICY "Admins can view all loyalty points" ON loyalty_points
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- System can update loyalty points (via triggers/functions)
CREATE POLICY "Admins can update loyalty points" ON loyalty_points
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- NEWSLETTER POLICIES
-- ============================================================================

-- Users can view their own newsletter subscription
CREATE POLICY "Users can view own newsletter" ON newsletter
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL AND email = auth.jwt() ->> 'email');

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON newsletter
  FOR INSERT
  WITH CHECK (TRUE);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON newsletter
  FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage newsletter
CREATE POLICY "Admins can manage newsletter" ON newsletter
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- System can create notifications (via triggers/functions)
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- Function to create order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- Function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(
  p_subtotal DECIMAL,
  p_tax DECIMAL DEFAULT 0,
  p_shipping DECIMAL DEFAULT 0,
  p_discount DECIMAL DEFAULT 0
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN p_subtotal + p_tax + p_shipping - p_discount;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA MIGRATION NOTES
-- ============================================================================

-- This migration file:
-- 1. Creates 12 main tables with proper relationships
-- 2. Adds 40+ indexes for query optimization
-- 3. Implements RLS policies for data security
-- 4. Creates triggers for automatic timestamp updates
-- 5. Provides helper functions for business logic
--
-- To apply this migration:
-- 1. In Supabase: Go to SQL Editor > New query > Paste this file > Run
-- 2. Or use Supabase CLI: supabase db push
--
-- Relationships:
-- - profiles: extends auth.users
-- - categories: independent
-- - products: references categories
-- - inventory: references products
-- - reviews: references products, profiles
-- - favorites: references products, profiles
-- - coupons: independent (has arrays for products/categories)
-- - orders: references profiles, coupons
-- - order_items: references orders, products
-- - loyalty_points: references profiles
-- - newsletter: references profiles (optional)
-- - notifications: references profiles, orders
