# Production Integration Guide

**Last Updated:** June 30, 2026

This guide provides step-by-step instructions for connecting the e-commerce frontend to Supabase backend and preparing for production deployment.

---

## 🔌 Backend Integration

### 1. Database Query Functions

Create `src/lib/supabase-queries.ts`:

```typescript
import { supabase } from './supabase'
import { Product, Order, Review } from './database.types'

// Products
export async function getProducts(filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price' | 'rating' | 'newest'
  page?: number
  pageSize?: number
}): Promise<{ products: Product[], total: number }> {
  let query = supabase.from('products').select('*', { count: 'exact' })
  
  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }
  
  // Sort
  if (filters?.sortBy === 'price') {
    query = query.order('price', { ascending: true })
  } else if (filters?.sortBy === 'rating') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  const { data, error, count } = await query
  
  if (error) throw error
  return { products: data as Product[], total: count || 0 }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) return null
  return data as Product
}

export async function getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  // Get current product's category
  const current = await supabase
    .from('products')
    .select('category_id')
    .eq('id', productId)
    .single()
  
  if (!current.data) return []
  
  // Get other products in same category
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', current.data.category_id)
    .neq('id', productId)
    .limit(limit)
  
  return (data || []) as Product[]
}

// Orders
export async function createOrder(orderData: {
  userId: string
  items: any[]
  total: number
  subtotal: number
  tax: number
  shippingCost: number
  couponDiscount?: number
  customerData: any
  deliveryMethod: string
  deliveryNotes?: string
}): Promise<Order> {
  // Generate order number
  const orderNumber = await generateOrderNumber()
  
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id: orderData.userId,
      order_number: orderNumber,
      items: orderData.items,
      total: orderData.total,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping_cost: orderData.shippingCost,
      discount_amount: orderData.couponDiscount || 0,
      status: 'pending',
      payment_status: 'pending',
      shipping_method: orderData.deliveryMethod,
      delivery_address: orderData.customerData.address,
      delivery_city: orderData.customerData.city,
      delivery_state: orderData.customerData.state,
      delivery_zip: orderData.customerData.zip,
      customer_notes: orderData.deliveryNotes,
    }])
    .select()
    .single()
  
  if (error) throw error
  return data as Order
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []) as Order[]
}

// Reviews
export async function submitReview(review: {
  productId: string
  userId: string
  rating: number
  title: string
  content: string
  isVerifiedPurchase: boolean
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      product_id: review.productId,
      user_id: review.userId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      is_verified_purchase: review.isVerifiedPurchase,
      status: 'pending',
    }])
    .select()
    .single()
  
  if (error) throw error
  return data as Review
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []) as Review[]
}

// Newsletter
export async function subscribeNewsletter(email: string): Promise<void> {
  const { error } = await supabase
    .from('newsletter')
    .insert([{ email, is_subscribed: true }])
  
  if (error) {
    if (error.code === '23505') {
      // Email already exists, update
      await supabase
        .from('newsletter')
        .update({ is_subscribed: true })
        .eq('email', email)
    } else {
      throw error
    }
  }
}

// Favorites
export async function addFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, product_id: productId }])
  
  if (error) throw error
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  
  if (error) throw error
}

export async function getUserFavorites(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('products(*)')
    .eq('user_id', userId)
  
  if (error) throw error
  return (data?.map((f: any) => f.products) || []) as Product[]
}

// Generate order number
async function generateOrderNumber(): Promise<string> {
  const { data } = await supabase
    .rpc('generate_order_number')
  
  return data as string
}
```

### 2. Update ProductGrid Component

In `src/components/products/ProductGrid.tsx`, update the onFilterChange callback:

```typescript
const handleFilterChange = async (filters: ProductFilters) => {
  try {
    setLoading(true)
    const { products, total } = await getProducts(filters)
    setProducts(products)
    setTotalCount(total)
    setCurrentPage(1)
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    setLoading(false)
  }
}
```

### 3. Update ProductDetails Component

In `src/components/products/ProductDetails.tsx`, fetch related products and reviews:

```typescript
import { useEffect, useState } from 'react'
import { getRelatedProducts, getProductReviews } from '@/lib/supabase-queries'

export function ProductDetails({ product }: ProductDetailsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [related, productReviews] = await Promise.all([
          getRelatedProducts(product.id, 4),
          getProductReviews(product.id),
        ])
        setRelatedProducts(related)
        setReviews(productReviews)
      } catch (error) {
        console.error('Error fetching product data:', error)
      }
    }

    fetchData()
  }, [product.id])

  // ... rest of component
}
```

### 4. Update CheckoutFlow Component

In `src/components/CheckoutFlow.tsx`, implement order creation:

```typescript
const handleSubmitOrder = async () => {
  try {
    setLoading(true)
    
    const order = await createOrder({
      userId: user?.id || '',
      items,
      total: Math.max(0, total),
      subtotal,
      tax,
      shippingCost,
      couponDiscount,
      customerData,
      deliveryMethod,
      deliveryNotes,
    })

    clearCart()
    setStep('confirmation')
  } catch (error: any) {
    setError(error.message || 'Erro ao processar pedido')
  } finally {
    setLoading(false)
  }
}
```

### 5. Update ReviewForm Component

In `src/components/ReviewForm.tsx`:

```typescript
import { submitReview } from '@/lib/supabase-queries'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await submitReview({
      productId,
      userId: user?.id || '',
      rating,
      title,
      content,
      isVerifiedPurchase: true,
    })
    setSubmitted(true)
  } catch (error: any) {
    setMessage(error.message)
  }
}
```

### 6. Update NewsletterSignup Component

In `src/components/NewsletterSignup.tsx`:

```typescript
import { subscribeNewsletter } from '@/lib/supabase-queries'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    setStatus('loading')
    await subscribeNewsletter(email)
    setStatus('success')
    setMessage('Obrigado por se inscrever!')
    setEmail('')
  } catch (error: any) {
    setStatus('error')
    setMessage(error.message)
  }
}
```

---

## 🔐 Environment Variables

Create `.env.local` with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site
VITE_SITE_URL=https://ssdoces.com.br

# WhatsApp
VITE_WHATSAPP_NUMBER=5511999999999

# Payment (when implemented)
VITE_STRIPE_KEY=your_stripe_public_key
```

---

## 🏗️ Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase migrations executed
- [ ] Database indexes created
- [ ] RLS policies configured
- [ ] Storage buckets created for images
- [ ] Email service configured
- [ ] Payment gateway configured
- [ ] SSL certificate installed
- [ ] CDN configured
- [ ] Analytics integrated
- [ ] Error tracking (Sentry) configured
- [ ] Database backups scheduled
- [ ] Monitoring alerts set up

---

## 📊 Performance Optimization

1. **Image Optimization:**
   - Use Supabase Storage with image transformation
   - Implement responsive images with srcset
   - Lazy load images below fold

2. **Code Splitting:**
   - Route-based code splitting with TanStack Router
   - Component lazy loading for heavy components

3. **Caching:**
   - Implement browser cache headers
   - Cache product data with SWR or React Query
   - Edge caching with CDN

4. **Database:**
   - Index all filtered/sorted columns
   - Use database connection pooling
   - Implement query result caching

---

## 🧪 Testing Checklist

- [ ] Product filtering works correctly
- [ ] Cart persistence across page refresh
- [ ] Checkout form validation
- [ ] Order creation and confirmation
- [ ] Email notifications sent
- [ ] Payment processing
- [ ] Review moderation workflow
- [ ] Newsletter subscription
- [ ] Admin dashboard updates
- [ ] Customer dashboard shows correct data
- [ ] SEO metadata renders correctly
- [ ] Responsive design on all breakpoints
- [ ] Mobile touch interactions work
- [ ] Form validation messages display
- [ ] Error pages render correctly

---

## 🚀 Launch Steps

1. **Pre-launch (1 week before):**
   - Complete all testing
   - Set up monitoring and alerts
   - Create support documentation
   - Train support team

2. **Launch Day:**
   - Deploy to production
   - Monitor error logs closely
   - Be ready for immediate support

3. **Post-launch:**
   - Monitor performance metrics
   - Collect user feedback
   - Fix bugs immediately
   - Optimize based on analytics

---

## 📞 Support Contacts

- **Backend Developer:** Integration support
- **Database Admin:** Supabase management
- **DevOps:** Deployment and infrastructure
- **QA Team:** Testing and bug reports

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Router Guide](https://tanstack.com/router/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

