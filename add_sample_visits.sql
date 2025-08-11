-- Add sample patients to demonstrate the system working
-- Run this in your Supabase SQL Editor after fixing the RLS policies

-- Add sample patients for today (adjust the date as needed)
INSERT INTO public.patients (
    patient_name, 
    contact_number, 
    doctor_name, 
    opd_fee, 
    lab_fee, 
    ot_fee,
    ultrasound_fee, 
    ecg_fee
) VALUES 
-- Patient 1: OPD consultation
('Ahmed Khan', '0300-1234567', 'DR IMRAN KHAN', 2000, 0, 0, 0),

-- Patient 2: Lab test
('Fatima Ali', '0300-2345678', 'DR, HABIB ULLAH', 1500, 3000, 0, 0),

-- Patient 3: Ultrasound
('Muhammad Hassan', '0300-3456789', 'DR, NOOR UDIN', 1800, 0, 5000, 0),

-- Patient 4: ECG
('Ayesha Khan', '0300-4567890', 'DR.YUSRA', 1200, 0, 0, 2500),

-- Patient 5: Multiple services including OT
('Zainab Ahmed', '0300-5678901', 'DR IMRAN KHAN', 2500, 4000, 8000, 6000, 3000),

-- Patient 6: Another OPD
('Ali Raza', '0300-6789012', 'DR, HABIB ULLAH', 2200, 0, 0, 0),

-- Patient 7: Lab + Ultrasound
('Sara Khan', '0300-7890123', 'DR.YUSRA', 1600, 3500, 4500, 0),

-- Patient 8: Full checkup with OT
('Hassan Ali', '0300-8901234', 'DR, NOOR UDIN', 3000, 5000, 10000, 7000, 4000);

-- Verify the patients were added
-- SELECT * FROM public.patients WHERE DATE(created_at) = CURRENT_DATE;
