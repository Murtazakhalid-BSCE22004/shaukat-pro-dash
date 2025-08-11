export type FeeCategory = "OPD" | "LAB" | "OT" | "ULTRASOUND" | "ECG";

// Legacy types for backward compatibility
export interface Doctor {
  id: string;
  name: string;
  percentages: Record<FeeCategory, number>; // 0-100
  createdAt: string; // ISO date
}

export interface Visit {
  id: string;
  patientName: string;
  contact: string;
  doctorId: string;
  date: string; // ISO date
  fees: Partial<Record<FeeCategory, number>>; // numeric amounts per category
}

// Supabase types (preferred for new code)
export interface SupabaseDoctor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string;
  license_number: string | null;
  department: string | null;
  consultation_fee: number;
  experience_years: number;
  qualification: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabasePatient {
  id: string;
  patient_name: string;
  contact_number: string;
  doctor_name: string;
  opd_fee: number;
  lab_fee: number;
  ultrasound_fee: number;
  ecg_fee: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseVisit {
  id: string;
  patient_name: string;
  contact: string;
  doctor_id: string;
  visit_date: string;
  opd_fee: number;
  lab_fee: number;
  ot_fee: number;
  ultrasound_fee: number;
  ecg_fee: number;
  created_at: string;
  updated_at: string;
}

// New types for expenses and salaries dashboard
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  is_active: boolean;
  contact_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  approved_by: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string;
  paid_by: string;
  received_by: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryPayment {
  id: string;
  employee_id: string;
  amount: number;
  payment_date: string;
  month: string;
  year: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}
