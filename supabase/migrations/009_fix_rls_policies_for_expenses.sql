-- Drop existing RLS policies for expenses table
DROP POLICY IF EXISTS "Expenses are viewable by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be created by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be updated by authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Expenses can be deleted by authenticated users" ON public.expenses;

-- Create more permissive RLS policies for expenses table
CREATE POLICY "Enable all operations for expenses" ON public.expenses
    FOR ALL USING (true)
    WITH CHECK (true);

-- Alternative: If you want to keep some security, use these policies instead:
-- CREATE POLICY "Expenses are viewable by all users" ON public.expenses
--     FOR SELECT USING (true);

-- CREATE POLICY "Expenses can be created by all users" ON public.expenses
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Expenses can be updated by all users" ON public.expenses
--     FOR UPDATE USING (true);

-- CREATE POLICY "Expenses can be deleted by all users" ON public.expenses
--     FOR DELETE USING (true);
