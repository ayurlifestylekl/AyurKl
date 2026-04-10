# Database Schema: Ayurvedic Digital Ecosystem
**Stack:** Next.js 14, Supabase (PostgreSQL), Tailwind CSS
**Project Scope:** Public Storefront, Customer Portal, Admin Center, Sales Agent (Affiliate) Portal.

## 1. Users Table (Managed by Supabase Auth)
**Table:** `users`
* `id` (UUID, Primary Key) - *Links to Supabase auth.users*
* `full_name` (Text)
* `email` (Text, Unique)
* `phone_number` (Text) - *Essential for WhatsApp widget routing*
* `role` (Enum: 'admin', 'customer', 'sales_agent')
* `created_at` (Timestamp)

## 2. Products & Inventory (The Combo Engine)
**Table:** `products`
* `id` (UUID, Primary Key)
* `name` (Text)
* `description` (Text)
* `price_rm` (Decimal) - *Pricing in Malaysian Ringgit*
* `sku` (Text, Unique)
* `stock_qty` (Integer)
* `category` (Text)
* `is_bundle` (Boolean) - *Trigger for the Smart "Combo" Engine*
* `image_url` (Text)
* `created_at` (Timestamp)

## 3. Order Management (Customer & Admin Portals)
**Table:** `orders`
* `id` (UUID, Primary Key)
* `customer_id` (UUID, Foreign Key -> users.id)
* `total_amount_rm` (Decimal)
* `payment_status` (Enum: 'pending', 'paid', 'failed') - *Mapped to Billplz API*
* `fulfillment_status` (Enum: 'processing', 'shipped', 'delivered')
* `courier_service` (Enum: 'Pos Laju', 'J&T Express', 'DHL', 'GDex', 'Ninja Van', 'Self-Pickup') 
* `tracking_number` (Text, Nullable)
* `referral_agent_id` (UUID, Nullable, Foreign Key -> sales_agents.id) - *For affiliate tracking*
* `created_at` (Timestamp)

## 4. Order Items (Line items for each order)
**Table:** `order_items`
* `id` (UUID, Primary Key)
* `order_id` (UUID, Foreign Key -> orders.id)
* `product_id` (UUID, Foreign Key -> products.id)
* `quantity` (Integer)
* `price_at_purchase_rm` (Decimal) - *Locks in the price at checkout*

## 5. Telemedicine & Appointments (Syncs with Cal.com)
**Table:** `appointments`
* `id` (UUID, Primary Key)
* `customer_id` (UUID, Foreign Key -> users.id)
* `treatment_name` (Text)
* `doctor_name` (Text) - *Default: Vaidya AKHIL HS (B.A.M.S)*
* `appointment_date_time` (Timestampz)
* `duration_mins` (Integer) - *Default: 30 minutes*
* `status` (Enum: 'scheduled', 'completed', 'cancelled')
* `advance_payment_rm` (Decimal, Nullable) - *To track the non-refundable deposit policy*

## 6. Sales Agent Portal (Affiliate Tracking for TikTok)
**Table:** `sales_agents`
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key -> users.id)
* `referral_code` (Text, Unique) - *e.g., 'tiktok_agent1'*
* `commission_rate` (Decimal) - *Percentage or flat rate*
* `total_sales_generated_rm` (Decimal)
* `total_commission_earned_rm` (Decimal)
* `created_at` (Timestamp)

## Database Directives for AI Assistant:
1. Generate strict PostgreSQL standard commands for these tables.
2. Implement Row Level Security (RLS) ensuring:
   - Customers can only read/update their own `orders` and `appointments`.
   - Sales Agents can only view `orders` tied to their `referral_agent_id`.
   - Admins have full CRUD access across all tables.
3. Automatically generate the Typescript `database.types.ts` file corresponding to this schema.