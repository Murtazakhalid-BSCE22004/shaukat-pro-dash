-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    opd_fee DECIMAL(10,2) DEFAULT 0.00,
    lab_fee DECIMAL(10,2) DEFAULT 0.00,
    ultrasound_fee DECIMAL(10,2) DEFAULT 0.00,
    ecg_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(patient_name);
CREATE INDEX IF NOT EXISTS idx_patients_contact ON public.patients(contact_number);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON public.patients(doctor_name);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Patients are viewable by authenticated users" ON public.patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Patients can be created by authenticated users" ON public.patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patients can be updated by authenticated users" ON public.patients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Patients can be deleted by authenticated users" ON public.patients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger for patients table
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
