-- Remove all sample data from expenses table
DELETE FROM public.expenses;

-- Remove all sample data from employees table
DELETE FROM public.employees;

-- Reset auto-increment sequences if any (though we're using UUIDs)
-- This is optional but good practice
-- SELECT setval('expenses_id_seq', 1, false); -- Only if using serial IDs
-- SELECT setval('employees_id_seq', 1, false); -- Only if using serial IDs

-- Verify tables are empty
-- SELECT COUNT(*) FROM public.expenses;
-- SELECT COUNT(*) FROM public.employees;
