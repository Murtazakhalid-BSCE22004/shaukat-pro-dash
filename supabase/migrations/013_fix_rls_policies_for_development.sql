-- Fix RLS policies for development - allow public access to medical tables
-- This is for development only. In production, implement proper authentication.

-- 1. Fix RLS policies for doctors table
DROP POLICY IF EXISTS "Doctors are viewable by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be created by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be updated by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be deleted by authenticated users" ON public.doctors;

CREATE POLICY "Doctors are viewable by everyone" ON public.doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can be created by everyone" ON public.doctors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors can be updated by everyone" ON public.doctors
    FOR UPDATE USING (true);

CREATE POLICY "Doctors can be deleted by everyone" ON public.doctors
    FOR DELETE USING (true);

-- 2. Fix RLS policies for patients table
DROP POLICY IF EXISTS "Patients are viewable by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be created by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be updated by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be deleted by authenticated users" ON public.patients;

CREATE POLICY "Patients are viewable by everyone" ON public.patients
    FOR SELECT USING (true);

CREATE POLICY "Patients can be created by everyone" ON public.patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can be updated by everyone" ON public.patients
    FOR UPDATE USING (true);

CREATE POLICY "Patients can be deleted by everyone" ON public.patients
    FOR DELETE USING (true);

-- 3. Update doctor percentages to have realistic values (not 0)
UPDATE public.doctors 
SET 
    opd_percentage = 70,
    lab_percentage = 70,
    ultrasound_percentage = 70,
    ecg_percentage = 70,
    ot_percentage = 70
WHERE opd_percentage = 0 OR opd_percentage IS NULL;

-- Note: This migration allows public access to medical data for development.
-- In production, you should implement proper authentication and restrict access.
