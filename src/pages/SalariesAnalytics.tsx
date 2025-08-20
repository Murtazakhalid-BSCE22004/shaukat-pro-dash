import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Building,
  Calendar,
  Target,
  Award,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee } from '@/types';
import '../styles/themes/modern-professional.css';

const SalariesAnalytics: React.FC = () => {
  // Fetch all employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: supabaseEmployeesService.getAllEmployees,
  });

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.is_active);
    const inactiveEmployees = employees.filter(emp => !emp.is_active);
    
    const totalSalaries = activeEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const averageSalary = activeEmployees.length > 0 ? totalSalaries / activeEmployees.length : 0;
    
    // Department breakdown
    const departmentStats = activeEmployees.reduce((acc, emp) => {
      const dept = emp.position || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalSalary: 0 };
      }
      acc[dept].count += 1;
      acc[dept].totalSalary += emp.salary || 0;
      return acc;
    }, {} as Record<string, { count: number; totalSalary: number }>);

    // Salary ranges
    const salaryRanges = {
      'Below 30k': activeEmployees.filter(emp => (emp.salary || 0) < 30000).length,
      '30k-50k': activeEmployees.filter(emp => (emp.salary || 0) >= 30000 && (emp.salary || 0) < 50000).length,
      '50k-100k': activeEmployees.filter(emp => (emp.salary || 0) >= 50000 && (emp.salary || 0) < 100000).length,
      'Above 100k': activeEmployees.filter(emp => (emp.salary || 0) >= 100000).length,
    };

    // Top earning departments
    const topDepartments = Object.entries(departmentStats)
      .map(([dept, stats]) => ({
        department: dept,
        averageSalary: stats.totalSalary / stats.count,
        employeeCount: stats.count,
        totalSalary: stats.totalSalary
      }))
      .sort((a, b) => b.averageSalary - a.averageSalary)
      .slice(0, 5);

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: inactiveEmployees.length,
      totalSalaries,
      averageSalary,
      departmentStats,
      salaryRanges,
      topDepartments
    };
  }, [employees]);

  const stats = [
    {
      title: "Total Employees",
      value: analyticsData.totalEmployees.toString(),
      change: `${analyticsData.activeEmployees} active`,
      icon: Users,
      variant: "orders"
    },
    {
      title: "Total Salaries",
      value: formatCurrency(analyticsData.totalSalaries),
      change: "Monthly payroll",
      icon: DollarSign,
      variant: "revenue"
    },
    {
      title: "Average Salary",
      value: formatCurrency(analyticsData.averageSalary),
      change: "Per employee",
      icon: TrendingUp,
      variant: "customers"
    },
    {
      title: "Active Departments",
      value: Object.keys(analyticsData.departmentStats).length.toString(),
      change: "Hospital departments",
      icon: Building,
      variant: "margin"
    }
  ];

  return (
    <div className="modern-professional-theme p-6">
      {/* Modern Header */}
      <div className="modern-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="modern-page-title">Salaries Analytics</h1>
            <p className="modern-page-subtitle">Comprehensive salary analysis and employee insights</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-lg">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="font-medium">Real-time data</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.title} 
            className={`modern-stat-card ${stat.variant} modern-slide-in-delay-${index}`}
          >
            <div className="card-icon">
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="card-title">{stat.title}</h3>
            <div className="card-value">{stat.value}</div>
            <div className="card-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Breakdown */}
        <div className="modern-content-card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Department Breakdown
              </h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {Object.entries(analyticsData.departmentStats).map(([dept, stats]) => (
                <div key={dept} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div>
                    <h4 className="font-semibold text-gray-900">{dept}</h4>
                    <p className="text-sm text-gray-600">{stats.count} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(stats.totalSalary)}</p>
                    <p className="text-xs text-gray-500">Total salary</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Ranges */}
        <div className="modern-content-card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Salary Distribution
              </h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {Object.entries(analyticsData.salaryRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div>
                    <h4 className="font-semibold text-gray-900">{range}</h4>
                    <p className="text-sm text-gray-600">Salary range</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{count}</p>
                    <p className="text-xs text-gray-500">employees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Earning Departments */}
      <div className="modern-content-card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              Top Earning Departments
            </h3>
          </div>
        </div>
        <div className="card-content p-0">
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Total Salary</th>
                  <th>Average Salary</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topDepartments.map((dept, index) => (
                  <tr key={dept.department}>
                    <td className="font-medium">{dept.department}</td>
                    <td>{dept.employeeCount}</td>
                    <td className="font-semibold text-blue-600">
                      {formatCurrency(dept.totalSalary)}
                    </td>
                    <td className="font-semibold text-green-600">
                      {formatCurrency(dept.averageSalary)}
                    </td>
                    <td>
                      <span className={`modern-badge ${index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}`}>
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="modern-content-card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Employee Status
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analyticsData.activeEmployees}
                </div>
                <div className="text-sm text-gray-600">Active Employees</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analyticsData.inactiveEmployees}
                </div>
                <div className="text-sm text-gray-600">Inactive Employees</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-content-card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Payroll Summary
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <span className="text-gray-700">Monthly Payroll:</span>
                <span className="font-bold text-indigo-600">{formatCurrency(analyticsData.totalSalaries)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <span className="text-gray-700">Average per Employee:</span>
                <span className="font-bold text-purple-600">{formatCurrency(analyticsData.averageSalary)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                <span className="text-gray-700">Annual Projection:</span>
                <span className="font-bold text-orange-600">{formatCurrency(analyticsData.totalSalaries * 12)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalariesAnalytics;
