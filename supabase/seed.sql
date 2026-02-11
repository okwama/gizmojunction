-- Seed data for Gizmo Junction
-- This file populates the database with sample products for testing

-- ============================================
-- ROLES
-- ============================================

INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('operations', 'Order and customer management'),
  ('inventory_manager', 'Inventory and product catalog management'),
  ('customer_support', 'Customer service and reviews moderation')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- WAREHOUSES
-- ============================================

INSERT INTO warehouses (name, code, address) VALUES
  ('Main Warehouse', 'MW-001', '123 Industrial Road, City Center'),
  ('Secondary Warehouse', 'SW-002', '456 Storage Ave, Suburb')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- BRANDS
-- ============================================

INSERT INTO brands (name, slug, description) VALUES
  ('Apple', 'apple', 'Premium consumer electronics'),
  ('Samsung', 'samsung', 'Global technology leader'),
  ('Sony', 'sony', 'Audio and visual excellence'),
  ('Dell', 'dell', 'Computing solutions'),
  ('HP', 'hp', 'Printing and computing'),
  ('Logitech', 'logitech', 'PC peripherals and accessories'),
  ('Anker', 'anker', 'Charging solutions'),
  ('Beats', 'beats', 'Premium audio')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, description) VALUES
  ('Smartphones', 'smartphones', 'Mobile phones and accessories'),
  ('Laptops', 'laptops', 'Portable computers'),
  ('Audio', 'audio', 'Headphones, speakers, and audio devices'),
  ('Accessories', 'accessories', 'Cables, chargers, and peripherals'),
  ('Tablets', 'tablets', 'Tablet computers')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================

-- iPhone 15 Pro
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'iPhone 15 Pro',
  'iphone-15-pro',
  'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.',
  999.00,
  c.id,
  b.id,
  true,
  true
FROM categories c, brands b
WHERE c.slug = 'smartphones' AND b.slug = 'apple'
ON CONFLICT (slug) DO NOTHING;

-- Samsung Galaxy S24 Ultra
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Samsung Galaxy S24 Ultra',
  'samsung-galaxy-s24-ultra',
  'Premium flagship with S Pen, 200MP camera, and AI-powered features.',
  1199.00,
  c.id,
  b.id,
  true,
  true
FROM categories c, brands b
WHERE c.slug = 'smartphones' AND b.slug = 'samsung'
ON CONFLICT (slug) DO NOTHING;

-- MacBook Pro 14"
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'MacBook Pro 14"',
  'macbook-pro-14',
  'Powerful laptop with M3 Pro chip and stunning Liquid Retina XDR display.',
  1999.00,
  c.id,
  b.id,
  true,
  true
FROM categories c, brands b
WHERE c.slug = 'laptops' AND b.slug = 'apple'
ON CONFLICT (slug) DO NOTHING;

-- Dell XPS 15
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Dell XPS 15',
  'dell-xps-15',
  'Premium Windows laptop with InfinityEdge display and 12th Gen Intel processors.',
  1599.00,
  c.id,
  b.id,
  true,
  true
FROM categories c, brands b
WHERE c.slug = 'laptops' AND b.slug = 'dell'
ON CONFLICT (slug) DO NOTHING;

-- Sony WH-1000XM5
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Sony WH-1000XM5',
  'sony-wh-1000xm5',
  'Industry-leading noise canceling headphones with exceptional sound quality.',
  399.00,
  c.id,
  b.id,
  true,
  true
FROM categories c, brands b
WHERE c.slug = 'audio' AND b.slug = 'sony'
ON CONFLICT (slug) DO NOTHING;

-- Beats Studio Pro
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Beats Studio Pro',
  'beats-studio-pro',
  'Premium wireless headphones with lossless audio and personalized spatial audio.',
  349.00,
  c.id,
  b.id,
  false,
  true
FROM categories c, brands b
WHERE c.slug = 'audio' AND b.slug = 'beats'
ON CONFLICT (slug) DO NOTHING;

-- Anker PowerCore 20K
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Anker PowerCore 20K',
  'anker-powercore-20k',
  'High-capacity portable charger with 20,000mAh battery.',
  49.99,
  c.id,
  b.id,
  false,
  true
FROM categories c, brands b
WHERE c.slug = 'accessories' AND b.slug = 'anker'
ON CONFLICT (slug) DO NOTHING;

-- Logitech MX Master 3S
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Logitech MX Master 3S',
  'logitech-mx-master-3s',
  'Advanced wireless mouse with ultra-precise scrolling and customizable buttons.',
  99.99,
  c.id,
  b.id,
  false,
  true
FROM categories c, brands b
WHERE c.slug = 'accessories' AND b.slug = 'logitech'
ON CONFLICT (slug) DO NOTHING;

-- iPad Pro 12.9"
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'iPad Pro 12.9"',
  'ipad-pro-12-9',
  'Ultimate iPad with M2 chip and stunning Liquid Retina XDR display.',
  1099.00,
  c.id,
  b.id,
  false,
  true
FROM categories c, brands b
WHERE c.slug = 'tablets' AND b.slug = 'apple'
ON CONFLICT (slug) DO NOTHING;

-- Samsung Galaxy Tab S9
INSERT INTO products (name, slug, description, base_price, category_id, brand_id, featured, is_published)
SELECT 
  'Samsung Galaxy Tab S9',
  'samsung-galaxy-tab-s9',
  'Premium Android tablet with S Pen and stunning AMOLED display.',
  799.00,
  c.id,
  b.id,
  false,
  true
FROM categories c, brands b
WHERE c.slug = 'tablets' AND b.slug = 'samsung'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PRODUCT IMAGES
-- ============================================

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', 'iPhone 15 Pro', 1
FROM products WHERE slug = 'iphone-15-pro';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'Samsung Galaxy S24 Ultra', 1
FROM products WHERE slug = 'samsung-galaxy-s24-ultra';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'MacBook Pro 14"', 1
FROM products WHERE slug = 'macbook-pro-14';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80', 'Dell XPS 15', 1
FROM products WHERE slug = 'dell-xps-15';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80', 'Sony WH-1000XM5', 1
FROM products WHERE slug = 'sony-wh-1000xm5';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'Beats Studio Pro', 1
FROM products WHERE slug = 'beats-studio-pro';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', 'Anker PowerCore 20K', 1
FROM products WHERE slug = 'anker-powercore-20k';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', 'Logitech MX Master 3S', 1
FROM products WHERE slug = 'logitech-mx-master-3s';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 'iPad Pro 12.9"', 1
FROM products WHERE slug = 'ipad-pro-12-9';

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT id, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', 'Samsung Galaxy Tab S9', 1
FROM products WHERE slug = 'samsung-galaxy-tab-s9';

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

-- iPhone 15 Pro variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '128GB - Natural Titanium', 'APL-IP15P-128-NT', 0.00
FROM products WHERE slug = 'iphone-15-pro';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '256GB - Natural Titanium', 'APL-IP15P-256-NT', 100.00
FROM products WHERE slug = 'iphone-15-pro';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '512GB - Blue Titanium', 'APL-IP15P-512-BT', 200.00
FROM products WHERE slug = 'iphone-15-pro';

-- Galaxy S24 Ultra variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '256GB - Titanium Gray', 'SAM-S24U-256-TG', 0.00
FROM products WHERE slug = 'samsung-galaxy-s24-ultra';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '512GB - Titanium Black', 'SAM-S24U-512-TB', 120.00
FROM products WHERE slug = 'samsung-galaxy-s24-ultra';

-- MacBook Pro variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'M3 Pro - 18GB RAM - 512GB SSD', 'APL-MBP14-M3P-18-512', 0.00
FROM products WHERE slug = 'macbook-pro-14';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'M3 Pro - 36GB RAM - 1TB SSD', 'APL-MBP14-M3P-36-1TB', 400.00
FROM products WHERE slug = 'macbook-pro-14';

-- Dell XPS 15 variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'i7 - 16GB RAM - 512GB SSD', 'DEL-XPS15-I7-16-512', 0.00
FROM products WHERE slug = 'dell-xps-15';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'i7 - 32GB RAM - 1TB SSD', 'DEL-XPS15-I7-32-1TB', 300.00
FROM products WHERE slug = 'dell-xps-15';

-- Sony WH-1000XM5 variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Black', 'SNY-WH1000XM5-BLK', 0.00
FROM products WHERE slug = 'sony-wh-1000xm5';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Silver', 'SNY-WH1000XM5-SLV', 0.00
FROM products WHERE slug = 'sony-wh-1000xm5';

-- Beats Studio Pro variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Black', 'BTS-STPRO-BLK', 0.00
FROM products WHERE slug = 'beats-studio-pro';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Navy', 'BTS-STPRO-NVY', 0.00
FROM products WHERE slug = 'beats-studio-pro';

-- Anker PowerCore variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Black', 'ANK-PC20K-BLK', 0.00
FROM products WHERE slug = 'anker-powercore-20k';

-- Logitech MX Master 3S variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Graphite', 'LOG-MXM3S-GRP', 0.00
FROM products WHERE slug = 'logitech-mx-master-3s';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, 'Pale Gray', 'LOG-MXM3S-PGR', 0.00
FROM products WHERE slug = 'logitech-mx-master-3s';

-- iPad Pro variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '128GB - Wi-Fi - Space Gray', 'APL-IPADP129-128-SG', 0.00
FROM products WHERE slug = 'ipad-pro-12-9';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '256GB - Wi-Fi - Silver', 'APL-IPADP129-256-SL', 100.00
FROM products WHERE slug = 'ipad-pro-12-9';

-- Galaxy Tab S9 variants
INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '128GB - Graphite', 'SAM-TABS9-128-GRP', 0.00
FROM products WHERE slug = 'samsung-galaxy-tab-s9';

INSERT INTO product_variants (product_id, name, sku, price_adjustment)
SELECT id, '256GB - Beige', 'SAM-TABS9-256-BGE', 100.00
FROM products WHERE slug = 'samsung-galaxy-tab-s9';

