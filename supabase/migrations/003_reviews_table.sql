-- ============================================================================
-- Migration 003: Reviews Table Upgrades & Unique Appointment Constraint
-- Run this in the Supabase SQL Editor before testing Phase 3 features.
-- ============================================================================

-- Add appointment_id column to reviews table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE;

-- Add UNIQUE constraint to prevent duplicate reviews for the same appointment slot
ALTER TABLE reviews
  ADD CONSTRAINT uq_reviews_appointment UNIQUE (appointment_id);
