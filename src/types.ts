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
  age: number;
  cnic: string;
  contact_number: string;
  address: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  is_active: boolean;
  email: string;
  created_at: string;
  updated_at: string;
}

// Hospital position categories
export type HospitalPositions = 
  | 'laboratory technician'
  | 'laboratory engineer'
  | 'pharmacy attendant'
  | 'steward'
  | 'accountant'
  | 'receptionist'
  | 'ward'
  | 'OT'
  | 'doctor attendant'
  | 'xray'
  | 'internee'
  | 'general'
  | 'manager'
  | 'nurse'
  | 'electrician'
  | 'LHV';

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

// General Hospital Dashboard Types
export interface GeneralDashboardKPI {
  label: string;
  value: number;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface RevenueExpenseData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DepartmentData {
  department: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'visit' | 'expense' | 'salary';
  description: string;
  amount?: number;
  date: string;
  status?: string;
}

export interface GeneralDashboardSummary {
  kpis: {
    totalDoctors: number;
    activePatients: number;
    totalVisits: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlySalaries: number;
    netProfit: number;
  };
  trends: {
    revenueChange: number;
    expenseChange: number;
    visitChange: number;
    profitChange: number;
  };
  charts: {
    revenueVsExpenses: RevenueExpenseData[];
    visitsByDepartment: DepartmentData[];
    salaryByDepartment: DepartmentData[];
    topPerformingDoctors?: { name: string; revenue: number; patients: number }[];
    visitsOverTime?: { date: string; visits: number; revenue: number }[];
    expensesByCategory?: DepartmentData[];
  };
  recentActivity: ActivityItem[];
  summary?: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    averageVisitValue: number;
    topPerformingDepartment: string;
    mostActiveDoctor: string;
  };
}

// Dashboard Filter Types
export interface DashboardFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  departments: string[];
  doctors: string[];
  expenseCategories: string[];
  employeeDepartments: string[];
  timePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface FilteredDashboardData {
  kpis: {
    totalDoctors: number;
    activePatients: number;
    totalVisits: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlySalaries: number;
    netProfit: number;
  };
  trends: {
    revenueChange: number;
    expenseChange: number;
    visitChange: number;
    profitChange: number;
  };
  charts: {
    revenueVsExpenses: RevenueExpenseData[];
    visitsByDepartment: DepartmentData[];
    salaryByDepartment: DepartmentData[];
    visitsOverTime: { date: string; visits: number; revenue: number }[];
    expensesByCategory: DepartmentData[];
  };
  recentActivity: ActivityItem[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    averageVisitValue: number;
    topPerformingDepartment: string;
    mostActiveDoctor: string;
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  filters: DashboardFilters;
  availableOptions: {
    departments: FilterOption[];
    doctors: FilterOption[];
    expenseCategories: FilterOption[];
    employeeDepartments: FilterOption[];
  };
  isLoading: boolean;
}