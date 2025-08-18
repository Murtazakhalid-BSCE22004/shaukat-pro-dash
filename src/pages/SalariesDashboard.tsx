import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
      description: 'Combined salaries of all active employees',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Employees',
      value: activeEmployees.length.toString(),
      description: 'Currently employed staff members',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Salary Advances',
      value: salaryAdvances.length.toString(),
      description: 'Advance payments processed',
      icon: CreditCard,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Departments',
      value: Object.keys(employeesByDepartment).length.toString(),
      description: 'Active departments with staff',
      icon: Building,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salaries Overview</h1>
            <p className="text-gray-600 mt-1">Monitor employee salaries and department statistics</p>
          </div>
          <Button 
            onClick={() => setAddEmployeeDialogOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(employeesByDepartment).map(([department, count]) => (
                <div key={department} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{department}</span>
                  </div>
                  <span className="font-semibold text-sm">{count}</span>
                </div>
              ))}
              {Object.keys(employeesByDepartment).length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">No departments yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Salary Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Monthly:</span>
                <span className="font-semibold text-sm">{formatCurrency(totalSalaryCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Employees:</span>
                <span className="font-semibold text-green-600 text-sm">{activeEmployees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inactive Employees:</span>
                <span className="font-semibold text-gray-500 text-sm">{inactiveEmployees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Salary:</span>
                <span className="font-semibold text-blue-600 text-sm">
                  {activeEmployees.length > 0 ? formatCurrency(totalSalaryCost / activeEmployees.length) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm h-8">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Salary Report
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-8">
                <CreditCard className="h-4 w-4 mr-2" />
                Process Monthly Salaries
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-8">
                <TrendingUp className="h-4 w-4 mr-2" />
                Department Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
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