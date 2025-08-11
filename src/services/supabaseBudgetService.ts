import { supabase } from '@/integrations/supabase/client';
import { Budget } from '@/types';

export const supabaseBudgetService = {
  // Get all budgets
  async getAllBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get budgets by month and year
  async getBudgetsByMonth(month: number, year: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get budget by category, month, and year
  async getBudgetByCategory(category: string, month: number, year: number): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('category', category)
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new budget
  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update budget
  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete budget
  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get total budget for month
  async getTotalBudgetForMonth(month: number, year: number): Promise<number> {
    const { data, error } = await supabase
      .from('budgets')
      .select('amount')
      .eq('month', month)
      .eq('year', year);
    
    if (error) throw error;
    return (data || []).reduce((sum, budget) => sum + (budget.amount || 0), 0);
  }
};
