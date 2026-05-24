-- ============================================================================
-- Migration 002: Razorpay Columns + Subscriptions Columns for Patients
-- Run this in the Supabase SQL Editor before testing Phase 2 features.
-- ============================================================================

-- Add Razorpay-related columns to patients table
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

-- Add missing columns to subscriptions table to support premium membership periods
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan TEXT,
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Index for fast Razorpay lookups during verification/webhook processing
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order ON subscriptions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
