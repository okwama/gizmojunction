-- Fix relationships to enable proper joins
-- This adds an explicit FK from user_roles.user_id to profiles.id
-- Note: profiles.id is already a FK to auth.users.id, but PostgREST needs explicit relationships for embedding

DO $$
BEGIN
    -- Check if the constraint already exists to avoid errors
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey_profiles'
    ) THEN
        -- We first need to ensure the old FK (to auth.users) is either replaced or we add a second one.
        -- Ideally, user_roles.user_id should point to auth.users. 
        -- However, for PostgREST to join user_roles <-> profiles, they need to be related.
        -- Since profiles.id = auth.users.id (1:1), we can technically FK to profiles.id
        
        -- Let's drop the existing constraint to auth.users if we want to force it to profiles, 
        -- OR we can rely on the fact that they are the same ID.
        -- But PostgREST is strict.
        
        -- A better approach for PostgREST is often to let them query through the common field if detected,
        -- but since it failed, we will add a specific constraint if possible or just rely on the manual join I did earlier 
        -- if we want to avoid schema complexity. 
        
        -- ACTUALLY, the user wanted a "permanent fix". 
        -- The "manual join" in code IS a permanent fix for code. 
        -- But to fix it for Supabase Client `select(..., user_roles(...))` syntax:
        
        ALTER TABLE user_roles
        DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

        ALTER TABLE user_roles
        ADD CONSTRAINT user_roles_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END
$$;
