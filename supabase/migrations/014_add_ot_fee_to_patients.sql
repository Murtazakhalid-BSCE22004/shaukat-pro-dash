-- Add OT fee field to patients table to match the fee structure
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS ot_fee DECIMAL(10,2) DEFAULT 0.00;

-- Update existing patients to have 0 OT fee
UPDATE public.patients 
SET ot_fee = 0.00 
WHERE ot_fee IS NULL;

-- Create index for OT fee if needed
CREATE INDEX IF NOT EXISTS idx_patients_ot_fee ON public.patients(ot_fee);
