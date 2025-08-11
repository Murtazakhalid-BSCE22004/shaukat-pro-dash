-- Create visits table
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    opd_fee DECIMAL(10,2) DEFAULT 0.00,
    lab_fee DECIMAL(10,2) DEFAULT 0.00,
    ot_fee DECIMAL(10,2) DEFAULT 0.00,
    ultrasound_fee DECIMAL(10,2) DEFAULT 0.00,
    ecg_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON public.visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON public.visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_patient_name ON public.visits(patient_name);

-- Enable Row Level Security
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Create policies for visits table
CREATE POLICY "Visits are viewable by authenticated users" ON public.visits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Visits can be created by authenticated users" ON public.visits
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Visits can be updated by authenticated users" ON public.visits
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Visits can be deleted by authenticated users" ON public.visits
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger for visits table
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
