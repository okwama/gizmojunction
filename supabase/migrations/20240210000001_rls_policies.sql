-- Row Level Security (RLS) Policies for Gizmo Junction

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES
-- ============================================

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- BRANDS & CATEGORIES (PUBLIC READ)
-- ============================================

CREATE POLICY "Brands are viewable by everyone"
ON brands FOR SELECT
USING (true);

CREATE POLICY "Admins can manage brands"
ON brands FOR ALL
USING (is_admin());

CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (is_admin());

-- ============================================
-- PRODUCTS
-- ============================================

CREATE POLICY "Published products are viewable by everyone"
ON products FOR SELECT
USING (is_published = true AND deleted_at IS NULL OR is_admin());

CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (is_admin());

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

CREATE POLICY "Variants of published products are viewable"
ON product_variants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.is_published = true
    AND products.deleted_at IS NULL
  )
  OR is_admin()
);

CREATE POLICY "Admins can manage variants"
ON product_variants FOR ALL
USING (is_admin());

-- ============================================
-- PRODUCT IMAGES
-- ============================================

CREATE POLICY "Product images are viewable"
ON product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.is_published = true
    AND products.deleted_at IS NULL
  )
  OR is_admin()
);

CREATE POLICY "Admins can manage product images"
ON product_images FOR ALL
USING (is_admin());

-- ============================================
-- INVENTORY
-- ============================================

CREATE POLICY "Inventory levels are viewable"
ON inventory_levels FOR SELECT
USING (true);

CREATE POLICY "Admins and inventory managers can manage inventory"
ON inventory_levels FOR ALL
USING (is_admin() OR has_role('inventory_manager'));

CREATE POLICY "Inventory movements are viewable by staff"
ON inventory_movements FOR SELECT
USING (is_admin() OR has_role('inventory_manager'));

CREATE POLICY "Staff can create inventory movements"
ON inventory_movements FOR INSERT
WITH CHECK (is_admin() OR has_role('inventory_manager'));

-- ============================================
-- CARTS
-- ============================================

CREATE POLICY "Users can view own cart"
ON carts FOR SELECT
USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can create own cart"
ON carts FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own cart"
ON carts FOR UPDATE
USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can delete own cart"
ON carts FOR DELETE
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- ============================================
-- CART ITEMS
-- ============================================

CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
  )
);

CREATE POLICY "Users can manage own cart items"
ON cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
  )
);

-- ============================================
-- ORDERS
-- ============================================

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id OR is_admin() OR has_role('operations'));

CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update orders"
ON orders FOR UPDATE
USING (is_admin() OR has_role('operations'));

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR is_admin() OR has_role('operations'))
  )
);

CREATE POLICY "Order items created with order"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "System can create payments"
ON payments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update payments"
ON payments FOR UPDATE
USING (is_admin());

-- ============================================
-- REVIEWS
-- ============================================

CREATE POLICY "Approved reviews are viewable"
ON reviews FOR SELECT
USING (is_approved = true OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id AND is_approved = false);

CREATE POLICY "Admins can manage all reviews"
ON reviews FOR ALL
USING (is_admin());

-- ============================================
-- PRODUCT QUESTIONS
-- ============================================

CREATE POLICY "Published questions are viewable"
ON product_questions FOR SELECT
USING (is_published = true OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create questions"
ON product_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can answer questions"
ON product_questions FOR UPDATE
USING (is_admin() OR has_role('customer_support'));

-- ============================================
-- AUDIT & ACTIVITY LOGS
-- ============================================

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (is_admin());

CREATE POLICY "System can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own activity"
ON activity_logs FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "System can create activity logs"
ON activity_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- ROLES & USER_ROLES
-- ============================================

CREATE POLICY "Roles are viewable by authenticated users"
ON roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage roles"
ON roles FOR ALL
USING (is_admin());

CREATE POLICY "User roles are viewable by owner and admins"
ON user_roles FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage user roles"
ON user_roles FOR ALL
USING (is_admin());

-- ============================================
-- WAREHOUSES
-- ============================================

CREATE POLICY "Warehouses are viewable by staff"
ON warehouses FOR SELECT
USING (is_admin() OR has_role('inventory_manager') OR has_role('operations'));

CREATE POLICY "Admins can manage warehouses"
ON warehouses FOR ALL
USING (is_admin());
