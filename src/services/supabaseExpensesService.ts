import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types';

export const supabaseExpensesService = {
  // Get all expenses
  async getAllExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get expenses by status
  async getExpensesByStatus(status: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('status', status)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get expenses by category
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('category', category)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get expense by ID
  async getExpenseById(id: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new expense
  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update expense
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete expense
  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get total expenses by status
  async getTotalExpensesByStatus(status: string): Promise<number> {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('status', status);
    
    if (error) throw error;
    return (data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  },

  // Get total expenses by category
  async getTotalExpensesByCategory(category: string): Promise<number> {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('category', category);
    
    if (error) throw error;
    return (data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  },

  // Get monthly expenses
  async getMonthlyExpenses(year: number, month: number): Promise<number> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);
    
    if (error) throw error;
    return (data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }
};
