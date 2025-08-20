import { supabase } from '@/integrations/supabase/client';
import { SalaryPayment } from '@/types';

export const supabaseSalaryPaymentsService = {
  // Get all salary payments
  async getAllSalaryPayments(): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return [];
    }
    return data || [];
  },

  // Get salary payments by status
  async getSalaryPaymentsByStatus(status: string): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('status', status)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return [];
    }
    return data || [];
  },

  // Get salary payments by employee
  async getSalaryPaymentsByEmployee(employeeId: string): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return [];
    }
    return data || [];
  },

  // Get salary payments by month and year
  async getSalaryPaymentsByMonth(year: number, month: string): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return [];
    }
    return data || [];
  },

  // Create new salary payment
  async createSalaryPayment(payment: Omit<SalaryPayment, 'id' | 'created_at' | 'updated_at'>): Promise<SalaryPayment | null> {
    const { data, error } = await supabase
      .from('salary_payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) {
      console.warn('Could not create salary payment:', error);
      return null;
    }
    return data;
  },

  // Update salary payment
  async updateSalaryPayment(id: string, updates: Partial<SalaryPayment>): Promise<SalaryPayment | null> {
    const { data, error } = await supabase
      .from('salary_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.warn('Could not update salary payment:', error);
      return null;
    }
    return data;
  },

  // Delete salary payment
  async deleteSalaryPayment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('salary_payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.warn('Could not delete salary payment:', error);
      return false;
    }
    return true;
  },

  // Get total salary payments for month
  async getTotalSalaryPaymentsForMonth(year: number, month: string): Promise<number> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('amount')
      .eq('year', year)
      .eq('month', month)
      .eq('status', 'paid');
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return 0;
    }
    return (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
  },

  // Get recent salary payments
  async getRecentSalaryPayments(limit: number = 5): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn('No salary payments table found:', error);
      return [];
    }
    return data || [];
  }
};

// React Query hooks for salary payments
export const salaryPaymentsQueries = {
  all: () => ['salary-payments'] as const,
  list: () => [...salaryPaymentsQueries.all(), 'list'] as const,
  byStatus: (status: string) => [...salaryPaymentsQueries.all(), 'byStatus', status] as const,
  byEmployee: (employeeId: string) => [...salaryPaymentsQueries.all(), 'byEmployee', employeeId] as const,
  byMonth: (year: number, month: string) => [...salaryPaymentsQueries.all(), 'byMonth', year, month] as const,
};
