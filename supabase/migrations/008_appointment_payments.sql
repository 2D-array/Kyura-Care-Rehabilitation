-- Add Razorpay payment columns to appointments table to support pay-per-consultation
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Indexing for fast retrieval of appointment payments
CREATE INDEX IF NOT EXISTS idx_appointments_razorpay_order ON appointments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
