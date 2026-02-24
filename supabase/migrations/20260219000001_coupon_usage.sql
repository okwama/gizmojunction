-- Migration: Coupon Usage Tracking
-- Description: Adds a function to safely increment coupon usage counts.

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = coupon_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
