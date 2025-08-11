import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  HandCoins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/currency';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';

const SalariesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: supabaseEmployeesService.getActiveEmployees,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Calculate salary totals
  const totalSalaryCost = useMemo(() => {
    return employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  }, [employees]);

  const activeEmployees = useMemo(() => {
    return employees.filter(emp => emp.is_active);
  }, [employees]);

  const inactiveEmployees = useMemo(() => {
    return employees.filter(emp => !emp.is_active);
  }, [employees]);

  // Filter salary-related expenses (advances)
  const salaryAdvances = useMemo(() => {
    return expenses.filter(exp => 
      exp.category.toLowerCase().includes('salary') || 
      exp.category.toLowerCase().includes('advance') ||
      exp.description.toLowerCase().includes('salary') ||
      exp.description.toLowerCase().includes('advance')
    );
  }, [expenses]);

  const totalAdvances = useMemo(() => {
    return salaryAdvances.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [salaryAdvances]);

  // Group employees by department
  const employeesByDepartment = useMemo(() => {
    const grouped: Record<string, number> = {};
    employees.forEach(emp => {
      grouped[emp.department] = (grouped[emp.department] || 0) + 1;
    });
    return grouped;
  }, [employees]);

  const stats = [
    {
      title: 'Total Monthly Salary',
      value: formatCurrency(totalSalaryCost),
      change: '+5.2%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Employees',
      value: activeEmployees.length.toString(),
      change: '+2',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Salary Advances',
      value: formatCurrency(totalAdvances),
      change: '+12.8%',
      icon: HandCoins,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Departments',
      value: Object.keys(employeesByDepartment).length.toString(),
      change: '+1',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge> :
      <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salaries Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage employee salaries and advance payments</p>
          </div>
          <div className="flex gap-3">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline">
              <HandCoins className="h-4 w-4 mr-2" />
              Process Advances
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employees by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Employees by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(employeesByDepartment).map(([department, count]) => (
                    <div key={department} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{department}</span>
                      </div>
                      <span className="font-semibold">{count} employees</span>
                    </div>
                  ))}
                  {Object.keys(employeesByDepartment).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No employees recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Salary Advances */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Salary Advances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryAdvances.slice(0, 5).map((advance) => (
                    <div key={advance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <HandCoins className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{advance.description}</p>
                          <p className="text-sm text-gray-600">{advance.category}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(advance.expense_date).toLocaleDateString()} • 
                            Paid by: {advance.paid_by} • 
                            Received by: {advance.received_by}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(advance.amount)}</p>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">Advance</Badge>
                      </div>
                    </div>
                  ))}
                  {salaryAdvances.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No salary advances recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                        <p className="text-xs text-gray-500">
                          Hired: {new Date(employee.hire_date).toLocaleDateString()} • 
                          Contact: {employee.contact_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(employee.salary)}</p>
                      {getStatusBadge(employee.is_active)}
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No employees recorded yet. Click "Add Employee" to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advances Tab */}
        <TabsContent value="advances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Salary Advances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryAdvances.map((advance) => (
                  <div key={advance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <HandCoins className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{advance.description}</p>
                        <p className="text-sm text-gray-600">{advance.category} • {advance.approved_by}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(advance.expense_date).toLocaleDateString()} • 
                          Paid by: {advance.paid_by} • 
                          Received by: {advance.received_by}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(advance.amount)}</p>
                      <Badge variant="default" className="bg-purple-100 text-purple-800">Advance</Badge>
                    </div>
                  </div>
                ))}
                {salaryAdvances.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No salary advances recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Salary Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Monthly Salary:</span>
                    <span className="font-semibold">{formatCurrency(totalSalaryCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Employees:</span>
                    <span className="font-semibold text-green-600">{activeEmployees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Advances:</span>
                    <span className="font-semibold text-purple-600">{formatCurrency(totalAdvances)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Salary (After Advances):</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(totalSalaryCost - totalAdvances)}
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
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Salary Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Monthly Salaries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Advance Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalariesDashboard;
