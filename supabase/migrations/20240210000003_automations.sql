-- Gizmo Junction Automations
-- Triggers and helper functions for backend automation

-- 1. Ensure 'customer' and 'guest' roles exist
INSERT INTO roles (name, description)
VALUES 
  ('customer', 'Default registered customer'),
  ('guest', 'Temporary guest user role')
ON CONFLICT (name) DO NOTHING;

-- 2. Trigger for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  customer_role_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Get customer role ID
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer';

  -- Assign customer role
  IF customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, customer_role_id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Re-create trigger for signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to notify edge function of order status changes
-- This can be used with Supabase Webhooks (Admin UI) or this trigger
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS trigger 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- In a real environment, we'd use net.http_post here if the extension is enabled
    -- For now, Supabase Webhooks in the Dashboard are the preferred way to link to Edge Functions
    -- We'll create the Edge Function code and let the UI handle the trigger linkage
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
