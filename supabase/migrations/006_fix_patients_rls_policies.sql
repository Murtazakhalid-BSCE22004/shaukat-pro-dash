-- Fix RLS policies for patients table to allow public access
-- Drop existing policies
DROP POLICY IF EXISTS "Patients are viewable by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be created by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be updated by authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Patients can be deleted by authenticated users" ON public.patients;

-- Create new policies that allow public access
CREATE POLICY "Patients are viewable by everyone" ON public.patients
    FOR SELECT USING (true);

CREATE POLICY "Patients can be created by everyone" ON public.patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can be updated by everyone" ON public.patients
    FOR UPDATE USING (true);

CREATE POLICY "Patients can be deleted by everyone" ON public.patients
    FOR DELETE USING (true);
