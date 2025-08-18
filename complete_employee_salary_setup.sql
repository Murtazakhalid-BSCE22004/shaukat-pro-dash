-- ============================================================================
-- COMPLETE EMPLOYEE & SALARY MANAGEMENT SYSTEM SETUP
-- Copy and paste this entire file into your Supabase SQL Editor
-- This will create all tables from scratch
-- ============================================================================

-- ============================================================================
-- 1. CREATE UPDATE FUNCTION (Required for triggers)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. CREATE EMPLOYEES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 16 AND age <= 70),
    cnic VARCHAR(13) UNIQUE CHECK (cnic ~ '^[0-9]{13}$'),
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary DECIMAL(12,2) NOT NULL CHECK (salary >= 0),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE EXPENSES TABLE (for salary advances and other expenses)
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
    paid_by VARCHAR(255),
    received_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE SALARY PAYMENTS TABLE
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

-- ============================================================================
-- 5. CREATE BUDGETS TABLE (for financial planning)
-- ============================================================================

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
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON public.employees(hire_date);

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_received_by ON public.expenses(received_by);

-- Salary payments table indexes
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON public.salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON public.salary_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON public.salary_payments(status);
CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON public.salary_payments(payment_date);

-- Budgets table indexes
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON public.budgets(month, year);

-- ============================================================================
-- 7. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

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

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. CREATE PERMISSIVE POLICIES (Allow all access for development)
-- ============================================================================

-- Employees policies
CREATE POLICY "Allow all access to employees" ON public.employees
    FOR ALL USING (true) WITH CHECK (true);

-- Expenses policies
CREATE POLICY "Allow all access to expenses" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

-- Salary payments policies
CREATE POLICY "Allow all access to salary_payments" ON public.salary_payments
    FOR ALL USING (true) WITH CHECK (true);

-- Budgets policies
CREATE POLICY "Allow all access to budgets" ON public.budgets
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 10. ADD TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.employees IS 'Hospital employees with complete personal and professional information';
COMMENT ON COLUMN public.employees.name IS 'Full name of the employee';
COMMENT ON COLUMN public.employees.age IS 'Employee age (16-70 years)';
COMMENT ON COLUMN public.employees.cnic IS '13-digit Pakistani CNIC number without dashes';
COMMENT ON COLUMN public.employees.contact_number IS 'Primary contact phone number';
COMMENT ON COLUMN public.employees.address IS 'Complete residential address';
COMMENT ON COLUMN public.employees.position IS 'Job position/category in hospital';
COMMENT ON COLUMN public.employees.department IS 'Department or ward assignment';
COMMENT ON COLUMN public.employees.salary IS 'Monthly salary in PKR';
COMMENT ON COLUMN public.employees.hire_date IS 'Date when employee was hired';
COMMENT ON COLUMN public.employees.is_active IS 'Whether employee is currently active';

COMMENT ON TABLE public.expenses IS 'All hospital expenses including salary advances';
COMMENT ON TABLE public.salary_payments IS 'Monthly salary payment records';
COMMENT ON TABLE public.budgets IS 'Budget allocations by category and time period';

-- ============================================================================
-- 11. INSERT SAMPLE DATA
-- ============================================================================

-- Sample employees covering all hospital positions
INSERT INTO public.employees (
    name, age, cnic, contact_number, address, position, department, 
    salary, hire_date, email, is_active
) VALUES 

-- Management & Administration
('Dr. Ahmed Ali Khan', 45, '3520212345678', '03001234567', 
 'House 123, Street 5, F-8/2, Islamabad', 'manager', 'Administration', 
 180000.00, '2018-01-15', 'ahmed.ali@hospital.com', true),

('Tariq Mahmood', 42, '3520199876543', '03901234567', 
 'House 234, F-10/3, Islamabad', 'accountant', 'Finance', 
 85000.00, '2019-05-22', 'tariq.mahmood@hospital.com', true),

('Ayesha Siddique', 28, '3520298123456', '03234567890', 
 'Apartment 12, DHA Phase 2, Karachi', 'receptionist', 'Front Desk', 
 35000.00, '2022-02-14', 'ayesha.siddique@hospital.com', true),

-- Medical Staff
('Dr. Sarah Wilson', 38, '3520245678901', '03445566778', 
 'House 90, Sector E-11, Islamabad', 'doctor attendant', 'Surgery', 
 65000.00, '2020-03-15', 'sarah.wilson@hospital.com', true),

('Fatima Khan', 32, '3520298765432', '03012345678', 
 'Flat 45, Gulshan-e-Iqbal, Block 13, Karachi', 'nurse', 'Emergency Ward', 
 50000.00, '2021-03-10', 'fatima.khan@hospital.com', true),

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

-- Pharmacy & Support
('Ali Raza', 30, '3520276543210', '03345678901', 
 'House 89, Johar Town, Lahore', 'pharmacy attendant', 'Pharmacy', 
 36000.00, '2020-11-05', 'ali.raza@hospital.com', true),

('Maria John', 35, '3520232109876', '03678901234', 
 'House 78, Christian Colony, Lahore', 'steward', 'Housekeeping', 
 28000.00, '2019-09-18', 'maria.john@hospital.com', true),

-- Technical Staff
('Omar Sheikh', 41, '3520243210987', '03567890123', 
 'House 156, Satellite Town, Rawalpindi', 'electrician', 'Maintenance', 
 45000.00, '2018-04-03', 'omar.sheikh@hospital.com', true),

-- Training & General
('Kamran Ahmed', 25, '3520221098765', '03789012345', 
 'Hostel Room 15, University Road, Karachi', 'internee', 'General Medicine', 
 25000.00, '2023-01-10', 'kamran.ahmed@hospital.com', true),

('Bilal Ahmad', 28, '3520265432109', '03998877665', 
 'House 199, Satellite Town, Lahore', 'general', 'General Services', 
 32000.00, '2022-05-15', 'bilal.ahmad@hospital.com', true);

-- Sample salary advances (expenses)
INSERT INTO public.expenses (
    category, description, amount, expense_date, approved_by, status, paid_by, received_by
) VALUES 

('Salary Advance', 'Medical emergency advance for family treatment', 
 25000.00, '2024-01-15', 'Dr. Ahmed Ali Khan', 'approved', 
 'Finance Department', 'Fatima Khan'),

('Salary Advance', 'Home renovation advance payment', 
 35000.00, '2024-01-10', 'Dr. Ahmed Ali Khan', 'approved', 
 'Finance Department', 'Muhammad Hassan'),

('Salary Advance', 'Wedding expenses advance', 
 40000.00, '2024-01-05', 'Dr. Ahmed Ali Khan', 'approved', 
 'Finance Department', 'Zainab Malik'),

('Salary Advance', 'Education fee advance for children', 
 15000.00, '2024-01-20', 'Dr. Ahmed Ali Khan', 'pending', 
 'Finance Department', 'Ali Raza'),

('Salary Advance', 'Emergency medical advance', 
 20000.00, '2024-01-18', 'Dr. Ahmed Ali Khan', 'approved', 
 'Finance Department', 'Omar Sheikh'),

('Salary Advance', 'Family function expenses', 
 18000.00, '2024-01-22', 'Dr. Ahmed Ali Khan', 'pending', 
 'Finance Department', 'Sana Bhatti');

-- Sample salary payments
INSERT INTO public.salary_payments (
    employee_id, amount, payment_date, month, year, status, payment_method, notes
) VALUES 

((SELECT id FROM public.employees WHERE name = 'Dr. Ahmed Ali Khan'), 
 180000.00, '2024-01-01', 'January', 2024, 'paid', 'bank_transfer', 'Regular monthly salary'),

((SELECT id FROM public.employees WHERE name = 'Fatima Khan'), 
 50000.00, '2024-01-01', 'January', 2024, 'paid', 'bank_transfer', 'Regular monthly salary'),

((SELECT id FROM public.employees WHERE name = 'Muhammad Hassan'), 
 38000.00, '2024-01-01', 'January', 2024, 'paid', 'bank_transfer', 'Regular monthly salary'),

((SELECT id FROM public.employees WHERE name = 'Tariq Mahmood'), 
 85000.00, '2024-01-01', 'January', 2024, 'paid', 'bank_transfer', 'Regular monthly salary'),

((SELECT id FROM public.employees WHERE name = 'Zainab Malik'), 
 62000.00, '2024-01-01', 'January', 2024, 'paid', 'bank_transfer', 'Regular monthly salary');

-- Sample budgets
INSERT INTO public.budgets (category, amount, month, year) VALUES 
('Salaries', 800000.00, 1, 2024),
('Medical Supplies', 150000.00, 1, 2024),
('Equipment Maintenance', 50000.00, 1, 2024),
('Utilities', 75000.00, 1, 2024),
('Administrative Expenses', 25000.00, 1, 2024);

-- ============================================================================
-- 12. VERIFICATION & SUMMARY
-- ============================================================================

-- Display setup summary
SELECT 
    'SETUP COMPLETED SUCCESSFULLY!' as status,
    (SELECT COUNT(*) FROM public.employees) as total_employees,
    (SELECT COUNT(*) FROM public.employees WHERE is_active = true) as active_employees,
    (SELECT COUNT(DISTINCT position) FROM public.employees) as unique_positions,
    (SELECT COUNT(DISTINCT department) FROM public.employees) as departments,
    (SELECT SUM(salary) FROM public.employees WHERE is_active = true) as total_monthly_salary,
    (SELECT COUNT(*) FROM public.expenses WHERE category LIKE '%advance%') as salary_advances,
    (SELECT COUNT(*) FROM public.salary_payments) as salary_payment_records,
    (SELECT COUNT(*) FROM public.budgets) as budget_categories;

-- Show all hospital positions available
SELECT 'AVAILABLE POSITIONS:' as info;
SELECT DISTINCT position, COUNT(*) as employee_count
FROM public.employees 
GROUP BY position 
ORDER BY position;

-- Show departments
SELECT 'DEPARTMENTS:' as info;
SELECT DISTINCT department, COUNT(*) as employee_count
FROM public.employees 
GROUP BY department 
ORDER BY department;

-- ============================================================================
-- SETUP COMPLETE! 
-- Your database is now ready for the Employee Management System
-- ============================================================================
