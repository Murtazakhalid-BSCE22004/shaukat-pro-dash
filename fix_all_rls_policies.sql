-- Run this SQL in your Supabase dashboard SQL Editor to fix RLS policies for both tables

-- Fix RLS policies for doctors table
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

-- Fix RLS policies for patients table
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
