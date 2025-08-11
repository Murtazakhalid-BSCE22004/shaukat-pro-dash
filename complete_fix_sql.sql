-- Complete fix for RLS policies and percentage fields
-- Run this entire script in your Supabase dashboard SQL Editor

-- 1. Fix RLS policies for doctors table
-- Drop existing policies first
DROP POLICY IF EXISTS "Doctors are viewable by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be created by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be updated by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be deleted by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be created by everyone" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be updated by everyone" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be deleted by everyone" ON public.doctors;

-- Create new policies
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can be created by everyone" ON public.doctors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors can be updated by everyone" ON public.doctors
    FOR UPDATE USING (true);

CREATE POLICY "Doctors can be deleted by everyone" ON public.doctors
    FOR DELETE USING (true);

-- 2. Fix RLS policies for patients table
-- Drop existing policies first
DROP POLICY IF EXISTS "Patients are viewable by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be created by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be updated by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be deleted by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients are viewable by everyone" ON public.patients;
DROP POLICY IF EXISTS "Patients can be created by everyone" ON public.patients;
DROP POLICY IF EXISTS "Patients can be updated by everyone" ON public.patients;
DROP POLICY IF EXISTS "Patients can be deleted by everyone" ON public.patients;

-- Create new policies
CREATE POLICY "Patients are viewable by everyone" ON public.patients
    FOR SELECT USING (true);

CREATE POLICY "Patients can be created by everyone" ON public.patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can be updated by everyone" ON public.patients
    FOR UPDATE USING (true);

CREATE POLICY "Patients can be deleted by everyone" ON public.patients
    FOR DELETE USING (true);

-- 3. Add percentage fields to doctors table (if not already added)
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS opd_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultrasound_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ecg_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_percentage INTEGER DEFAULT 0;

-- 4. Update existing doctors to have default percentages (0)
UPDATE public.doctors 
SET 
    opd_percentage = 0,
    lab_percentage = 0,
    ultrasound_percentage = 0,
    ecg_percentage = 0,
    ot_percentage = 0
WHERE opd_percentage IS NULL;
