// SSDoces Database Types
// Generated TypeScript types for all database tables

// ============================================================================
// PROFILES TABLE
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProfileInsert
  extends Omit<Profile, 'id' | 'created_at' | 'updated_at'> {}

export interface ProfileUpdate
  extends Partial<Omit<Profile, 'id' | 'created_at' | 'email'>> {}

// ============================================================================
// CATEGORIES TABLE
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert extends Omit<Category, 'id' | 'created_at' | 'updated_at'> {}

export interface CategoryUpdate extends Partial<Omit<Category, 'id' | 'created_at' | 'slug'>> {}

// ============================================================================
// PRODUCTS TABLE
// ============================================================================

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  images?: string[];
  quantity_in_stock: number;
  sku?: string;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  rating_count: number;
  ingredients?: string[];
  allergens?: string[];
  shelf_life_days?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category?: Category;
}

export interface ProductInsert extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}

export interface ProductUpdate extends Partial<Omit<Product, 'id' | 'created_at' | 'category_id' | 'slug'>> {}

// ============================================================================
// INVENTORY TABLE
// ============================================================================

export interface Inventory {
  id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  reorder_level: number;
  last_restocked_at?: string;
  low_stock_alert: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryInsert extends Omit<Inventory, 'id' | 'created_at' | 'updated_at'> {}

export interface InventoryUpdate extends Partial<Omit<Inventory, 'id' | 'created_at' | 'product_id'>> {}

// ============================================================================
// REVIEWS TABLE
// ============================================================================

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  content?: string;
  helpful_count: number;
  unhelpful_count: number;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUserProduct extends Review {
  user?: Profile;
  product?: Product;
}

export interface ReviewInsert extends Omit<Review, 'id' | 'created_at' | 'updated_at'> {}

export interface ReviewUpdate extends Partial<Omit<Review, 'id' | 'created_at' | 'product_id' | 'user_id'>> {}

// ============================================================================
// FAVORITES TABLE
// ============================================================================

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface FavoriteWithProduct extends Favorite {
  product?: Product;
}

export interface FavoriteInsert extends Omit<Favorite, 'id' | 'created_at'> {}

// ============================================================================
// COUPONS TABLE
// ============================================================================

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount?: number;
  min_order_amount: number;
  usage_limit?: number;
  usage_per_user: number;
  current_usage: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  applicable_categories?: string[];
  excluded_products?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponInsert extends Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'current_usage'> {}

export interface CouponUpdate extends Partial<Omit<Coupon, 'id' | 'created_at' | 'code'>> {}

// ============================================================================
// ORDERS TABLE
// ============================================================================

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount_amount: number;
  coupon_id?: string;
  total: number;
  payment_method?: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  customer_notes?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_date?: string;
  scheduled_pickup_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  items?: OrderItem[];
  user?: Profile;
  coupon?: Coupon;
}

export interface OrderInsert extends Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'> {}

export interface OrderUpdate extends Partial<Omit<Order, 'id' | 'created_at' | 'user_id' | 'order_number'>> {}

// ============================================================================
// ORDER_ITEMS TABLE
// ============================================================================

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string;
  created_at: string;
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product;
}

export interface OrderItemInsert extends Omit<OrderItem, 'id' | 'created_at'> {}

// ============================================================================
// LOYALTY_POINTS TABLE
// ============================================================================

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  spent_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joined_at: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPointsInsert extends Omit<LoyaltyPoints, 'id' | 'created_at' | 'updated_at'> {}

export interface LoyaltyPointsUpdate extends Partial<Omit<LoyaltyPoints, 'id' | 'created_at' | 'user_id' | 'joined_at'>> {}

// ============================================================================
// NEWSLETTER TABLE
// ============================================================================

export interface Newsletter {
  id: string;
  email: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  frequency: 'weekly' | 'monthly' | 'promotional';
  is_subscribed: boolean;
  confirmed_at?: string;
  subscription_count: number;
  opened_count: number;
  clicked_count: number;
  last_email_sent_at?: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterInsert extends Omit<Newsletter, 'id' | 'created_at' | 'updated_at' | 'subscription_count' | 'opened_count' | 'clicked_count'> {}

export interface NewsletterUpdate extends Partial<Omit<Newsletter, 'id' | 'created_at' | 'email'>> {}

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'order' | 'promotion' | 'system' | 'loyalty' | 'review' | 'reminder';
  related_order_id?: string;
  is_read: boolean;
  is_sent: boolean;
  notification_method: 'in_app' | 'email' | 'push' | 'sms';
  sent_at?: string;
  action_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationWithOrder extends Notification {
  order?: Order;
}

export interface NotificationInsert extends Omit<Notification, 'id' | 'created_at' | 'updated_at'> {}

export interface NotificationUpdate extends Partial<Omit<Notification, 'id' | 'created_at' | 'user_id'>> {}

// ============================================================================
// AGGREGATE TYPES (for complex responses)
// ============================================================================

export interface ProductStats {
  product: Product;
  avg_rating: number;
  review_count: number;
  favorites_count: number;
}

export interface CustomerStats {
  user_id: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  loyalty_tier: string;
}

export interface OrderStats {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  pending_orders: number;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ProductFilter {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  search?: string;
  allergens?: string[];
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface OrderFilter {
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
}
