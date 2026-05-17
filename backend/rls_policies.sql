-- ==============================================================================
-- Kyura-Care Row-Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor to secure your database.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can only read and update their own profile.
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- PATIENTS POLICIES
-- ------------------------------------------------------------------------------
-- Patients can read and update their own patient record.
CREATE POLICY "Patients can view own record" 
ON patients FOR SELECT 
USING (auth.uid() = profile_id);

CREATE POLICY "Patients can update own record" 
ON patients FOR UPDATE 
USING (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- DOCTORS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can view doctors (needed for the public marketplace).
CREATE POLICY "Anyone can view doctors" 
ON doctors FOR SELECT 
USING (true);

-- Doctors can update their own doctor record.
CREATE POLICY "Doctors can update own record" 
ON doctors FOR UPDATE 
USING (auth.uid() = profile_id);

-- ------------------------------------------------------------------------------
-- APPOINTMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Patients can see their own appointments.
CREATE POLICY "Patients can view own appointments" 
ON appointments FOR SELECT 
USING (auth.uid() = patient_id);

-- Doctors can see appointments booked with them.
CREATE POLICY "Doctors can view appointments booked with them" 
ON appointments FOR SELECT 
USING (auth.uid() = doctor_id);

-- Patients can create appointments for themselves.
CREATE POLICY "Patients can create appointments" 
ON appointments FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- ------------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can view reviews (needed for doctor profiles).
CREATE POLICY "Anyone can view reviews" 
ON reviews FOR SELECT 
USING (true);

-- Patients can insert reviews for themselves.
CREATE POLICY "Patients can create reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own reviews.
CREATE POLICY "Patients can update own reviews" 
ON reviews FOR UPDATE 
USING (auth.uid() = patient_id);

-- ------------------------------------------------------------------------------
-- SUBSCRIPTIONS POLICIES
-- ------------------------------------------------------------------------------
-- Patients can view and manage their own subscriptions.
CREATE POLICY "Patients can view own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = profile_id);

CREATE POLICY "Patients can insert own subscriptions" 
ON subscriptions FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Patients can update own subscriptions" 
ON subscriptions FOR UPDATE 
USING (auth.uid() = profile_id);
