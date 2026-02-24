-- Migration: Advanced E-commerce Features
-- Description: Adds tables and columns for Wishlists, Coupons, Product Relationships, and Abandoned Carts.

-- ============================================
-- WISHLISTS
-- ============================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlists"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COUPONS & DISCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for coupons (Admins only for write, All for read during checkout logic)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Add coupon support to orders
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- ============================================
-- PRODUCT RELATIONSHIPS (Cross-sell/Up-sell)
-- ============================================

CREATE TABLE IF NOT EXISTS product_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'related', -- 'related', 'accessory', 'upsell'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, related_product_id, relationship_type)
);

-- Enable RLS for product relationships
ALTER TABLE product_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product relationships"
  ON product_relationships FOR SELECT
  USING (true);

-- ============================================
-- ABANDONED CARTS
-- ============================================

-- Update carts to track guest emails and abandonment
ALTER TABLE carts
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_abandoned BOOLEAN DEFAULT false;

-- Add index for background cleanup or marketing tools
CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON carts(is_abandoned) WHERE is_abandoned = true;
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_product ON product_relationships(product_id);
