-- Update doctors table to add percentage fields for different fee categories
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS opd_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultrasound_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ecg_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_percentage INTEGER DEFAULT 0;

-- Update existing doctors to have default percentages (0)
UPDATE public.doctors 
SET 
    opd_percentage = 0,
    lab_percentage = 0,
    ultrasound_percentage = 0,
    ecg_percentage = 0,
    ot_percentage = 0
WHERE opd_percentage IS NULL;

-- Create index for qualification
CREATE INDEX IF NOT EXISTS idx_doctors_qualification ON public.doctors(qualification);
