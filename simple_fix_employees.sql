-- SIMPLE FIX - Just add the missing columns to employees table
-- Copy and paste this into your Supabase SQL Editor

-- Add the missing columns
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cnic VARCHAR(13);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS address TEXT;

-- Add missing columns to expenses table for salary advances
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

-- Add basic constraints
ALTER TABLE public.employees ADD CONSTRAINT employees_age_check CHECK (age IS NULL OR (age >= 16 AND age <= 70));
ALTER TABLE public.employees ADD CONSTRAINT employees_cnic_check CHECK (cnic IS NULL OR (cnic ~ '^[0-9]{13}$'));

-- Success message
SELECT 'Columns added successfully! Your employees table now has age, cnic, and address fields.' as result;
