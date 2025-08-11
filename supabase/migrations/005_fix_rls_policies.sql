-- Fix RLS policies for doctors table to allow public access
-- Drop existing policies
DROP POLICY IF EXISTS "Doctors are viewable by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be created by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be updated by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be deleted by authenticated users" ON public.doctors;

-- Create new policies that allow public access
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can be created by everyone" ON public.doctors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors can be updated by everyone" ON public.doctors
    FOR UPDATE USING (true);

CREATE POLICY "Doctors can be deleted by everyone" ON public.doctors
    FOR DELETE USING (true);
