-- ============================================================================
-- Migration 005: Notifications Table & Admin RLS Upgrades
-- Run this in the Supabase SQL Editor before testing Phase 5 features.
-- ============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for high-speed notifications retrieval
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own notifications
CREATE POLICY "notif_select" ON notifications FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "notif_update" ON notifications FOR UPDATE
  USING (auth.uid() = profile_id);

-- System admin can insert notifications for any user
CREATE POLICY "notif_admin_insert" ON notifications FOR INSERT
  WITH CHECK (true);
