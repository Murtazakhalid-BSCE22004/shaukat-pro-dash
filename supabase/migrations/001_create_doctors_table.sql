-- Create doctors table with comprehensive fields
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    department VARCHAR(255),
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    experience_years INTEGER DEFAULT 0,
    qualification VARCHAR(500),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_active ON public.doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_name ON public.doctors(name);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors table
CREATE POLICY "Doctors are viewable by authenticated users" ON public.doctors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can be created by authenticated users" ON public.doctors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Doctors can be updated by authenticated users" ON public.doctors
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can be deleted by authenticated users" ON public.doctors
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample doctors
INSERT INTO public.doctors (name, email, phone, specialization, license_number, department, consultation_fee, experience_years, qualification, is_active) VALUES
('Dr. Ahmed Ali Khan', 'dr.ahmed@medicare.pk', '+92-300-1234567', 'Cardiologist', 'MD-001', 'Cardiac Unit', 2500, 15, 'MBBS, FCPS (Cardiology)', true),
('Dr. Fatima Shah', 'dr.fatima@medicare.pk', '+92-321-9876543', 'Pediatrician', 'MD-002', 'Pediatric Ward', 1800, 12, 'MBBS, FCPS (Pediatrics)', true),
('Dr. Imran Khan', 'dr.imran@medicare.pk', '+92-333-4567890', 'Neurologist', 'MD-003', 'Neurology Dept', 3500, 20, 'MBBS, FCPS (Neurology)', true),
('Dr. Ayesha Malik', 'dr.ayesha@medicare.pk', '+92-345-6789012', 'Dermatologist', 'MD-004', 'Dermatology Unit', 2000, 8, 'MBBS, FCPS (Dermatology)', true);
