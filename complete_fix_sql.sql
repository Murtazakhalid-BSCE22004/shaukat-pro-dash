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

-- 3. Fix RLS policies for employees table
-- Drop existing policies first
DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be created by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be updated by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees can be deleted by authenticated users" ON public.employees;

-- Create new policies
CREATE POLICY "Employees are viewable by everyone" ON public.employees
    FOR SELECT USING (true);

CREATE POLICY "Employees can be created by everyone" ON public.employees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Employees can be updated by everyone" ON public.employees
    FOR UPDATE USING (true);

CREATE POLICY "Employees can be deleted by everyone" ON public.employees
    FOR DELETE USING (true);

-- 4. Fix RLS policies for expenses table
-- Drop existing policies first
DROP POLICY IF EXISTS "Expenses are viewable by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be created by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be updated by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be deleted by authenticated users" ON public.expenses;

-- Create new policies
CREATE POLICY "Expenses are viewable by everyone" ON public.expenses
    FOR SELECT USING (true);

CREATE POLICY "Expenses can be created by everyone" ON public.expenses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Expenses can be updated by everyone" ON public.expenses
    FOR UPDATE USING (true);

CREATE POLICY "Expenses can be deleted by everyone" ON public.expenses
    FOR DELETE USING (true);

-- 5. Fix RLS policies for salary_payments table
-- Drop existing policies first
DROP POLICY IF EXISTS "Salary payments are viewable by authenticated users" ON public.salary_payments;
DROP POLICY IF EXISTS "Salary payments can be created by authenticated users" ON public.salary_payments;
DROP POLICY IF EXISTS "Salary payments can be updated by authenticated users" ON public.salary_payments;
DROP POLICY IF EXISTS "Salary payments can be deleted by authenticated users" ON public.salary_payments;

-- Create new policies
CREATE POLICY "Salary payments are viewable by everyone" ON public.salary_payments
    FOR SELECT USING (true);

CREATE POLICY "Salary payments can be created by everyone" ON public.salary_payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Salary payments can be updated by everyone" ON public.salary_payments
    FOR UPDATE USING (true);

CREATE POLICY "Salary payments can be deleted by everyone" ON public.salary_payments
    FOR DELETE USING (true);

-- 6. Add percentage fields to doctors table (if not already added)
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS opd_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultrasound_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ecg_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_percentage INTEGER DEFAULT 0;

-- 7. Update existing doctors to have default percentages (70 instead of 0)
UPDATE public.doctors 
SET 
    opd_percentage = 70,
    lab_percentage = 70,
    ultrasound_percentage = 70,
    ecg_percentage = 70,
    ot_percentage = 70
WHERE opd_percentage = 0 OR opd_percentage IS NULL;

-- 8. Add ot_fee column to patients table if not exists
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS ot_fee INTEGER DEFAULT 0;

-- 9. Ensure all required columns exist in employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS cnic VARCHAR(13),
ADD COLUMN IF NOT EXISTS address TEXT;

-- 10. Add paid_by and received_by fields to expenses table (for salary advances)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

-- Note: This script allows public access to all tables for development purposes.
-- In production, implement proper authentication and restrict access appropriately.