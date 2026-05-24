-- ============================================================================
-- Migration 004: Video Rooms & In-App Chat Messages
-- Run this in the Supabase SQL Editor before testing Phase 4 features.
-- ============================================================================

-- Add 100ms room ID column to appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS hms_room_id TEXT;

-- Create chat messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for high-speed chat retrieval
CREATE INDEX IF NOT EXISTS idx_messages_appointment ON messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Patients can view and write messages for appointments they belong to
CREATE POLICY "msg_patient_select" ON messages FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE patient_id = auth.uid()
    )
  );

CREATE POLICY "msg_patient_insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    appointment_id IN (
      SELECT id FROM appointments WHERE patient_id = auth.uid()
    )
  );

-- Doctors can view and write messages for appointments they belong to
CREATE POLICY "msg_doctor_select" ON messages FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE doctor_id IN (
        SELECT id FROM doctors WHERE profile_id = auth.uid()
      ) OR doctor_id = auth.uid()
    )
  );

CREATE POLICY "msg_doctor_insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    appointment_id IN (
      SELECT id FROM appointments WHERE doctor_id IN (
        SELECT id FROM doctors WHERE profile_id = auth.uid()
      ) OR doctor_id = auth.uid()
    )
  );
