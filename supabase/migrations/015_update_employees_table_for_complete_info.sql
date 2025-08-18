-- Update employees table to include complete employee information
-- Add new columns for age, cnic, and address

-- Add age column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add CNIC column (13-digit Pakistani national ID)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS cnic VARCHAR(13);

-- Add address column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add paid_by and received_by fields to expenses table (for salary advances)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255);

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON public.employees(cnic);
CREATE INDEX IF NOT EXISTS idx_employees_age ON public.employees(age);

-- Add constraints
ALTER TABLE public.employees 
ADD CONSTRAINT employees_age_check 
CHECK (age IS NULL OR (age >= 16 AND age <= 70));

ALTER TABLE public.employees 
ADD CONSTRAINT employees_cnic_check 
CHECK (cnic IS NULL OR (cnic ~ '^[0-9]{13}$'));

-- Update employees table comment
COMMENT ON TABLE public.employees IS 'Hospital employees with complete personal and professional information';
COMMENT ON COLUMN public.employees.age IS 'Employee age (16-70 years)';
COMMENT ON COLUMN public.employees.cnic IS '13-digit Pakistani CNIC number';
COMMENT ON COLUMN public.employees.address IS 'Complete residential address';
COMMENT ON COLUMN public.employees.position IS 'Hospital position/job category';
COMMENT ON COLUMN public.employees.department IS 'Department or ward assignment';

-- Sample hospital positions for reference (as comments)
/*
Valid position categories:
- laboratory technician
- laboratory engineer
- pharmacy attendant
- steward
- accountant
- receptionist
- ward
- OT
- doctor attendant
- xray
- internee
- general
- manager
- nurse
- electrician
- LHV
*/

-- Insert sample employee data for testing
INSERT INTO public.employees (
    name, 
    age, 
    cnic, 
    contact_number, 
    address, 
    position, 
    department, 
    salary, 
    hire_date, 
    email, 
    is_active
) VALUES 
(
    'Dr. Ahmed Ali',
    35,
    '3520212345678',
    '03001234567',
    'House 123, Street 5, F-8/2, Islamabad',
    'manager',
    'Administration',
    150000.00,
    '2020-01-15',
    'ahmed.ali@hospital.com',
    true
),
(
    'Fatima Khan',
    28,
    '3520298765432',
    '03012345678',
    'Flat 45, Gulshan-e-Iqbal, Block 13, Karachi',
    'nurse',
    'Emergency Ward',
    45000.00,
    '2021-03-10',
    'fatima.khan@hospital.com',
    true
),
(
    'Muhammad Hassan',
    42,
    '3520187654321',
    '03123456789',
    'House 67, Model Town, Lahore',
    'laboratory technician',
    'Laboratory',
    35000.00,
    '2019-06-20',
    'hassan@hospital.com',
    true
),
(
    'Ayesha Siddique',
    26,
    '3520298123456',
    '03234567890',
    'Apartment 12, DHA Phase 2, Karachi',
    'receptionist',
    'Front Desk',
    30000.00,
    '2022-02-14',
    'ayesha.siddique@hospital.com',
    true
),
(
    'Ali Raza',
    31,
    '3520276543210',
    '03345678901',
    'House 89, Johar Town, Lahore',
    'pharmacy attendant',
    'Pharmacy',
    32000.00,
    '2020-11-05',
    'ali.raza@hospital.com',
    true
),
(
    'Zainab Malik',
    29,
    '3520254321098',
    '03456789012',
    'Flat 23, Clifton Block 4, Karachi',
    'laboratory engineer',
    'Laboratory',
    55000.00,
    '2021-08-12',
    'zainab.malik@hospital.com',
    true
),
(
    'Omar Sheikh',
    38,
    '3520243210987',
    '03567890123',
    'House 156, Satellite Town, Rawalpindi',
    'electrician',
    'Maintenance',
    40000.00,
    '2018-04-03',
    'omar.sheikh@hospital.com',
    true
),
(
    'Maria John',
    33,
    '3520232109876',
    '03678901234',
    'House 78, Christian Colony, Lahore',
    'steward',
    'Housekeeping',
    25000.00,
    '2019-09-18',
    'maria.john@hospital.com',
    true
),
(
    'Kamran Ahmed',
    24,
    '3520221098765',
    '03789012345',
    'Hostel Room 15, University Road, Karachi',
    'internee',
    'General Medicine',
    20000.00,
    '2023-01-10',
    'kamran.ahmed@hospital.com',
    true
),
(
    'Sana Bhatti',
    27,
    '3520210987654',
    '03890123456',
    'House 45, Garden Town, Lahore',
    'LHV',
    'OPD',
    38000.00,
    '2021-12-01',
    'sana.bhatti@hospital.com',
    true
),
(
    'Tariq Mahmood',
    45,
    '3520199876543',
    '03901234567',
    'House 234, F-10/3, Islamabad',
    'accountant',
    'Finance',
    65000.00,
    '2017-05-22',
    'tariq.mahmood@hospital.com',
    true
),
(
    'Nadia Parveen',
    32,
    '3520188765432',
    '03012345679',
    'Apartment 56, Gulberg III, Lahore',
    'xray',
    'Radiology',
    42000.00,
    '2020-07-08',
    'nadia.parveen@hospital.com',
    true
);

-- Insert sample expense data for salary advances
INSERT INTO public.expenses (
    category,
    description,
    amount,
    expense_date,
    approved_by,
    status,
    paid_by,
    received_by
) VALUES 
(
    'Salary Advance',
    'Emergency advance for Fatima Khan - Medical expenses',
    15000.00,
    '2024-01-15',
    'Dr. Ahmed Ali',
    'approved',
    'Finance Department',
    'Fatima Khan'
),
(
    'Salary Advance',
    'Advance payment for Muhammad Hassan - Home renovation',
    20000.00,
    '2024-01-10',
    'Dr. Ahmed Ali',
    'approved',
    'Finance Department',
    'Muhammad Hassan'
),
(
    'Salary Advance',
    'Emergency advance for Ali Raza - Family medical emergency',
    12000.00,
    '2024-01-20',
    'Dr. Ahmed Ali',
    'pending',
    'Finance Department',
    'Ali Raza'
);
