import { supabase } from '@/integrations/supabase/client';
import { GeneralDashboardSummary, RevenueExpenseData, DepartmentData, ActivityItem, DashboardFilters, FilterOption, FilteredDashboardData } from '@/types';
import { format } from 'date-fns';
import { supabaseDoctorsService } from './supabaseDoctorsService';
import { supabaseVisitsService } from './supabaseVisitsService';
import { supabaseExpensesService } from './supabaseExpensesService';
import { supabaseEmployeesService } from './supabaseEmployeesService';

export const supabaseGeneralDashboardService = {
  // Get complete dashboard summary with optional filters
  async getDashboardSummary(filters?: DashboardFilters): Promise<GeneralDashboardSummary> {
    try {
      console.log('Starting dashboard summary fetch...');
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      console.log('Fetching data for:', { currentYear, currentMonth, previousYear, previousMonth });
      
      // Fetch all data in parallel - use direct function calls instead of this binding
      const [
        doctors,
        visits,
        currentMonthExpenses,
        previousMonthExpenses,
        employees,
        salaryPayments,
        revenueData,
        recentActivity
      ] = await Promise.all([
        supabaseDoctorsService.getActiveDoctors().catch(err => {
          console.error('Error fetching doctors:', err);
          return [];
        }),
        supabaseVisitsService.getAllVisits().catch(err => {
          console.error('Error fetching visits:', err);
          return [];
        }),
        supabaseGeneralDashboardService.getMonthlyExpenses(currentYear, currentMonth).catch(err => {
          console.error('Error fetching current month expenses:', err);
          return 0;
        }),
        supabaseGeneralDashboardService.getMonthlyExpenses(previousYear, previousMonth).catch(err => {
          console.error('Error fetching previous month expenses:', err);
          return 0;
        }),
        supabaseEmployeesService.getActiveEmployees().catch(err => {
          console.error('Error fetching employees:', err);
          return [];
        }),
        supabaseGeneralDashboardService.getMonthlySalaryPayments(currentYear, currentMonth).catch(err => {
          console.error('Error fetching salary payments:', err);
          return 0;
        }),
        supabaseGeneralDashboardService.getRevenueVsExpensesData().catch(err => {
          console.error('Error fetching revenue data:', err);
          return [];
        }),
        supabaseGeneralDashboardService.getRecentActivity().catch(err => {
          console.error('Error fetching recent activity:', err);
          return [];
        })
      ]);

      console.log('Data fetched successfully:', {
        doctorsCount: doctors.length,
        visitsCount: visits.length,
        employeesCount: employees.length,
        currentMonthExpenses,
        previousMonthExpenses,
        salaryPayments
      });

      // Calculate current month revenue from visits
      const currentMonthRevenue = supabaseGeneralDashboardService.calculateMonthlyRevenue(visits, currentYear, currentMonth);
      const previousMonthRevenue = supabaseGeneralDashboardService.calculateMonthlyRevenue(visits, previousYear, previousMonth);
      
      // Calculate current month visits
      const currentMonthVisits = supabaseGeneralDashboardService.filterVisitsByMonth(visits, currentYear, currentMonth).length;
      const previousMonthVisits = supabaseGeneralDashboardService.filterVisitsByMonth(visits, previousYear, previousMonth).length;

      // Calculate monthly salaries (total salary cost for active employees)
      const monthlySalaries = employees.reduce((total, emp) => total + (emp.salary || 0), 0);
      const previousMonthlySalaries = monthlySalaries; // Assuming same for now

      // Calculate net profit
      const netProfit = currentMonthRevenue - currentMonthExpenses - monthlySalaries;
      const previousNetProfit = previousMonthRevenue - previousMonthExpenses - previousMonthlySalaries;

      // Calculate trends (percentage changes)
      const revenueChange = supabaseGeneralDashboardService.calculatePercentageChange(previousMonthRevenue, currentMonthRevenue);
      const expenseChange = supabaseGeneralDashboardService.calculatePercentageChange(previousMonthExpenses, currentMonthExpenses);
      const visitChange = supabaseGeneralDashboardService.calculatePercentageChange(previousMonthVisits, currentMonthVisits);
      const profitChange = supabaseGeneralDashboardService.calculatePercentageChange(previousNetProfit, netProfit);

      console.log('Calculated metrics:', {
        currentMonthRevenue,
        previousMonthRevenue,
        currentMonthVisits,
        previousMonthVisits,
        monthlySalaries,
        netProfit,
        revenueChange,
        expenseChange,
        visitChange,
        profitChange
      });

      const result = {
        kpis: {
          totalDoctors: doctors.length,
          activePatients: await supabaseGeneralDashboardService.getActivePatientsCount().catch(() => 0),
          totalVisits: currentMonthVisits,
          monthlyRevenue: currentMonthRevenue,
          monthlyExpenses: currentMonthExpenses,
          monthlySalaries,
          netProfit
        },
        trends: {
          revenueChange,
          expenseChange,
          visitChange,
          profitChange
        },
        charts: {
          revenueVsExpenses: revenueData,
          visitsByDepartment: await supabaseGeneralDashboardService.getVisitsByDepartment().catch(() => []),
          salaryByDepartment: await supabaseGeneralDashboardService.getSalaryByDepartment().catch(() => []),
          topPerformingDoctors: await supabaseGeneralDashboardService.getTopPerformingDoctorsData({
            dateRange: { startDate: new Date(currentYear, currentMonth - 1, 1), endDate: new Date(currentYear, currentMonth, 0) },
            departments: [],
            doctors: [],
            expenseCategories: [],
            employeeDepartments: [],
            timePeriod: 'monthly'
          }).catch(() => [])
        },
        recentActivity
      };

      console.log('Dashboard summary completed successfully');
      return result;
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      throw error;
    }
  },

  // Get monthly expenses
  async getMonthlyExpenses(year: number, month: number): Promise<number> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      console.log('Fetching expenses for:', { startDate, endDate });
      
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      
      const total = (data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
      console.log('Total expenses for period:', total);
      return total;
    } catch (error) {
      console.error('Error in getMonthlyExpenses:', error);
      return 0;
    }
  },

  // Get monthly salary payments
  async getMonthlySalaryPayments(year: number, month: number): Promise<number> {
    try {
      console.log('Fetching salary payments for:', { year, month });
      
      const { data, error } = await supabase
        .from('salary_payments')
        .select('amount')
        .eq('year', year)
        .eq('month', month.toString())
        .eq('status', 'paid');
      
      if (error) {
        console.warn('No salary payments table or data found:', error);
        return 0;
      }
      
      const total = (data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
      console.log('Total salary payments for period:', total);
      return total;
    } catch (error) {
      console.error('Error in getMonthlySalaryPayments:', error);
      return 0;
    }
  },

  // Calculate monthly revenue from visits
  calculateMonthlyRevenue(visits: any[], year: number, month: number): number {
    return this.filterVisitsByMonth(visits, year, month)
      .reduce((total, visit) => {
        return total + 
          (visit.opd_fee || 0) + 
          (visit.lab_fee || 0) + 
          (visit.ot_fee || 0) + 
          (visit.ultrasound_fee || 0) + 
          (visit.ecg_fee || 0);
      }, 0);
  },

  // Filter visits by month
  filterVisitsByMonth(visits: any[], year: number, month: number): any[] {
    return visits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate.getFullYear() === year && visitDate.getMonth() + 1 === month;
    });
  },

  // Get active patients count (unique patients from recent visits)
  async getActivePatientsCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('visits')
      .select('patient_name')
      .gte('visit_date', startDate);
    
    if (error) throw error;
    
    // Count unique patients
    const uniquePatients = new Set((data || []).map(visit => visit.patient_name));
    return uniquePatients.size;
  },

  // Get revenue vs expenses data for the last 6 months
  async getRevenueVsExpensesData(): Promise<RevenueExpenseData[]> {
    const data: RevenueExpenseData[] = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const [visits, expenses] = await Promise.all([
        supabaseVisitsService.getAllVisits(),
        supabaseGeneralDashboardService.getMonthlyExpenses(year, month)
      ]);

      const revenue = supabaseGeneralDashboardService.calculateMonthlyRevenue(visits, year, month);
      const profit = revenue - expenses;

      data.push({
        month: monthName,
        revenue,
        expenses,
        profit
      });
    }
    
    return data;
  },

  // Get visits by department (based on doctor specialization)
  async getVisitsByDepartment(): Promise<DepartmentData[]> {
    const [visits, doctors] = await Promise.all([
      supabaseVisitsService.getAllVisits(),
      supabaseDoctorsService.getAllDoctors()
    ]);

    // Create a map of doctor_id to specialization
    const doctorSpecializations = new Map();
    doctors.forEach(doctor => {
      doctorSpecializations.set(doctor.id, doctor.specialization || 'General');
    });

    // Count visits by department
    const departmentCounts: Record<string, number> = {};
    visits.forEach(visit => {
      const department = doctorSpecializations.get(visit.doctor_id) || 'General';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    // Convert to chart data with colors
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(departmentCounts).map(([department, value], index) => ({
      department,
      value,
      color: colors[index % colors.length]
    }));
  },

  // Get salary distribution by department
  async getSalaryByDepartment(): Promise<DepartmentData[]> {
    const employees = await supabaseEmployeesService.getActiveEmployees();
    
    // Group salaries by department
    const departmentSalaries: Record<string, number> = {};
    employees.forEach(employee => {
      const department = employee.department || 'General';
      departmentSalaries[department] = (departmentSalaries[department] || 0) + (employee.salary || 0);
    });

    // Convert to chart data with colors
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(departmentSalaries).map(([department, value], index) => ({
      department,
      value,
      color: colors[index % colors.length]
    }));
  },

  // Get recent activity items
  async getRecentActivity(): Promise<ActivityItem[]> {
    const [recentVisits, recentExpenses] = await Promise.all([
      supabaseVisitsService.getRecentVisits(3),
      this.getRecentExpenses(3)
    ]);

    const activities: ActivityItem[] = [];

    // Add recent visits
    recentVisits.forEach(visit => {
      const totalFee = (visit.opd_fee || 0) + (visit.lab_fee || 0) + (visit.ot_fee || 0) + 
                      (visit.ultrasound_fee || 0) + (visit.ecg_fee || 0);
      activities.push({
        id: visit.id,
        type: 'visit',
        description: `New visit: ${visit.patient_name}`,
        amount: totalFee,
        date: visit.visit_date,
        status: 'completed'
      });
    });

    // Add recent expenses
    recentExpenses.forEach(expense => {
      activities.push({
        id: expense.id,
        type: 'expense',
        description: `${expense.category}: ${expense.description}`,
        amount: expense.amount,
        date: expense.expense_date,
        status: expense.status
      });
    });

    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  },

  // Get recent expenses
  async getRecentExpenses(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Calculate percentage change
  calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Get filtered dashboard data
  async getFilteredDashboardData(filters: DashboardFilters): Promise<FilteredDashboardData> {
    try {
      console.log('Starting filtered dashboard data fetch...', filters);
      
      const { startDate, endDate } = filters.dateRange;
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch filtered data based on date range and other filters
      const [visits, expenses, doctors, employees] = await Promise.all([
        this.getFilteredVisits(filters),
        this.getFilteredExpenses(filters),
        this.getFilteredDoctors(filters),
        this.getFilteredEmployees(filters)
      ]);

      // Calculate filtered metrics
      const filteredRevenue = this.calculateFilteredRevenue(visits);
      const filteredExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const filteredSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      const filteredProfit = filteredRevenue - filteredExpenses - filteredSalaries;

      // Calculate trends (compare with previous period)
      const previousPeriod = this.getPreviousPeriod(filters.dateRange, filters.timePeriod);
      const [previousVisits, previousExpenses] = await Promise.all([
        this.getFilteredVisits({ ...filters, dateRange: previousPeriod }),
        this.getFilteredExpenses({ ...filters, dateRange: previousPeriod })
      ]);

      const previousRevenue = this.calculateFilteredRevenue(previousVisits);
      const previousExpensesTotal = previousExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const previousProfit = previousRevenue - previousExpensesTotal - filteredSalaries;

      // Get additional chart data
      const [visitsOverTime, expensesByCategory, topPerformingDoctors] = await Promise.all([
        this.getVisitsOverTimeData(filters),
        this.getFilteredExpensesByCategory(filters),
        this.getTopPerformingDoctorsData(filters)
      ]);

      const result: FilteredDashboardData = {
        kpis: {
          totalDoctors: doctors.length,
          activePatients: new Set(visits.map(v => v.patient_name)).size,
          totalVisits: visits.length,
          monthlyRevenue: filteredRevenue,
          monthlyExpenses: filteredExpenses,
          monthlySalaries: filteredSalaries,
          netProfit: filteredProfit
        },
        trends: {
          revenueChange: this.calculatePercentageChange(previousRevenue, filteredRevenue),
          expenseChange: this.calculatePercentageChange(previousExpensesTotal, filteredExpenses),
          visitChange: this.calculatePercentageChange(previousVisits.length, visits.length),
          profitChange: this.calculatePercentageChange(previousProfit, filteredProfit)
        },
        charts: {
          revenueVsExpenses: await this.getFilteredRevenueVsExpensesData(filters),
          visitsByDepartment: await this.getFilteredVisitsByDepartment(filters),
          salaryByDepartment: await this.getFilteredSalaryByDepartment(filters),
          visitsOverTime: visitsOverTime,
          expensesByCategory: expensesByCategory
        },
        recentActivity: await this.getFilteredRecentActivity(filters),
        summary: {
          totalRevenue: filteredRevenue,
          totalExpenses: filteredExpenses,
          totalProfit: filteredProfit,
          averageVisitValue: visits.length > 0 ? filteredRevenue / visits.length : 0,
          topPerformingDepartment: await this.getTopPerformingDepartment(filters),
          mostActiveDoctor: await this.getMostActiveDoctor(filters)
        }
      };

      console.log('Filtered dashboard data completed successfully');
      return result;
    } catch (error) {
      console.error('Error in getFilteredDashboardData:', error);
      throw error;
    }
  },

  // Get filtered visits
  async getFilteredVisits(filters: DashboardFilters): Promise<any[]> {
    const { startDate, endDate } = filters.dateRange;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    let query = supabase
      .from('visits')
      .select('*')
      .gte('visit_date', startDateStr)
      .lte('visit_date', endDateStr);

    if (filters.doctors.length > 0) {
      query = query.in('doctor_id', filters.doctors);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter by department if specified
    if (filters.departments.length > 0) {
      const doctors = await supabaseDoctorsService.getAllDoctors();
      const doctorDepartments = new Map();
      doctors.forEach(doctor => {
        doctorDepartments.set(doctor.id, doctor.specialization || 'General');
      });

      return (data || []).filter(visit => {
        const department = doctorDepartments.get(visit.doctor_id);
        return filters.departments.includes(department);
      });
    }

    return data || [];
  },

  // Get filtered expenses
  async getFilteredExpenses(filters: DashboardFilters): Promise<any[]> {
    const { startDate, endDate } = filters.dateRange;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    let query = supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDateStr)
      .lte('expense_date', endDateStr)
      .eq('status', 'approved');

    if (filters.expenseCategories.length > 0) {
      query = query.in('category', filters.expenseCategories);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get filtered doctors
  async getFilteredDoctors(filters: DashboardFilters): Promise<any[]> {
    let query = supabase.from('doctors').select('*').eq('is_active', true);

    if (filters.departments.length > 0) {
      query = query.in('specialization', filters.departments);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get filtered employees
  async getFilteredEmployees(filters: DashboardFilters): Promise<any[]> {
    let query = supabase.from('employees').select('*').eq('is_active', true);

    if (filters.employeeDepartments.length > 0) {
      query = query.in('department', filters.employeeDepartments);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Calculate filtered revenue
  calculateFilteredRevenue(visits: any[]): number {
    return visits.reduce((total, visit) => {
      return total + 
        (visit.opd_fee || 0) + 
        (visit.lab_fee || 0) + 
        (visit.ot_fee || 0) + 
        (visit.ultrasound_fee || 0) + 
        (visit.ecg_fee || 0);
    }, 0);
  },

  // Get previous period for trend calculation
  getPreviousPeriod(dateRange: { startDate: Date; endDate: Date }, timePeriod: string): { startDate: Date; endDate: Date } {
    const { startDate, endDate } = dateRange;
    const duration = endDate.getTime() - startDate.getTime();
    
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);
    
    return { startDate: previousStartDate, endDate: previousEndDate };
  },

  // Get filtered revenue vs expenses data
  async getFilteredRevenueVsExpensesData(filters: DashboardFilters): Promise<RevenueExpenseData[]> {
    const { startDate, endDate } = filters.dateRange;
    const visits = await this.getFilteredVisits(filters);
    const expenses = await this.getFilteredExpenses(filters);
    
    const revenue = this.calculateFilteredRevenue(visits);
    const expensesTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const profit = revenue - expensesTotal;

    return [{
      month: format(startDate, 'MMM yyyy'),
      revenue,
      expenses: expensesTotal,
      profit
    }];
  },

  // Get filtered visits by department
  async getFilteredVisitsByDepartment(filters: DashboardFilters): Promise<DepartmentData[]> {
    const visits = await this.getFilteredVisits(filters);
    const doctors = await supabaseDoctorsService.getAllDoctors();

    const doctorSpecializations = new Map();
    doctors.forEach(doctor => {
      doctorSpecializations.set(doctor.id, doctor.specialization || 'General');
    });

    const departmentCounts: Record<string, number> = {};
    visits.forEach(visit => {
      const department = doctorSpecializations.get(visit.doctor_id) || 'General';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(departmentCounts).map(([department, value], index) => ({
      department,
      value,
      color: colors[index % colors.length]
    }));
  },

  // Get filtered salary by department
  async getFilteredSalaryByDepartment(filters: DashboardFilters): Promise<DepartmentData[]> {
    const employees = await this.getFilteredEmployees(filters);
    
    const departmentSalaries: Record<string, number> = {};
    employees.forEach(employee => {
      const department = employee.department || 'General';
      departmentSalaries[department] = (departmentSalaries[department] || 0) + (employee.salary || 0);
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(departmentSalaries).map(([department, value], index) => ({
      department,
      value,
      color: colors[index % colors.length]
    }));
  },

  // Get visits over time data
  async getVisitsOverTimeData(filters: DashboardFilters): Promise<{ date: string; visits: number; revenue: number }[]> {
    const visits = await this.getFilteredVisits(filters);
    const { startDate, endDate } = filters.dateRange;
    
    const visitsByDate: Record<string, { visits: number; revenue: number }> = {};
    
    visits.forEach(visit => {
      const date = visit.visit_date.split('T')[0];
      const revenue = (visit.opd_fee || 0) + (visit.lab_fee || 0) + (visit.ot_fee || 0) + 
                     (visit.ultrasound_fee || 0) + (visit.ecg_fee || 0);
      
      if (!visitsByDate[date]) {
        visitsByDate[date] = { visits: 0, revenue: 0 };
      }
      visitsByDate[date].visits += 1;
      visitsByDate[date].revenue += revenue;
    });

    return Object.entries(visitsByDate).map(([date, data]) => ({
      date,
      visits: data.visits,
      revenue: data.revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Get filtered expenses by category
  async getFilteredExpensesByCategory(filters: DashboardFilters): Promise<DepartmentData[]> {
    const expenses = await this.getFilteredExpenses(filters);
    
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(categoryTotals).map(([category, value], index) => ({
      department: category,
      value,
      color: colors[index % colors.length]
    }));
  },

  // Get filtered recent activity
  async getFilteredRecentActivity(filters: DashboardFilters): Promise<ActivityItem[]> {
    const visits = await this.getFilteredVisits(filters);
    const expenses = await this.getFilteredExpenses(filters);

    const activities: ActivityItem[] = [];

    visits.slice(0, 3).forEach(visit => {
      const totalFee = (visit.opd_fee || 0) + (visit.lab_fee || 0) + (visit.ot_fee || 0) + 
                      (visit.ultrasound_fee || 0) + (visit.ecg_fee || 0);
      activities.push({
        id: visit.id,
        type: 'visit',
        description: `New visit: ${visit.patient_name}`,
        amount: totalFee,
        date: visit.visit_date,
        status: 'completed'
      });
    });

    expenses.slice(0, 2).forEach(expense => {
      activities.push({
        id: expense.id,
        type: 'expense',
        description: `${expense.category}: ${expense.description}`,
        amount: expense.amount,
        date: expense.expense_date,
        status: expense.status
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  },

  // Get top performing department
  async getTopPerformingDepartment(filters: DashboardFilters): Promise<string> {
    const visitsByDept = await this.getFilteredVisitsByDepartment(filters);
    if (visitsByDept.length === 0) return 'N/A';
    
    return visitsByDept.reduce((top, current) => 
      current.value > top.value ? current : top
    ).department;
  },

  // Get most active doctor
  async getMostActiveDoctor(filters: DashboardFilters): Promise<string> {
    const visits = await this.getFilteredVisits(filters);
    const doctors = await supabaseDoctorsService.getAllDoctors();
    
    const doctorVisits: Record<string, number> = {};
    visits.forEach(visit => {
      doctorVisits[visit.doctor_id] = (doctorVisits[visit.doctor_id] || 0) + 1;
    });

    if (Object.keys(doctorVisits).length === 0) return 'N/A';

    const mostActiveDoctorId = Object.entries(doctorVisits).reduce((top, current) => 
      current[1] > top[1] ? current : top
    )[0];

    const doctor = doctors.find(d => d.id === mostActiveDoctorId);
    return doctor ? doctor.name : 'N/A';
  },

  // Get top performing doctors data
  async getTopPerformingDoctorsData(filters: DashboardFilters): Promise<{ name: string; revenue: number; patients: number }[]> {
    const visits = await this.getFilteredVisits(filters);
    const doctors = await supabaseDoctorsService.getAllDoctors();
    
    const doctorStats: Record<string, { revenue: number; patients: Set<string> }> = {};
    
    visits.forEach(visit => {
      if (!doctorStats[visit.doctor_id]) {
        doctorStats[visit.doctor_id] = { revenue: 0, patients: new Set() };
      }
      
      const visitRevenue = (visit.opd_fee || 0) + (visit.lab_fee || 0) + (visit.ot_fee || 0) + 
                          (visit.ultrasound_fee || 0) + (visit.ecg_fee || 0);
      
      doctorStats[visit.doctor_id].revenue += visitRevenue;
      doctorStats[visit.doctor_id].patients.add(visit.patient_name);
    });

    const topDoctors = Object.entries(doctorStats)
      .map(([doctorId, stats]) => {
        const doctor = doctors.find(d => d.id === doctorId);
        return {
          name: doctor ? doctor.name : 'Unknown Doctor',
          revenue: stats.revenue,
          patients: stats.patients.size
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return topDoctors;
  },

  // Get available filter options
  async getAvailableFilterOptions(): Promise<{
    departments: FilterOption[];
    doctors: FilterOption[];
    expenseCategories: FilterOption[];
    employeeDepartments: FilterOption[];
  }> {
    const [doctors, expenses, employees] = await Promise.all([
      supabaseDoctorsService.getAllDoctors(),
      supabase.from('expenses').select('category').not('category', 'is', null),
      supabaseEmployeesService.getActiveEmployees()
    ]);

    // Get unique departments from doctors
    const departments = [...new Set(doctors.map(d => d.specialization || 'General'))];
    const departmentOptions: FilterOption[] = departments.map(dept => ({
      value: dept,
      label: dept,
      count: doctors.filter(d => (d.specialization || 'General') === dept).length
    }));

    // Get doctor options
    const doctorOptions: FilterOption[] = doctors.map(doctor => ({
      value: doctor.id,
      label: doctor.name,
      count: 0 // This would need to be calculated based on visits
    }));

    // Get expense categories
    const categories = [...new Set((expenses.data || []).map(e => e.category))];
    const categoryOptions: FilterOption[] = categories.map(category => ({
      value: category,
      label: category,
      count: (expenses.data || []).filter(e => e.category === category).length
    }));

    // Get employee departments
    const empDepartments = [...new Set(employees.map(e => e.department || 'General'))];
    const empDepartmentOptions: FilterOption[] = empDepartments.map(dept => ({
      value: dept,
      label: dept,
      count: employees.filter(e => (e.department || 'General') === dept).length
    }));

    return {
      departments: departmentOptions,
      doctors: doctorOptions,
      expenseCategories: categoryOptions,
      employeeDepartments: empDepartmentOptions
    };
  },

  // Individual filter option methods
  async getAvailableDepartments(): Promise<FilterOption[]> {
    const doctors = await supabaseDoctorsService.getAllDoctors();
    const departments = [...new Set(doctors.map(d => d.specialization || 'General'))];
    return departments.map(dept => ({
      value: dept,
      label: dept,
      count: doctors.filter(d => (d.specialization || 'General') === dept).length
    }));
  },

  async getAvailableDoctors(): Promise<FilterOption[]> {
    const doctors = await supabaseDoctorsService.getAllDoctors();
    return doctors.map(doctor => ({
      value: doctor.id,
      label: doctor.name,
      count: 0
    }));
  },

  async getAvailableExpenseCategories(): Promise<FilterOption[]> {
    const { data: expenses } = await supabase.from('expenses').select('category').not('category', 'is', null);
    const categories = [...new Set((expenses || []).map(e => e.category))];
    return categories.map(category => ({
      value: category,
      label: category,
      count: (expenses || []).filter(e => e.category === category).length
    }));
  },

  async getAvailableEmployeeDepartments(): Promise<FilterOption[]> {
    const employees = await supabaseEmployeesService.getActiveEmployees();
    const departments = [...new Set(employees.map(e => e.department || 'General'))];
    return departments.map(dept => ({
      value: dept,
      label: dept,
      count: employees.filter(e => (e.department || 'General') === dept).length
    }));
  },

  // React Query hooks
  getDashboardSummaryQuery: () => ['general-dashboard-summary'] as const,
  getFilteredDashboardQuery: (filters: DashboardFilters) => ['general-dashboard-filtered', filters] as const,
  getFilterOptionsQuery: () => ['general-dashboard-filter-options'] as const,
};
