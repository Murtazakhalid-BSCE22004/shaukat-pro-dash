-- FIX EMPLOYEES TABLE - Add missing columns
-- Run this SQL in your Supabase SQL Editor to add the missing columns

-- First, let's check what columns currently exist
-- (You can run this separately to see the current structure)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'employees' AND table_schema = 'public';

-- Add missing columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS age INTEGER;

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS cnic VARCHAR(13);

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update expenses table to add missing columns for salary advances
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255);

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON public.employees(cnic) WHERE cnic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_age ON public.employees(age) WHERE age IS NOT NULL;

-- Add constraints for data validation
ALTER TABLE public.employees 
ADD CONSTRAINT IF NOT EXISTS employees_age_check 
CHECK (age IS NULL OR (age >= 16 AND age <= 70));

ALTER TABLE public.employees 
ADD CONSTRAINT IF NOT EXISTS employees_cnic_check 
CHECK (cnic IS NULL OR (cnic ~ '^[0-9]{13}$'));

-- Update any existing employees with sample data (optional)
-- You can skip this section if you want to keep existing data as-is

-- First, let's see if there are any existing employees
DO $$
DECLARE
    employee_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO employee_count FROM public.employees;
    
    IF employee_count = 0 THEN
        -- If no employees exist, insert sample data
        INSERT INTO public.employees (
            name, age, cnic, contact_number, address, position, department, 
            salary, hire_date, email, is_active
        ) VALUES 
        ('Dr. Ahmed Ali', 35, '3520212345678', '03001234567', 
         'House 123, Street 5, F-8/2, Islamabad', 'manager', 'Administration', 
         150000.00, '2020-01-15', 'ahmed.ali@hospital.com', true),
        
        ('Fatima Khan', 28, '3520298765432', '03012345678', 
         'Flat 45, Gulshan-e-Iqbal, Block 13, Karachi', 'nurse', 'Emergency Ward', 
         45000.00, '2021-03-10', 'fatima.khan@hospital.com', true),
        
        ('Muhammad Hassan', 42, '3520187654321', '03123456789', 
         'House 67, Model Town, Lahore', 'laboratory technician', 'Laboratory', 
         35000.00, '2019-06-20', 'hassan@hospital.com', true),
        
        ('Ayesha Siddique', 26, '3520298123456', '03234567890', 
         'Apartment 12, DHA Phase 2, Karachi', 'receptionist', 'Front Desk', 
         30000.00, '2022-02-14', 'ayesha.siddique@hospital.com', true),
        
        ('Ali Raza', 31, '3520276543210', '03345678901', 
         'House 89, Johar Town, Lahore', 'pharmacy attendant', 'Pharmacy', 
         32000.00, '2020-11-05', 'ali.raza@hospital.com', true);
        
        RAISE NOTICE 'Sample employees added successfully!';
    ELSE
        -- If employees exist, just update the first one as an example
        UPDATE public.employees 
        SET 
            age = 35,
            cnic = '3520212345678',
            address = 'Sample Address, City, Country'
        WHERE id = (SELECT id FROM public.employees LIMIT 1);
        
        RAISE NOTICE 'Existing employees table updated with new columns. You can manually update the age, cnic, and address for existing employees.';
    END IF;
END $$;

-- Add some sample salary advances if expenses table is empty
INSERT INTO public.expenses (
    category, description, amount, expense_date, approved_by, status, paid_by, received_by
) 
SELECT 
    'Salary Advance', 
    'Emergency advance for ' || name, 
    15000.00, 
    CURRENT_DATE - INTERVAL '5 days', 
    'Finance Manager', 
    'approved', 
    'Finance Department', 
    name
FROM public.employees 
WHERE NOT EXISTS (SELECT 1 FROM public.expenses WHERE category LIKE '%advance%')
LIMIT 3;

-- Display the updated table structure
SELECT 
    'Fix completed successfully!' as status,
    (SELECT COUNT(*) FROM public.employees) as total_employees,
    (SELECT COUNT(*) FROM public.employees WHERE age IS NOT NULL) as employees_with_age,
    (SELECT COUNT(*) FROM public.employees WHERE cnic IS NOT NULL) as employees_with_cnic;

-- Show sample of updated data
SELECT 
    name, 
    age, 
    cnic, 
    position, 
    department,
    CASE WHEN address IS NOT NULL THEN 'Has Address' ELSE 'No Address' END as address_status
FROM public.employees 
LIMIT 5;
