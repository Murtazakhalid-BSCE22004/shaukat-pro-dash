-- Temporarily disable RLS for expenses table for development
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Note: This is for development only. In production, you should:
-- 1. Enable proper authentication
-- 2. Re-enable RLS with appropriate policies
-- 3. Use service role key for admin operations
