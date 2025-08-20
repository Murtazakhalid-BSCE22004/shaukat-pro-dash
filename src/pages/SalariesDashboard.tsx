import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Calendar,
  Building,
  CreditCard,
  Edit,
  Trash2
} from 'lucide-react';
import '../styles/themes/professional-theme.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Employee } from '@/types';
import AddEmployeeDialog from '@/components/ui/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/ui/EditEmployeeDialog';
import DeleteEmployeeDialog from '@/components/ui/DeleteEmployeeDialog';

const SalariesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);
  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch all employees (both active and inactive)
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: supabaseEmployeesService.getAllEmployees,
  });

  // Fetch expenses for salary-related data
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Active employees
  const activeEmployees = useMemo(() => {
    return allEmployees.filter(emp => emp.is_active);
  }, [allEmployees]);

  // Inactive employees
  const inactiveEmployees = useMemo(() => {
    return allEmployees.filter(emp => !emp.is_active);
  }, [allEmployees]);

  // Filter salary-related expenses (advances)
  const salaryAdvances = useMemo(() => {
    return expenses.filter(exp => 
      exp.category.toLowerCase().includes('salary') || 
      exp.category.toLowerCase().includes('advance')
    );
  }, [expenses]);

  // Calculate total salary cost
  const totalSalaryCost = useMemo(() => {
    return activeEmployees.reduce((total, emp) => total + (emp.salary || 0), 0);
  }, [activeEmployees]);

  // Group employees by department
  const employeesByDepartment = useMemo(() => {
    const grouped: Record<string, number> = {};
    activeEmployees.forEach(emp => {
      grouped[emp.department] = (grouped[emp.department] || 0) + 1;
    });
    return grouped;
  }, [activeEmployees]);

  // Employee action handlers
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteEmployeeDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    );
  };

  const stats = [
    {
      title: 'Total Monthly Salary',
      value: formatCurrency(totalSalaryCost),
      change: 'Combined salaries of all active employees',
      icon: DollarSign,
      variant: 'revenue',
    },
    {
      title: 'Active Employees',
      value: activeEmployees.length.toString(),
      change: 'Currently employed staff members',
      icon: Users,
      variant: 'customers',
    },
    {
      title: 'Salary Advances',
      value: salaryAdvances.length.toString(),
      change: 'Advance payments processed',
      icon: CreditCard,
      variant: 'margin',
    },
    {
      title: 'Departments',
      value: Object.keys(employeesByDepartment).length.toString(),
      change: 'Active departments with staff',
      icon: Building,
      variant: 'orders',
    },
  ];

  return (
    <div className="theme-professional-exact min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="welcome-header animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1>Welcome to Salaries Dashboard</h1>
                <p>Shaukat International Hospital - HR Management</p>
              </div>
            </div>
            <button 
              onClick={() => setAddEmployeeDialogOpen(true)}
              className="btn-accent flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`stat-card ${stat.variant} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="icon">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3>{stat.title}</h3>
              <div className="value">{stat.value}</div>
              <div className="change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Overview - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Department Overview</h3>
                <div>
                  <span className="text-sm text-gray-500">Employee distribution</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(employeesByDepartment).map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{department}</span>
                        <p className="text-xs text-gray-500">Active department</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 text-lg">{count}</span>
                      <p className="text-xs text-gray-500">employees</p>
                    </div>
                  </div>
                ))}
                {Object.keys(employeesByDepartment).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>No departments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Salary Statistics */}
            <div className="info-card">
              <h4>Salary Statistics</h4>
              <div className="metric">
                <span className="metric-label">Total Monthly</span>
                <span className="metric-value text-yellow">{formatCurrency(totalSalaryCost)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Active Employees</span>
                <span className="metric-value text-green">{activeEmployees.length}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Inactive Employees</span>
                <span className="metric-value text-red">{inactiveEmployees.length}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Average Salary</span>
                <span className="metric-value text-blue">
                  {activeEmployees.length > 0 ? formatCurrency(totalSalaryCost / activeEmployees.length) : formatCurrency(0)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="info-card">
              <h4>Quick Actions</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/salaries/reports')}
                  className="btn-primary w-full text-left"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Generate Salary Report
                </button>
                <button 
                  onClick={() => navigate('/salaries/employees')}
                  className="btn-accent w-full text-left"
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Process Monthly Salaries
                </button>
                <button 
                  onClick={() => navigate('/salaries/analytics')}
                  className="btn-primary w-full text-left"
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  Department Analysis
                </button>
              </div>
            </div>

            {/* HR Management */}
            <div className="survey-section">
              <h4 className="survey-title">HR Management</h4>
              <div className="survey-content">
                <p>Manage employee salaries, track advance payments, and monitor departmental salary distributions.</p>
                <br />
                <p>Generate comprehensive salary reports and maintain accurate payroll records for all staff members.</p>
              </div>
              <div className="mt-4">
                <button className="btn-primary w-full">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Components */}
      <AddEmployeeDialog 
        open={addEmployeeDialogOpen} 
        onOpenChange={setAddEmployeeDialogOpen} 
      />
      
      <EditEmployeeDialog 
        open={editEmployeeDialogOpen} 
        onOpenChange={setEditEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <DeleteEmployeeDialog 
        open={deleteEmployeeDialogOpen} 
        onOpenChange={setDeleteEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
    </div>
  );
};

export default SalariesDashboard;