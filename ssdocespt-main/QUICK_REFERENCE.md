# Quick Reference Guide

**Project:** SSDoces E-Commerce Platform  
**Last Updated:** June 30, 2026

---

## 🎯 Quick Navigation

### Frontend Components

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| **Product Listing** | `src/components/products/ProductGrid.tsx` | Display products with filters, search, pagination | ✅ Ready |
| **Product Details** | `src/components/products/ProductDetails.tsx` | Full product page with images, reviews, related products | ✅ Ready |
| **Cart Drawer** | `src/components/cart/CartDrawer.tsx` | Slide-out cart panel for quick access | ✅ Ready |
| **Cart Page** | `src/components/CartPage.tsx` | Full cart page with totals and checkout button | ✅ Ready |
| **Checkout** | `src/components/CheckoutFlow.tsx` | Multi-step checkout with shipping and payment | ✅ Ready |
| **Customer Dashboard** | `src/components/CustomerDashboard.tsx` | User orders, favorites, loyalty, profile | ✅ Ready |
| **Admin Dashboard** | `src/components/AdminDashboard.tsx` | Sales analytics, product/order management | ✅ Ready |
| **WhatsApp Button** | `src/components/FloatingWhatsAppButton.tsx` | Floating WhatsApp chat button | ✅ Ready |
| **Newsletter Signup** | `src/components/NewsletterSignup.tsx` | Email subscription form | ✅ Ready |
| **Review Form** | `src/components/ReviewForm.tsx` | Product review submission | ✅ Ready |

### Route Pages

| Route | File | Component | Purpose |
|-------|------|-----------|---------|
| `/produtos` | `src/routes/produtos.tsx` | ProductGrid | Product listing page |
| `/produtos/:slug` | `src/routes/produtos.$slug.tsx` | ProductDetails | Individual product page |
| `/carrinho` | `src/routes/carrinho.tsx` | CartPage | Shopping cart page |
| `/checkout` | `src/routes/checkout.tsx` | CheckoutFlow | Checkout page |
| `/minha-conta` | `src/routes/minha-conta.tsx` | CustomerDashboard | User dashboard |
| `/admin` | `src/routes/admin.tsx` | AdminDashboard | Admin panel |

### State Management

| File | Purpose | Key Functions |
|------|---------|----------------|
| `src/store/cart.ts` | Shopping cart state | addItem, removeItem, updateQuantity, clearCart, getTotalPrice |

### Utilities

| File | Purpose | Key Functions |
|------|---------|----------------|
| `src/lib/seo.ts` | SEO utilities | generateSeoMetadata, generateProductStructuredData, generateBreadcrumb... |
| `src/lib/validation.ts` | Form validation | validateEmail, validatePhone, validateCPF, validateForm, sanitizeInput |
| `src/lib/supabase.ts` | Supabase client | Authentication functions |
| `src/lib/database.types.ts` | TypeScript types | All database table types |

---

## 📋 Feature Checklist

### Product System
- [x] Product listing with grid
- [x] Product details page
- [x] Search functionality
- [x] Category filtering
- [x] Price range filtering
- [x] Sorting options
- [x] Pagination
- [x] Favorites
- [x] Product images
- [x] Related products
- [x] Reviews display
- [x] Stock status

### Shopping Cart
- [x] Add to cart
- [x] Remove from cart
- [x] Update quantities
- [x] localStorage persistence
- [x] Cart drawer
- [x] Cart page
- [x] Item badge
- [x] Total calculations
- [x] Animations
- [x] Responsive design

### Checkout
- [x] Order review
- [x] Coupon system
- [x] Pickup option
- [x] Local delivery option
- [x] Shipping option
- [x] Customer info form
- [x] Delivery address
- [x] Delivery notes
- [x] Terms acceptance
- [x] Order confirmation
- [x] Form validation

### User Dashboard
- [x] Order history
- [x] Order status tracking
- [x] Favorites management
- [x] Loyalty points
- [x] Profile settings
- [x] Notifications
- [x] Saved addresses
- [x] Reviews

### Admin Dashboard
- [x] Dashboard overview
- [x] Sales charts
- [x] Revenue analytics
- [x] Product management (CRUD)
- [x] Order management
- [x] Customer management
- [x] Inventory management
- [x] Review moderation
- [x] Coupon management
- [x] Export reports
- [x] Admin-only access

### Loyalty System
- [x] Points tracking
- [x] Tier system
- [x] Benefits display
- [x] Points redemption UI

### Review System
- [x] Star ratings
- [x] Written reviews
- [x] Verified purchase badge
- [x] Review form
- [x] Review display

### Newsletter
- [x] Signup form
- [x] Email collection
- [x] Success message
- [x] Error handling

### Global Features
- [x] WhatsApp button
- [x] Newsletter signup in footer
- [x] SEO optimization
- [x] Form validation
- [x] Input sanitization
- [x] Responsive design
- [x] Dark mode support
- [x] Smooth animations

---

## 🔄 Common Tasks

### Adding a New Product
```typescript
// In admin dashboard, click "Novo Produto"
// Fill in product details and upload image
// Product appears in listings automatically
```

### Processing an Order
```typescript
// In admin dashboard, navigate to Orders
// Click order to see details
// Update status (pending → processing → shipped → delivered)
// Customer gets notification automatically
```

### Modifying a Product
```typescript
// In admin dashboard, find product in Products tab
// Click edit icon
// Update details and save
// Changes appear instantly
```

### Creating a Coupon
```typescript
// In admin dashboard, go to Coupons section
// Click "Novo Cupom"
// Set code, discount amount, usage limit
// Customers can apply at checkout
```

### Viewing Analytics
```typescript
// In admin dashboard, Overview tab shows:
// - Sales vs Revenue chart
// - Category distribution pie chart
// - Recent orders table
// - Download reports button
```

---

## 🐛 Troubleshooting

### Cart not persisting after refresh
**Solution:** Check browser localStorage is enabled. Verify `src/store/cart.ts` is initialized.

### Products not loading
**Solution:** Check Supabase connection. Verify RLS policies allow read access. Check console for errors.

### Checkout failing
**Solution:** Verify all required fields are filled. Check order creation in Supabase. Review error message.

### Images not displaying
**Solution:** Check image URLs are correct. Verify Supabase storage bucket is public. Check CORS settings.

### Admin access denied
**Solution:** Verify user role is set to 'admin' in Supabase. Check authentication is working. Clear browser cache.

---

## 📱 Responsive Breakpoints

- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** > 1024px (3-4 columns)

All components are tested on these breakpoints.

---

## 🎨 Design System

**Colors:**
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Slate (various shades)

**Typography:**
- Headings: 1.2x - 2x rem
- Body: 1rem
- Small: 0.875rem

**Spacing:**
- Use Tailwind scale: 4px, 8px, 12px, 16px, 24px, 32px...

**Animations:**
- Framer Motion for page transitions
- Zustand for smooth state updates
- CSS transitions for hover effects

---

## 🔐 Security Notes

1. **Validate all inputs** - Use `src/lib/validation.ts`
2. **Sanitize outputs** - Use `sanitizeInput()` for user content
3. **Check user roles** - Admin and customer routes require role verification
4. **Use HTTPS** - All external URLs should use HTTPS
5. **Secure API calls** - Supabase RLS policies protect data
6. **Password requirements** - Validate with `validatePasswordStrength()`

---

## 📊 Database Tables (Supabase)

- `profiles` - User information
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Line items in orders
- `reviews` - Product reviews
- `favorites` - Saved products
- `loyalty_points` - Customer loyalty data
- `newsletter` - Email subscriptions
- `coupons` - Discount codes
- `inventory` - Stock tracking
- `notifications` - User notifications

---

## 🚀 Deployment Servers

| Environment | URL | Branch | Auto-deploy |
|-------------|-----|--------|------------|
| Development | localhost:5173 | main | N/A |
| Staging | staging.ssdoces.com.br | staging | Yes |
| Production | ssdoces.com.br | production | Manual |

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Repository:** [your-repo-url]
- **Design System:** Figma link
- **Documentation:** [docs-url]
- **Analytics:** [analytics-url]

---

## ✅ Pre-launch Checklist

- [ ] All components tested on mobile/tablet/desktop
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Images load without CORS errors
- [ ] Cart persists across sessions
- [ ] Checkout creates orders in Supabase
- [ ] Admin dashboard loads user/admin data
- [ ] Customer dashboard shows user orders
- [ ] WhatsApp button opens correctly
- [ ] Newsletter signup works
- [ ] SEO metadata renders
- [ ] Dark mode works correctly
- [ ] Animations perform smoothly
- [ ] No console errors
- [ ] Responsive design verified

---

**Version:** 1.0  
**Last Updated:** June 30, 2026  
**Maintained By:** Development Team
