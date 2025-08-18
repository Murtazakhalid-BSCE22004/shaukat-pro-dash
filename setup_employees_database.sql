-- COMPLETE EMPLOYEE MANAGEMENT DATABASE SETUP
-- This file contains all necessary SQL commands to set up the employee management system
-- Run this in your Supabase SQL editor or PostgreSQL database

-- ============================================================================
-- 1. CREATE EMPLOYEES TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 16 AND age <= 70),
    cnic VARCHAR(13) CHECK (cnic ~ '^[0-9]{13}$'),
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE EXPENSES TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    receipt_url TEXT,
    paid_by VARCHAR(255),
    received_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE SALARY PAYMENTS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_method VARCHAR(100) DEFAULT 'bank_transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON public.employees(cnic);
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);

CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON public.salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON public.salary_payments(month, year);

-- ============================================================================
-- 5. CREATE UPDATE TRIGGER FUNCTION (if not exists)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 6. CREATE UPDATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salary_payments_updated_at ON public.salary_payments;
CREATE TRIGGER update_salary_payments_updated_at 
    BEFORE UPDATE ON public.salary_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. CREATE RLS POLICIES (Allow all operations for development)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public employees access" ON public.employees;
DROP POLICY IF EXISTS "Public expenses access" ON public.expenses;
DROP POLICY IF EXISTS "Public salary_payments access" ON public.salary_payments;

-- Create permissive policies for development
CREATE POLICY "Public employees access" ON public.employees
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public expenses access" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public salary_payments access" ON public.salary_payments
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 9. ADD TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE public.employees IS 'Hospital employees with complete personal and professional information';
COMMENT ON COLUMN public.employees.age IS 'Employee age (16-70 years)';
COMMENT ON COLUMN public.employees.cnic IS '13-digit Pakistani CNIC number without dashes';
COMMENT ON COLUMN public.employees.address IS 'Complete residential address';
COMMENT ON COLUMN public.employees.position IS 'Hospital position category';
COMMENT ON COLUMN public.employees.department IS 'Department or ward assignment';

-- ============================================================================
-- 10. INSERT SAMPLE DATA
-- ============================================================================

-- Clear existing sample data
DELETE FROM public.salary_payments;
DELETE FROM public.expenses WHERE category LIKE '%Salary%' OR category LIKE '%advance%';
DELETE FROM public.employees;

-- Insert sample employees
INSERT INTO public.employees (
    name, age, cnic, contact_number, address, position, department, 
    salary, hire_date, email, is_active
) VALUES 
-- Management
('Dr. Ahmed Ali', 35, '3520212345678', '03001234567', 
 'House 123, Street 5, F-8/2, Islamabad', 'manager', 'Administration', 
 150000.00, '2020-01-15', 'ahmed.ali@hospital.com', true),

-- Nursing Staff
('Fatima Khan', 28, '3520298765432', '03012345678', 
 'Flat 45, Gulshan-e-Iqbal, Block 13, Karachi', 'nurse', 'Emergency Ward', 
 45000.00, '2021-03-10', 'fatima.khan@hospital.com', true),

('Sana Bhatti', 27, '3520210987654', '03890123456', 
 'House 45, Garden Town, Lahore', 'LHV', 'OPD', 
 38000.00, '2021-12-01', 'sana.bhatti@hospital.com', true),

-- Laboratory Staff
('Muhammad Hassan', 42, '3520187654321', '03123456789', 
 'House 67, Model Town, Lahore', 'laboratory technician', 'Laboratory', 
 35000.00, '2019-06-20', 'hassan@hospital.com', true),

('Zainab Malik', 29, '3520254321098', '03456789012', 
 'Flat 23, Clifton Block 4, Karachi', 'laboratory engineer', 'Laboratory', 
 55000.00, '2021-08-12', 'zainab.malik@hospital.com', true),

-- Administrative Staff
('Ayesha Siddique', 26, '3520298123456', '03234567890', 
 'Apartment 12, DHA Phase 2, Karachi', 'receptionist', 'Front Desk', 
 30000.00, '2022-02-14', 'ayesha.siddique@hospital.com', true),

('Tariq Mahmood', 45, '3520199876543', '03901234567', 
 'House 234, F-10/3, Islamabad', 'accountant', 'Finance', 
 65000.00, '2017-05-22', 'tariq.mahmood@hospital.com', true),

-- Pharmacy and Support Staff
('Ali Raza', 31, '3520276543210', '03345678901', 
 'House 89, Johar Town, Lahore', 'pharmacy attendant', 'Pharmacy', 
 32000.00, '2020-11-05', 'ali.raza@hospital.com', true),

('Maria John', 33, '3520232109876', '03678901234', 
 'House 78, Christian Colony, Lahore', 'steward', 'Housekeeping', 
 25000.00, '2019-09-18', 'maria.john@hospital.com', true),

-- Technical Staff
('Omar Sheikh', 38, '3520243210987', '03567890123', 
 'House 156, Satellite Town, Rawalpindi', 'electrician', 'Maintenance', 
 40000.00, '2018-04-03', 'omar.sheikh@hospital.com', true),

('Nadia Parveen', 32, '3520188765432', '03012345679', 
 'Apartment 56, Gulberg III, Lahore', 'xray', 'Radiology', 
 42000.00, '2020-07-08', 'nadia.parveen@hospital.com', true),

-- Internee
('Kamran Ahmed', 24, '3520221098765', '03789012345', 
 'Hostel Room 15, University Road, Karachi', 'internee', 'General Medicine', 
 20000.00, '2023-01-10', 'kamran.ahmed@hospital.com', true),

-- Additional staff for variety
('Dr. Sarah Wilson', 40, '3520245678901', '03445566778', 
 'House 90, Sector E-11, Islamabad', 'doctor attendant', 'Surgery', 
 48000.00, '2019-03-15', 'sarah.wilson@hospital.com', true),

('Hassan Malik', 29, '3520234567890', '03556677889', 
 'Flat 67, Nazimabad Block 3, Karachi', 'ward', 'General Ward', 
 28000.00, '2022-06-20', 'hassan.malik@hospital.com', true),

('Amna Sheikh', 26, '3520223456789', '03667788990', 
 'House 123, Johar Town, Lahore', 'OT', 'Operation Theater', 
 50000.00, '2021-09-10', 'amna.sheikh@hospital.com', true);

-- Insert sample salary advances (expenses)
INSERT INTO public.expenses (
    category, description, amount, expense_date, approved_by, status, paid_by, received_by
) VALUES 
('Salary Advance', 'Emergency advance for Fatima Khan - Medical expenses', 
 15000.00, '2024-01-15', 'Dr. Ahmed Ali', 'approved', 'Finance Department', 'Fatima Khan'),

('Salary Advance', 'Advance payment for Muhammad Hassan - Home renovation', 
 20000.00, '2024-01-10', 'Dr. Ahmed Ali', 'approved', 'Finance Department', 'Muhammad Hassan'),

('Salary Advance', 'Emergency advance for Ali Raza - Family medical emergency', 
 12000.00, '2024-01-20', 'Dr. Ahmed Ali', 'pending', 'Finance Department', 'Ali Raza'),

('Salary Advance', 'Wedding expenses advance for Zainab Malik', 
 25000.00, '2024-01-05', 'Dr. Ahmed Ali', 'approved', 'Finance Department', 'Zainab Malik'),

('Salary Advance', 'Education fee advance for Kamran Ahmed', 
 8000.00, '2024-01-22', 'Dr. Ahmed Ali', 'pending', 'Finance Department', 'Kamran Ahmed');

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Display summary
SELECT 
    'Database setup completed successfully!' as status,
    (SELECT COUNT(*) FROM public.employees) as total_employees,
    (SELECT COUNT(*) FROM public.employees WHERE is_active = true) as active_employees,
    (SELECT COUNT(*) FROM public.expenses WHERE category LIKE '%advance%') as salary_advances;

-- Display sample data
SELECT 'SAMPLE EMPLOYEES:' as info;
SELECT name, position, department, salary, is_active 
FROM public.employees 
ORDER BY department, position;

SELECT 'SAMPLE SALARY ADVANCES:' as info;
SELECT description, amount, status, received_by 
FROM public.expenses 
WHERE category LIKE '%advance%' 
ORDER BY expense_date DESC;
