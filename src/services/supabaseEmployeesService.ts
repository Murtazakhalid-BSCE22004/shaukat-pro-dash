import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

export const supabaseEmployeesService = {
  // Get all employees
  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get active employees only
  async getActiveEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get employee by ID
  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new employee
  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employee.name,
        age: employee.age,
        cnic: employee.cnic,
        contact_number: employee.contact_number,
        address: employee.address,
        position: employee.position,
        department: employee.department,
        salary: employee.salary,
        hire_date: employee.hire_date,
        is_active: employee.is_active,
        email: employee.email || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update employee
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete employee (soft delete by setting is_active to false)
  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Activate employee (reactivate deactivated employee)
  async activateEmployee(id: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Permanent delete employee (hard delete - removes from database entirely)
  // Note: This will cascade delete related records like salary_payments
  async permanentDeleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get employees by department
  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('department', department)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get total salary cost
  async getTotalSalaryCost(): Promise<number> {
    const { data, error } = await supabase
      .from('employees')
      .select('salary')
      .eq('is_active', true);
    
    if (error) throw error;
    return (data || []).reduce((sum, emp) => sum + (emp.salary || 0), 0);
  }
};
