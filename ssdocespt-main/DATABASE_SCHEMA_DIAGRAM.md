# SSDoces Database Schema Diagram

Visual representation of the complete database schema with all relationships, constraints, and data types.

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SSDoces Database Schema (v1.0)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                                   ┌──────────────┐
                                   │   profiles   │ ◄─── extends auth.users
                                   ├──────────────┤
                              ┌────┤ id (UUID) PK │
                              │    │ email        │
                              │    │ full_name    │
                              │    │ username     │
                              │    │ role         │
                              │    │ avatar_url   │
                              │    └──────────────┘
                              │
                ┌─────────────┼─────────────┬──────────────────┐
                │             │             │                  │
                │             │             │                  │
          ┌─────▼──────┐ ┌───▼────────┐ ┌─▼──────────┐ ┌──────▼─────┐
          │   orders   │ │  reviews   │ │ favorites  │ │   loyalty_ │
          ├────────────┤ ├────────────┤ ├────────────┤ │   points   │
          │ id (PK)    │ │ id (PK)    │ │ id (PK)    │ ├────────────┤
          │ user_id FK ├◄┤ user_id FK ├◄┤ user_id FK ├┤ user_id FK │
          │ status     │ │ product_id ├─┤ product_id ├─┤ (UNIQUE)   │
          │ total      │ │ rating     │ │            │ │ total_     │
          │ coupon_id  │ │ status     │ │            │ │ points     │
          │ created_at │ │            │ │            │ │ tier       │
          └─────┬──────┘ └────┬───────┘ └────────────┘ └────────────┘
                │             │
                │        ┌────┴───────┐
                │        │            │
          ┌─────▼──────┐ │      ┌─────▼───────────┐
          │order_items │ │      │   categories    │
          ├────────────┤ │      ├─────────────────┤
          │ id (PK)    │ │      │ id (UUID) PK    │
          │ order_id ──┤─┘      │ name            │
          │ product_id ├────────┤ slug            │
          │ quantity   │ ├──────┤ color           │
          │ price      │ │      │ is_active       │
          └────────────┘ │      └─────────────────┘
                         │               │
                    ┌────▼────────────┐  │
                    │    products     │  │
                    ├─────────────────┤  │
                    │ id (UUID) PK    │  │
                    │ category_id FK  ├──┘
                    │ name            │
                    │ slug (UNIQUE)   │
                    │ price           │
                    │ description     │
                    │ rating          │
                    │ quantity_stock  │
                    └────┬────────────┘
                         │
                    ┌────▼──────────┐
                    │  inventory    │
                    ├───────────────┤
                    │ id (UUID) PK  │
                    │ product_id FK │
                    │ quantity_avail│
                    │ reorder_level │
                    └───────────────┘

┌─────────────┐  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐
│  coupons    │  │ newsletter   │  │ notifications  │  │  audit_log   │
├─────────────┤  ├──────────────┤  ├────────────────┤  ├──────────────┤
│ id (PK)     │  │ id (PK)      │  │ id (PK)        │  │ id (PK)      │
│ code        │  │ email        │  │ user_id FK     │  │ table_name   │
│ discount    │  │ user_id FK   │  │ title          │  │ operation    │
│ is_active   │  │ frequency    │  │ type           │  │ record_id    │
│ start_date  │  │ is_subscribed│  │ related_order  │  │ old_data     │
│ end_date    │  │              │  │ is_read        │  │ new_data     │
└─────────────┘  └──────────────┘  └────────────────┘  └──────────────┘
       ▲                                     ▲
       │ (optional)                         │
       └─────────────────────────────────────┘
              Referenced by orders
```

---

## Detailed Table Specifications

### 1. PROFILES (User Management)
```
┌────────────────────────────────────────┐
│          profiles (extends auth)       │
├────────────────────────────────────────┤
│ id            UUID        PK, FK(auth) │
│ email         TEXT        UNIQUE, IX   │
│ full_name     TEXT                     │
│ username      TEXT        UNIQUE, IX   │
│ avatar_url    TEXT                     │
│ bio           TEXT                     │
│ phone         TEXT                     │
│ role          TEXT        {customer,   │
│               │           admin,       │
│               │           staff}       │
│ created_at    TIMESTAMP   IX, NOT NULL │
│ updated_at    TIMESTAMP   NOT NULL     │
│ deleted_at    TIMESTAMP   (soft del)   │
└────────────────────────────────────────┘

Indexes: email, username, role, created_at
Keys:
  - PK: id
  - FK: auth.users (ON DELETE CASCADE)
  - Unique: email, username
RLS: Users view own, Admins view all
```

### 2. CATEGORIES (Product Organization)
```
┌──────────────────────────────────────┐
│          categories                  │
├──────────────────────────────────────┤
│ id            UUID        PK          │
│ name          TEXT        UNIQUE      │
│ slug          TEXT        UNIQUE, IX  │
│ description   TEXT                    │
│ image_url     TEXT                    │
│ color         TEXT        (hex)       │
│ sort_order    INTEGER     IX          │
│ is_active     BOOLEAN     IX          │
│ created_at    TIMESTAMP   NOT NULL    │
│ updated_at    TIMESTAMP   NOT NULL    │
└──────────────────────────────────────┘

Indexes: slug, is_active, sort_order
RLS: Public see active, Admins see all
```

### 3. PRODUCTS (Main Products)
```
┌──────────────────────────────────────────┐
│          products                        │
├──────────────────────────────────────────┤
│ id               UUID        PK          │
│ category_id      UUID        FK, IX      │
│ name             TEXT        NOT NULL    │
│ slug             TEXT        UNIQUE, IX  │
│ description      TEXT                    │
│ long_description TEXT                    │
│ price            DECIMAL     > 0, IX     │
│ discount_price   DECIMAL                 │
│ image_url        TEXT                    │
│ images           JSONB       []          │
│ quantity_stock   INTEGER     ≥ 0         │
│ sku              TEXT        UNIQUE      │
│ is_featured      BOOLEAN     IX          │
│ is_active        BOOLEAN     IX          │
│ rating           DECIMAL(3,2)IX          │
│ rating_count     INTEGER                 │
│ ingredients      TEXT[]                  │
│ allergens        TEXT[]                  │
│ shelf_life_days  INTEGER                 │
│ created_at       TIMESTAMP   IX          │
│ updated_at       TIMESTAMP               │
└──────────────────────────────────────────┘

Indexes: category_id, slug, is_active, is_featured, rating, price, created_at
Constraints:
  - price > 0
  - discount_price < price
  - FK: categories(id) ON DELETE RESTRICT
RLS: Public see active, Admins see all
```

### 4. INVENTORY (Stock Management)
```
┌──────────────────────────────────────┐
│          inventory                   │
├──────────────────────────────────────┤
│ id               UUID        PK       │
│ product_id       UUID        FK, IX   │
│                  │           UNIQUE   │
│ quantity_avail   INTEGER     ≥ 0      │
│ quantity_reserved INTEGER    ≥ 0      │
│ quantity_sold    INTEGER     ≥ 0      │
│ reorder_level    INTEGER              │
│ last_restocked   TIMESTAMP            │
│ low_stock_alert  BOOLEAN     IX       │
│ created_at       TIMESTAMP            │
│ updated_at       TIMESTAMP            │
└──────────────────────────────────────┘

Indexes: product_id, low_stock_alert
Constraints:
  - FK: products(id) ON DELETE CASCADE
  - Unique: product_id
RLS: Admins only
```

### 5. REVIEWS (Product Reviews)
```
┌──────────────────────────────────────┐
│          reviews                     │
├──────────────────────────────────────┤
│ id                   UUID    PK       │
│ product_id           UUID    FK, IX   │
│ user_id              UUID    FK, IX   │
│ rating               INT     1-5, IX  │
│ title                TEXT             │
│ content              TEXT             │
│ helpful_count        INT     ≥ 0      │
│ unhelpful_count      INT     ≥ 0      │
│ is_verified_purchase BOOLEAN          │
│ status               TEXT    IX       │
│                      {pending,        │
│                       approved,       │
│                       rejected}       │
│ created_at           TIMESTAMP IX     │
│ updated_at           TIMESTAMP        │
└──────────────────────────────────────┘

Indexes: product_id, user_id, rating, status, created_at
Constraints:
  - rating: 1 CHECK rating >= 1 AND rating <= 5
  - Unique(product_id, user_id) - one review per product per user
  - FK: products ON DELETE CASCADE
  - FK: profiles ON DELETE CASCADE
RLS: Public see approved, Users see own, Admins manage all
```

### 6. FAVORITES (Wishlist)
```
┌──────────────────────────────────────┐
│          favorites                   │
├──────────────────────────────────────┤
│ id           UUID        PK           │
│ user_id      UUID        FK, IX       │
│ product_id   UUID        FK, IX       │
│ created_at   TIMESTAMP   IX           │
└──────────────────────────────────────┘

Indexes: user_id, product_id, created_at
Constraints:
  - Unique(user_id, product_id)
  - FK: profiles ON DELETE CASCADE
  - FK: products ON DELETE CASCADE
RLS: Users see own, Users can insert/delete own
```

### 7. COUPONS (Discount Codes)
```
┌──────────────────────────────────────────┐
│          coupons                         │
├──────────────────────────────────────────┤
│ id                   UUID        PK      │
│ code                 TEXT        UNIQUE  │
│                      │           IX      │
│ discount_type        TEXT        IX      │
│                      {percentage, fixed} │
│ discount_value       DECIMAL     > 0     │
│ max_discount         DECIMAL             │
│ min_order_amount     DECIMAL     ≥ 0     │
│ usage_limit          INTEGER             │
│ usage_per_user       INTEGER             │
│ current_usage        INTEGER             │
│ is_active            BOOLEAN     IX      │
│ start_date           TIMESTAMP   IX      │
│ end_date             TIMESTAMP   IX      │
│ applicable_categories UUID[]             │
│ excluded_products    UUID[]              │
│ created_by           UUID        FK      │
│ created_at           TIMESTAMP           │
│ updated_at           TIMESTAMP           │
└──────────────────────────────────────────┘

Indexes: code, is_active, start_date, end_date
RLS: Public see valid active, Admins manage all
```

### 8. ORDERS (Customer Orders)
```
┌──────────────────────────────────────────┐
│          orders                          │
├──────────────────────────────────────────┤
│ id                   UUID        PK      │
│ user_id              UUID        FK, IX  │
│ order_number         TEXT        UNIQUE  │
│                      │           IX      │
│ status               TEXT        IX      │
│                      {pending,           │
│                       confirmed,         │
│                       processing,        │
│                       ready_for_pickup,  │
│                       shipped,           │
│                       delivered,         │
│                       cancelled}         │
│ subtotal             DECIMAL     ≥ 0     │
│ tax                  DECIMAL     ≥ 0     │
│ shipping_cost        DECIMAL     ≥ 0     │
│ discount_amount      DECIMAL     ≥ 0     │
│ coupon_id            UUID        FK, IX  │
│ total                DECIMAL     ≥ 0     │
│ payment_method       TEXT        {cc,    │
│                      │           debit,  │
│                      │           pix,    │
│                      │           bank,   │
│                      │           cash}   │
│ payment_status       TEXT        IX      │
│                      {pending,           │
│                       completed,         │
│                       failed,            │
│                       refunded}          │
│ shipping_method      TEXT                │
│ tracking_number      TEXT                │
│ notes                TEXT                │
│ customer_notes       TEXT                │
│ delivery_address     TEXT                │
│ delivery_city        TEXT                │
│ delivery_state       TEXT                │
│ delivery_zip         TEXT                │
│ delivery_date        TIMESTAMP           │
│ scheduled_pickup     TIMESTAMP           │
│ created_at           TIMESTAMP   IX      │
│ updated_at           TIMESTAMP           │
└──────────────────────────────────────────┘

Indexes: user_id, order_number, status, payment_status, created_at, coupon_id
Constraints:
  - FK: profiles ON DELETE RESTRICT
  - FK: coupons ON DELETE SET NULL
RLS: Users see own, Admins see all
```

### 9. ORDER_ITEMS (Line Items)
```
┌──────────────────────────────────────────┐
│          order_items                     │
├──────────────────────────────────────────┤
│ id               UUID        PK          │
│ order_id         UUID        FK, IX      │
│                  │           CASCADE     │
│ product_id       UUID        FK, IX      │
│ quantity         INTEGER     > 0         │
│ unit_price       DECIMAL     > 0         │
│ total_price      DECIMAL     ≥ 0         │
│ special_requests TEXT                    │
│ created_at       TIMESTAMP               │
└──────────────────────────────────────────┘

Indexes: order_id, product_id
Constraints:
  - quantity > 0
  - unit_price > 0
  - FK: orders ON DELETE CASCADE
  - FK: products ON DELETE RESTRICT
RLS: Users see from own orders, Admins see all
```

### 10. LOYALTY_POINTS (Rewards Program)
```
┌──────────────────────────────────────┐
│          loyalty_points              │
├──────────────────────────────────────┤
│ id               UUID        PK       │
│ user_id          UUID        FK, UNIQ │
│                  │           IX       │
│ total_points     INTEGER     ≥ 0      │
│ available_points INTEGER     ≥ 0      │
│ spent_points     INTEGER     ≥ 0      │
│ tier             TEXT        IX       │
│                  {bronze,             │
│                   silver,             │
│                   gold,               │
│                   platinum}           │
│ joined_at        TIMESTAMP            │
│ last_activity_at TIMESTAMP            │
│ created_at       TIMESTAMP            │
│ updated_at       TIMESTAMP            │
└──────────────────────────────────────┘

Indexes: user_id, tier
Constraints:
  - FK: profiles ON DELETE CASCADE
  - Unique: user_id (1:1 relationship)
RLS: Users see own, Admins see all
```

### 11. NEWSLETTER (Email Subscriptions)
```
┌──────────────────────────────────────┐
│          newsletter                  │
├──────────────────────────────────────┤
│ id                UUID        PK      │
│ email             TEXT        UNIQUE  │
│                   │           IX      │
│ user_id           UUID        FK, IX  │
│ first_name        TEXT                │
│ last_name         TEXT                │
│ frequency         TEXT        IX      │
│                   {weekly,            │
│                    monthly,           │
│                    promotional}       │
│ is_subscribed     BOOLEAN     IX      │
│ confirmed_at      TIMESTAMP           │
│ subscription_cnt  INTEGER             │
│ opened_count      INTEGER             │
│ clicked_count     INTEGER             │
│ last_email_sent   TIMESTAMP           │
│ unsubscribed_at   TIMESTAMP           │
│ created_at        TIMESTAMP           │
│ updated_at        TIMESTAMP           │
└──────────────────────────────────────┘

Indexes: email, is_subscribed, user_id
Constraints:
  - FK: profiles ON DELETE CASCADE (optional)
RLS: Users see own, Public can subscribe, Admins manage all
```

### 12. NOTIFICATIONS (In-App/Email)
```
┌──────────────────────────────────────┐
│          notifications               │
├──────────────────────────────────────┤
│ id               UUID        PK       │
│ user_id          UUID        FK, IX   │
│ title            TEXT                 │
│ content          TEXT                 │
│ type             TEXT        IX       │
│                  {order,              │
│                   promotion,          │
│                   system,             │
│                   loyalty,            │
│                   review,             │
│                   reminder}           │
│ related_order_id UUID        FK, IX   │
│ is_read          BOOLEAN     IX       │
│ is_sent          BOOLEAN             │
│ notify_method    TEXT                │
│                  {in_app, email,      │
│                   push, sms}          │
│ sent_at          TIMESTAMP            │
│ action_url       TEXT                │
│ created_at       TIMESTAMP   IX       │
│ updated_at       TIMESTAMP            │
└──────────────────────────────────────┘

Indexes: user_id, is_read, type, created_at, related_order_id
Constraints:
  - FK: profiles ON DELETE CASCADE
  - FK: orders ON DELETE CASCADE (optional)
RLS: Users see own, Admins see all
```

---

## Relationships Summary

```
                            ONE-TO-MANY
                                 │
                        ┌────────┴────────┐
                        │                 │
                   profiles         categories
                     │ ├─────────────┤
                     │ │  1 → N      │
                     │ └─────────────┘
          ┌──────────┼──────────────────┐
          │          │                  │
          │       orders        products─┘
          │          │               │
          │          │          ┌────┴────┐
          │          │          │          │
          │       order_items◄──┘     inventory
          │          │
          │          └────┬─────────────────┐
          │               │                 │
          │          coupons          loyalty_points
          │
          │
    ┌─────┼──────────┐
    │     │          │
 reviews  │      newsletter
 favorites│
    │     │
    └─────┴────────────────┐
                           │
                    notifications
                           ▲
                           │
                      ┌────┴────────┐
                      │             │
                    orders    audit_log (system)
```

---

## Data Flow Diagram

```
External User
     │
     ▼
┌─────────────┐
│ Auth System │ (Supabase Auth)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  profiles   │◄────────┐
└──────┬──────┘         │
       │                │
       ├────────────────┼─────────────┐
       │                │             │
       ▼                ▼             ▼
    orders        reviews        favorites
       │                │
       ▼                ▼
   order_items     categories
       │                │
       ▼                ▼
   products─────► inventory
       │
       └─────────┬──────────────┐
               ├──────────────┤
               │   coupons    │
               └──────────────┘
       │
       ├────────────────────┐
       │                    │
    loyalty_points    notifications
       │                    │
       ▼                    ▼
   audit_log          newsletter
```

---

## Foreign Key Relationships

```
profiles ──┐
           │
           ├──→ orders (user_id)
           ├──→ reviews (user_id)
           ├──→ favorites (user_id)
           ├──→ loyalty_points (user_id)
           ├──→ notifications (user_id)
           └──→ coupons (created_by)

categories ──→ products (category_id)

products ──┐
           ├──→ inventory (product_id) [1:1]
           ├──→ reviews (product_id)
           ├──→ favorites (product_id)
           └──→ order_items (product_id)

coupons ──→ orders (coupon_id)

orders ──┐
         ├──→ order_items (order_id) [CASCADE]
         └──→ notifications (related_order_id)
```

---

## Cascade Rules

| From Table | To Table | Rule | Impact |
|---|---|---|---|
| orders | order_items | CASCADE | Delete order → Delete all items |
| products | reviews | CASCADE | Delete product → Delete all reviews |
| products | favorites | CASCADE | Delete product → Delete all favorites |
| products | inventory | CASCADE | Delete product → Delete inventory |
| profiles | orders | RESTRICT | Can't delete profile with orders |
| profiles | reviews | CASCADE | Delete profile → Delete all reviews |
| categories | products | RESTRICT | Can't delete category with products |

---

## Index Coverage

```
FIELD INDEXES (covering most queries)
├─ Lookup Indexes
│  ├─ profiles: email, username, role
│  ├─ products: slug, sku
│  ├─ categories: slug
│  ├─ coupons: code
│  └─ orders: order_number
│
├─ Filter Indexes
│  ├─ categories.is_active
│  ├─ products.is_active, is_featured
│  ├─ reviews.status, rating
│  ├─ orders.status, payment_status
│  ├─ newsletter.is_subscribed
│  └─ notifications.is_read
│
├─ Sort Indexes
│  ├─ created_at (all tables)
│  ├─ products.price
│  ├─ products.rating
│  └─ categories.sort_order
│
└─ Join Indexes (Foreign Keys)
   ├─ All FK columns
   └─ Covers most joins
```

---

## Stats & Capacity

```
TABLE STATISTICS (estimated for 1000 customers)

profiles          ~1,000 rows
categories        ~10 rows
products          ~500 rows
inventory         ~500 rows (1:1 with products)
orders            ~2,000 rows (2 orders/customer avg)
order_items       ~10,000 rows (5 items/order avg)
reviews           ~1,000 rows
favorites         ~1,000 rows
coupons           ~50 rows
loyalty_points    ~1,000 rows (1:1 with profiles)
newsletter        ~500 rows
notifications     ~10,000 rows (5 per customer avg)
audit_log         ~50,000 rows (variable)

Estimated DB size: 500 MB - 1 GB (with growth)
```

---

## Performance Characteristics

```
OPERATION PERFORMANCE (after indexing)

SELECT operations:
├─ Get product by slug        O(log n) ~5ms
├─ Get user orders            O(log n) ~10ms
├─ List active categories     O(n) ~20ms
├─ Full-text search products  O(n) ~50ms
└─ Get order with items       O(log n) ~15ms

INSERT operations:
├─ Create order + 5 items     O(log n) ~50ms
├─ Add review                 O(log n) ~20ms
└─ Add to favorites           O(log n) ~10ms

UPDATE operations:
├─ Update product             O(log n) ~15ms
├─ Update order status        O(log n) ~10ms
└─ Update inventory           O(log n) ~8ms

DELETE operations:
├─ Cancel order (cascade)     O(log n) ~30ms
├─ Delete review              O(log n) ~10ms
└─ Remove favorite            O(log n) ~8ms
```

---

**Generated:** 2026-06-30  
**Version:** 1.0  
**Status:** Production Ready
