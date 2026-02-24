-- Add abandoned_email_sent flag to carts table
-- This prevents duplicate abandoned cart recovery emails from being sent
ALTER TABLE carts ADD COLUMN IF NOT EXISTS abandoned_email_sent BOOLEAN DEFAULT false;
