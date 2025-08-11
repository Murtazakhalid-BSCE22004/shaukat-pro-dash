-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salary_payments table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON public.salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON public.salary_payments(month, year);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees are viewable by authenticated users" ON public.employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employees can be created by authenticated users" ON public.employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Employees can be updated by authenticated users" ON public.employees
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Employees can be deleted by authenticated users" ON public.employees
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for expenses table
CREATE POLICY "Expenses are viewable by authenticated users" ON public.expenses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Expenses can be created by authenticated users" ON public.expenses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Expenses can be updated by authenticated users" ON public.expenses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Expenses can be deleted by authenticated users" ON public.expenses
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for salary_payments table
CREATE POLICY "Salary payments are viewable by authenticated users" ON public.salary_payments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Salary payments can be created by authenticated users" ON public.salary_payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Salary payments can be updated by authenticated users" ON public.salary_payments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Salary payments can be deleted by authenticated users" ON public.salary_payments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at triggers
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_payments_updated_at BEFORE UPDATE ON public.salary_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data removed - tables will be empty for clean start
