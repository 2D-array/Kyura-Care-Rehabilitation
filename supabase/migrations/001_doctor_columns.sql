-- ============================================================================
-- Migration 001: Doctor Columns, Availability Table, Doctor Stats View
-- Run this in the Supabase SQL Editor before testing Phase 1 features.
-- ============================================================================

-- 1. Add missing columns to doctors table
ALTER TABLE doctors 
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_session_types TEXT[] DEFAULT '{"online","in-clinic","at-home"}';

-- 2. Create availability table for structured weekly schedule
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_types TEXT[] NOT NULL DEFAULT '{"online","in-clinic","at-home"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by doctor
CREATE INDEX IF NOT EXISTS idx_availability_doctor_id ON availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_availability_doctor_day ON availability(doctor_id, day_of_week);

-- 3. Create doctor_stats view for aggregated ratings
CREATE OR REPLACE VIEW doctor_stats AS
  SELECT 
    d.id,
    COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS average_rating,
    COUNT(r.id)::INTEGER AS review_count
  FROM doctors d
  LEFT JOIN reviews r ON r.doctor_id = d.id
  GROUP BY d.id;

-- 4. Enable RLS on availability table
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Public can read availability (needed for booking widget)
CREATE POLICY "avail_public_read" ON availability FOR SELECT USING (true);

-- Doctors can manage their own availability
CREATE POLICY "avail_doctor_write" ON availability FOR INSERT 
  WITH CHECK (doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()));

CREATE POLICY "avail_doctor_update" ON availability FOR UPDATE 
  USING (doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()));

CREATE POLICY "avail_doctor_delete" ON availability FOR DELETE 
  USING (doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()));
