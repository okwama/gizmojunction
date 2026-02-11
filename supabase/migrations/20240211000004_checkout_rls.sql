-- Enable RLS
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create orders (guests + auth)
CREATE POLICY "Enable insert for all users" ON "public"."orders"
FOR INSERT WITH CHECK (true);

-- Allow anyone to create order items
CREATE POLICY "Enable insert for all users" ON "public"."order_items"
FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders
CREATE POLICY "Enable select for own orders" ON "public"."orders"
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to view their own order items
CREATE POLICY "Enable select for own order items" ON "public"."order_items"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM "public"."orders"
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);
