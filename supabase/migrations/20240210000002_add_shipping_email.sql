-- Add shipping_email to orders for guest checkout support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email TEXT;
