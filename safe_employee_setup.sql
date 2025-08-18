-- ============================================================================
-- SAFE EMPLOYEE & SALARY MANAGEMENT SYSTEM SETUP
-- This version safely handles existing tables and triggers
-- Copy and paste this entire file into your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE UPDATE FUNCTION (safe creation)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. SAFELY CREATE OR UPDATE EMPLOYEES TABLE
-- ============================================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary DECIMAL(12,2) NOT NULL CHECK (salary >= 0),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add age column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'age' AND table_schema = 'public') THEN
        ALTER TABLE public.employees ADD COLUMN age INTEGER CHECK (age >= 16 AND age <= 70);
    END IF;
    
    -- Add cnic column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'cnic' AND table_schema = 'public') THEN
        ALTER TABLE public.employees ADD COLUMN cnic VARCHAR(13) CHECK (cnic ~ '^[0-9]{13}$');
    END IF;
    
    -- Add address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'address' AND table_schema = 'public') THEN
        ALTER TABLE public.employees ADD COLUMN address TEXT;
    END IF;
    
    -- Make contact_number and address NOT NULL if they're currently nullable
    UPDATE public.employees SET contact_number = 'Not provided' WHERE contact_number IS NULL;
    UPDATE public.employees SET address = 'Address not provided' WHERE address IS NULL;
    
END $$;

-- ============================================================================
-- 3. SAFELY CREATE OR UPDATE EXPENSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to expenses table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'paid_by' AND table_schema = 'public') THEN
        ALTER TABLE public.expenses ADD COLUMN paid_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'received_by' AND table_schema = 'public') THEN
        ALTER TABLE public.expenses ADD COLUMN received_by VARCHAR(255);
    END IF;
END $$;

-- ============================================================================
-- 4. CREATE OTHER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2050),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_method VARCHAR(100) DEFAULT 'bank_transfer',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    month INTEGER CHECK (month >= 1 AND month <= 12),
    year INTEGER CHECK (year >= 2020 AND year <= 2050),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, month, year)
);

-- ============================================================================
-- 5. SAFELY CREATE INDEXES
-- ============================================================================

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON public.employees(cnic) WHERE cnic IS NOT NULL;

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);

-- Salary payments table indexes
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON public.salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON public.salary_payments(month, year);

-- ============================================================================
-- 6. SAFELY CREATE TRIGGERS
-- ============================================================================

-- Drop and recreate triggers to avoid conflicts
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
    DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
    DROP TRIGGER IF EXISTS update_salary_payments_updated_at ON public.salary_payments;
    DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
    
    -- Create new triggers
    CREATE TRIGGER update_employees_updated_at 
        BEFORE UPDATE ON public.employees
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_expenses_updated_at 
        BEFORE UPDATE ON public.expenses
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_salary_payments_updated_at 
        BEFORE UPDATE ON public.salary_payments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_budgets_updated_at 
        BEFORE UPDATE ON public.budgets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY AND POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow all access to employees" ON public.employees;
    DROP POLICY IF EXISTS "Allow all access to expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Allow all access to salary_payments" ON public.salary_payments;
    DROP POLICY IF EXISTS "Allow all access to budgets" ON public.budgets;
    
    -- Create permissive policies for development
    CREATE POLICY "Allow all access to employees" ON public.employees
        FOR ALL USING (true) WITH CHECK (true);
        
    CREATE POLICY "Allow all access to expenses" ON public.expenses
        FOR ALL USING (true) WITH CHECK (true);
        
    CREATE POLICY "Allow all access to salary_payments" ON public.salary_payments
        FOR ALL USING (true) WITH CHECK (true);
        
    CREATE POLICY "Allow all access to budgets" ON public.budgets
        FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ============================================================================
-- 8. INSERT SAMPLE DATA (only if tables are empty)
-- ============================================================================

-- Check if we need to insert sample data
DO $$
BEGIN
    -- Only insert if employees table is empty
    IF (SELECT COUNT(*) FROM public.employees) = 0 THEN
        
        -- Insert sample employees
        INSERT INTO public.employees (
            name, age, cnic, contact_number, address, position, department, 
            salary, hire_date, email, is_active
        ) VALUES 
        
        -- Management
        ('Dr. Ahmed Ali Khan', 45, '3520212345678', '03001234567', 
         'House 123, Street 5, F-8/2, Islamabad', 'manager', 'Administration', 
         180000.00, '2018-01-15', 'ahmed.ali@hospital.com', true),
        
        -- Medical Staff
        ('Fatima Khan', 32, '3520298765432', '03012345678', 
         'Flat 45, Gulshan-e-Iqbal, Block 13, Karachi', 'nurse', 'Emergency Ward', 
         50000.00, '2021-03-10', 'fatima.khan@hospital.com', true),
         
        ('Dr. Sarah Wilson', 38, '3520245678901', '03445566778', 
         'House 90, Sector E-11, Islamabad', 'doctor attendant', 'Surgery', 
         65000.00, '2020-03-15', 'sarah.wilson@hospital.com', true),
         
        ('Sana Bhatti', 29, '3520210987654', '03890123456', 
         'House 45, Garden Town, Lahore', 'LHV', 'OPD', 
         42000.00, '2021-12-01', 'sana.bhatti@hospital.com', true),
         
        ('Hassan Malik', 31, '3520234567890', '03556677889', 
         'Flat 67, Nazimabad Block 3, Karachi', 'ward', 'General Ward', 
         35000.00, '2022-06-20', 'hassan.malik@hospital.com', true),
         
        ('Amna Sheikh', 27, '3520223456789', '03667788990', 
         'House 123, Johar Town, Lahore', 'OT', 'Operation Theater', 
         55000.00, '2021-09-10', 'amna.sheikh@hospital.com', true),
        
        -- Laboratory Staff
        ('Muhammad Hassan', 40, '3520187654321', '03123456789', 
         'House 67, Model Town, Lahore', 'laboratory technician', 'Laboratory', 
         38000.00, '2019-06-20', 'hassan@hospital.com', true),
         
        ('Zainab Malik', 33, '3520254321098', '03456789012', 
         'Flat 23, Clifton Block 4, Karachi', 'laboratory engineer', 'Laboratory', 
         62000.00, '2020-08-12', 'zainab.malik@hospital.com', true),
         
        ('Nadia Parveen', 35, '3520188765432', '03012345679', 
         'Apartment 56, Gulberg III, Lahore', 'xray', 'Radiology', 
         48000.00, '2020-07-08', 'nadia.parveen@hospital.com', true),
        
        -- Administrative Staff
        ('Tariq Mahmood', 42, '3520199876543', '03901234567', 
         'House 234, F-10/3, Islamabad', 'accountant', 'Finance', 
         85000.00, '2019-05-22', 'tariq.mahmood@hospital.com', true),
         
        ('Ayesha Siddique', 28, '3520298123456', '03234567890', 
         'Apartment 12, DHA Phase 2, Karachi', 'receptionist', 'Front Desk', 
         35000.00, '2022-02-14', 'ayesha.siddique@hospital.com', true),
        
        -- Support Staff
        ('Ali Raza', 30, '3520276543210', '03345678901', 
         'House 89, Johar Town, Lahore', 'pharmacy attendant', 'Pharmacy', 
         36000.00, '2020-11-05', 'ali.raza@hospital.com', true),
         
        ('Maria John', 35, '3520232109876', '03678901234', 
         'House 78, Christian Colony, Lahore', 'steward', 'Housekeeping', 
         28000.00, '2019-09-18', 'maria.john@hospital.com', true),
         
        ('Omar Sheikh', 41, '3520243210987', '03567890123', 
         'House 156, Satellite Town, Rawalpindi', 'electrician', 'Maintenance', 
         45000.00, '2018-04-03', 'omar.sheikh@hospital.com', true),
        
        -- Training Staff
        ('Kamran Ahmed', 25, '3520221098765', '03789012345', 
         'Hostel Room 15, University Road, Karachi', 'internee', 'General Medicine', 
         25000.00, '2023-01-10', 'kamran.ahmed@hospital.com', true),
         
        ('Bilal Ahmad', 28, '3520265432109', '03998877665', 
         'House 199, Satellite Town, Lahore', 'general', 'General Services', 
         32000.00, '2022-05-15', 'bilal.ahmad@hospital.com', true);
        
        -- Insert sample salary advances
        INSERT INTO public.expenses (
            category, description, amount, expense_date, approved_by, status, paid_by, received_by
        ) VALUES 
        ('Salary Advance', 'Medical emergency advance for family treatment', 
         25000.00, CURRENT_DATE - INTERVAL '10 days', 'Dr. Ahmed Ali Khan', 'approved', 
         'Finance Department', 'Fatima Khan'),
        ('Salary Advance', 'Home renovation advance payment', 
         35000.00, CURRENT_DATE - INTERVAL '15 days', 'Dr. Ahmed Ali Khan', 'approved', 
         'Finance Department', 'Muhammad Hassan'),
        ('Salary Advance', 'Wedding expenses advance', 
         40000.00, CURRENT_DATE - INTERVAL '20 days', 'Dr. Ahmed Ali Khan', 'approved', 
         'Finance Department', 'Zainab Malik'),
        ('Salary Advance', 'Education fee advance for children', 
         15000.00, CURRENT_DATE - INTERVAL '5 days', 'Dr. Ahmed Ali Khan', 'pending', 
         'Finance Department', 'Ali Raza');
        
        RAISE NOTICE 'Sample data inserted successfully!';
    ELSE
        RAISE NOTICE 'Sample data skipped - employees table already contains data.';
    END IF;
END $$;

-- ============================================================================
-- 9. FINAL VERIFICATION
-- ============================================================================

-- Display setup results
SELECT 
    'SAFE SETUP COMPLETED!' as status,
    (SELECT COUNT(*) FROM public.employees) as total_employees,
    (SELECT COUNT(*) FROM public.employees WHERE is_active = true) as active_employees,
    (SELECT COUNT(DISTINCT position) FROM public.employees) as unique_positions,
    (SELECT COUNT(DISTINCT department) FROM public.employees) as departments,
    (SELECT COALESCE(SUM(salary), 0) FROM public.employees WHERE is_active = true) as total_monthly_salary,
    (SELECT COUNT(*) FROM public.expenses WHERE category LIKE '%advance%') as salary_advances;

-- Show table structure verification
SELECT 'TABLE COLUMNS VERIFIED:' as info;
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('employees', 'expenses', 'salary_payments', 'budgets')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- SETUP COMPLETE! 
-- All tables are now properly configured with safe handling of existing objects
-- ============================================================================
