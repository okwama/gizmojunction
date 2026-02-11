-- Create Audit Logs table for administrative tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view audit logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view audit logs' AND tablename = 'audit_logs'
    ) THEN
        CREATE POLICY "Admins can view audit logs"
          ON audit_logs
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM user_roles ur
              JOIN roles r ON ur.role_id = r.id
              WHERE ur.user_id = auth.uid()
              AND r.name IN ('admin', 'operations')
            )
          );
    END IF;
END
$$;
