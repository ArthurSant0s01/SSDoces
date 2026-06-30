-- SSDoces Database - Sample Data & Seed Migration
-- This migration populates the database with sample data for testing

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, color, sort_order, is_active)
VALUES
  ('Brigadeiros Clássicos', 'brigadeiros-classicos', 'Brigadeiros tradicionais com sabores clássicos', '#8B4513', 1, TRUE),
  ('Brigadeiros Gourmet', 'brigadeiros-gourmet', 'Brigadeiros premium com ingredientes especiais', '#FFD700', 2, TRUE),
  ('Brigadeiros Sem Glúten', 'brigadeiros-sem-gluten', 'Opções sem glúten para todos os públicos', '#90EE90', 3, TRUE),
  ('Brigadeiros Veganos', 'brigadeiros-veganos', 'Brigadeiros 100% veganos', '#228B22', 4, TRUE),
  ('Kits & Promoções', 'kits-promocoes', 'Combos e ofertas especiais', '#FF6347', 5, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, slug, description, long_description, price, image_url, quantity_in_stock, sku, is_featured, is_active, rating, rating_count, ingredients, allergens, shelf_life_days)
SELECT
  c.id,
  'Brigadeiro Tradicional',
  'brigadeiro-tradicional',
  'Delicioso brigadeiro com calda de chocolate',
  'O clássico mais amado dos brigadeiros. Feito com leite condensado de qualidade premium e chocolate belga. Perfeito para festas e comemorações.',
  15.00,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  100,
  'BRAD-001',
  TRUE,
  TRUE,
  4.8,
  120,
  ARRAY['Leite condensado', 'Chocolate', 'Manteiga', 'Açúcar', 'Chocolate em pó'],
  ARRAY['Contém Leite'],
  7
FROM categories c WHERE c.slug = 'brigadeiros-classicos'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, long_description, price, image_url, quantity_in_stock, sku, is_featured, is_active, rating, rating_count, ingredients, allergens, shelf_life_days)
SELECT
  c.id,
  'Brigadeiro de Pistache',
  'brigadeiro-pistache',
  'Brigadeiro gourmet com pasta de pistache',
  'Uma combinação sofisticada de brigadeiro com pistache premium. Ideal para presentear pessoas com gosto refinado.',
  25.00,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  50,
  'BRAD-002',
  TRUE,
  TRUE,
  4.9,
  85,
  ARRAY['Leite condensado', 'Pasta de Pistache', 'Chocolate', 'Manteiga'],
  ARRAY['Contém Leite', 'Frutos Secos'],
  7
FROM categories c WHERE c.slug = 'brigadeiros-gourmet'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, long_description, price, image_url, quantity_in_stock, sku, is_featured, is_active, rating, rating_count, ingredients, allergens, shelf_life_days)
SELECT
  c.id,
  'Brigadeiro Sem Glúten',
  'brigadeiro-sem-gluten',
  'Brigadeiro tradicional 100% sem glúten',
  'Perfeito para quem tem intolerância a glúten. Mantém todo o sabor e qualidade do brigadeiro tradicional.',
  18.00,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  75,
  'BRAD-003',
  TRUE,
  TRUE,
  4.7,
  65,
  ARRAY['Leite condensado', 'Chocolate', 'Manteiga', 'Açúcar'],
  ARRAY['Contém Leite', 'Sem Glúten'],
  7
FROM categories c WHERE c.slug = 'brigadeiros-sem-gluten'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, long_description, price, image_url, quantity_in_stock, sku, is_featured, is_active, rating, rating_count, ingredients, allergens, shelf_life_days)
SELECT
  c.id,
  'Brigadeiro Vegano de Chocolate',
  'brigadeiro-vegano-chocolate',
  'Brigadeiro 100% vegano com chocolate premium',
  'Para os que não consomem produtos de origem animal. Delicioso, saudável e ético.',
  20.00,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  60,
  'BRAD-004',
  TRUE,
  TRUE,
  4.6,
  55,
  ARRAY['Leite de coco', 'Chocolate vegan', 'Óleo de coco', 'Açúcar'],
  ARRAY['Vegano', 'Sem Glúten'],
  7
FROM categories c WHERE c.slug = 'brigadeiros-veganos'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, long_description, price, image_url, quantity_in_stock, sku, is_featured, is_active, rating, rating_count, ingredients, allergens, shelf_life_days)
SELECT
  c.id,
  'Kit Degustação - 4 Sabores',
  'kit-degustacao-4-sabores',
  'Kit com 4 brigadeiros de sabores diferentes',
  'Conheça nossa variedade! Kit com 1 de cada: Tradicional, Pistache, Café e Frutas Vermelhas.',
  60.00,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  40,
  'KIT-001',
  TRUE,
  TRUE,
  5.0,
  45,
  NULL,
  NULL,
  7
FROM categories c WHERE c.slug = 'kits-promocoes'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Create inventory for products
INSERT INTO inventory (product_id, quantity_available, quantity_reserved, reorder_level)
SELECT id, quantity_in_stock, 0, 20 FROM products
ON CONFLICT (product_id) DO NOTHING;

-- ============================================================================
-- SAMPLE USERS (Note: These are just examples, actual users come from Auth)
-- ============================================================================

-- Sample newsletter subscriptions
INSERT INTO newsletter (email, first_name, last_name, frequency, is_subscribed, confirmed_at)
VALUES
  ('joao@example.com', 'João', 'Silva', 'weekly', TRUE, CURRENT_TIMESTAMP),
  ('maria@example.com', 'Maria', 'Santos', 'monthly', TRUE, CURRENT_TIMESTAMP),
  ('pedro@example.com', 'Pedro', 'Oliveira', 'promotional', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE COUPONS
-- ============================================================================

INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, is_active, start_date, end_date)
VALUES
  ('BEMVINDO10', 'percentage', 10, 50, 100, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
  ('VERAO20', 'percentage', 20, 100, 50, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
  ('DESCONTO15', 'fixed', 15, 75, 30, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
  ('GRATIS_ENVIO', 'fixed', 8, 100, 20, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- NOTES ON SAMPLE DATA
-- ============================================================================

-- The categories and products are now seeded.
-- 
-- To add real user data:
-- 1. Users are created through Supabase Auth
-- 2. Profiles are created via trigger (see next migration)
-- 3. Test data for orders/reviews should be added after user creation
--
-- To add admin user:
-- 1. Create user via Supabase Auth: auth_admin@ssdoces.com
-- 2. Run: UPDATE profiles SET role = 'admin' WHERE email = 'auth_admin@ssdoces.com';
--
-- Price in R$ (Brazilian Real) - 2026
-- Images are from Unsplash - replace with actual product images
-- Shelf life: 7 days from production (typical for handmade confectionery)
