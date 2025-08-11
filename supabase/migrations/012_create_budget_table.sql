-- Create budget table for monthly category budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, month, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON public.budgets(month, year);

-- Enable Row Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets table
CREATE POLICY "Budgets are viewable by authenticated users" ON public.budgets
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Budgets can be created by authenticated users" ON public.budgets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Budgets can be updated by authenticated users" ON public.budgets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Budgets can be deleted by authenticated users" ON public.budgets
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default budgets for common categories
INSERT INTO public.budgets (category, amount, month, year) VALUES
    ('Salaries', 50000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
    ('Equipment', 15000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
    ('Utilities', 8000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
    ('Medicines', 12000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
    ('Maintenance', 5000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE)),
    ('Supplies', 3000.00, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE))
ON CONFLICT (category, month, year) DO NOTHING;
