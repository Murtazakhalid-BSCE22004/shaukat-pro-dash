-- Add payment tracking columns to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);

-- Update existing expenses to have default values for new columns
UPDATE public.expenses 
SET paid_by = 'Not Specified', 
    received_by = 'Not Specified' 
WHERE paid_by IS NULL OR received_by IS NULL;

-- Make the new columns NOT NULL after setting default values
ALTER TABLE public.expenses 
ALTER COLUMN paid_by SET NOT NULL,
ALTER COLUMN received_by SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_received_by ON public.expenses(received_by);
