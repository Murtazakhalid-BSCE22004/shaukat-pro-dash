-- Check current doctor percentages and fix them
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what the current percentages are
SELECT 
    name,
    opd_percentage,
    lab_percentage,
    ot_percentage,
    ultrasound_percentage,
    ecg_percentage
FROM public.doctors;

-- 2. Update all doctors to have realistic percentages (70% for doctor, 30% for hospital)
UPDATE public.doctors 
SET 
    opd_percentage = 70,
    lab_percentage = 70,
    ot_percentage = 70,
    ultrasound_percentage = 70,
    ecg_percentage = 70
WHERE 
    opd_percentage = 0 OR 
    lab_percentage = 0 OR 
    ot_percentage = 0 OR 
    ultrasound_percentage = 0 OR 
    ecg_percentage = 0;

-- 3. Verify the update
SELECT 
    name,
    opd_percentage,
    lab_percentage,
    ot_percentage,
    ultrasound_percentage,
    ecg_percentage
FROM public.doctors;

-- 4. Check your patient data
SELECT 
    patient_name,
    doctor_name,
    opd_fee,
    lab_fee,
    ot_fee,
    ultrasound_fee,
    ecg_fee,
    (opd_fee + lab_fee + ot_fee + ultrasound_fee + ecg_fee) as total_fees
FROM public.patients 
WHERE DATE(created_at) = CURRENT_DATE;
