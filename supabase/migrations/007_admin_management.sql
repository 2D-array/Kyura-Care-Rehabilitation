-- Add is_suspended column to profiles table to support banning/suspending accounts
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Create admin auditing action logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_user TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for fast retrieval
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
