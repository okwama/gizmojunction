-- Fix reviews foreign key to point to profiles instead of auth.users
-- This allows PostgREST to detect the relationship and embed profile data

DO $$ BEGIN
  -- Drop the old constraint if it exists (referencing auth.users)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_fkey') THEN
    ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
  END IF;
END $$;

-- Add the new constraint referencing profiles
ALTER TABLE reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
