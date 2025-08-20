import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Stethoscope,
  DollarSign,
  UserCog,
  ChevronDown,
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  Banknote,
  PiggyBank,
  Calculator,
  Filter,
  RefreshCw,
  BarChart3,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Import chart components
import { GeneralKPICard } from '@/components/charts/GeneralKPIChart';
import { RevenueExpensesChart } from '@/components/charts/RevenueExpensesChart';
import { DepartmentChart } from '@/components/charts/DepartmentChart';
import { RecentActivityTable } from '@/components/charts/RecentActivityTable';
import TopPerformingDoctorsChart from '@/components/charts/TopPerformingDoctorsChart';

// Import filter components
import EnhancedDashboardFilters from '@/components/ui/EnhancedDashboardFilters';

// Import service
import { supabaseGeneralDashboardService } from '@/services/supabaseGeneralDashboardService';
import { DashboardFilters, FilterOption } from '@/types';

const GeneralHospitalDashboard: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    },
    departments: [],
    doctors: [],
    expenseCategories: [],
    employeeDepartments: [],
    timePeriod: 'monthly'
  });

  const [isFiltered, setIsFiltered] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const dashboardNavigation = [
    { name: 'Professional Dashboard', href: '/professional', icon: Stethoscope, color: 'text-blue-600', description: 'Doctors & Patient Management' },
    { name: 'Expenses Dashboard', href: '/expenses', icon: DollarSign, color: 'text-green-600', description: 'Financial Management' },
    { name: 'Salaries Dashboard', href: '/salaries', icon: UserCog, color: 'text-blue-600', description: 'Employee Salary Management' },
  ];

  // Fetch available filter options
  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: ['dashboard-filter-options'],
    queryFn: async () => {
      const [departments, doctors, expenseCategories, employeeDepartments] = await Promise.all([
        supabaseGeneralDashboardService.getAvailableDepartments(),
        supabaseGeneralDashboardService.getAvailableDoctors(),
        supabaseGeneralDashboardService.getAvailableExpenseCategories(),
        supabaseGeneralDashboardService.getAvailableEmployeeDepartments()
      ]);

      return {
        departments,
        doctors,
        expenseCategories,
        employeeDepartments
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dashboard data with filters
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: isFiltered 
      ? ['general-dashboard-filtered', filters]
      : ['general-dashboard-summary'],
    queryFn: () => isFiltered 
      ? supabaseGeneralDashboardService.getFilteredDashboardData(filters)
      : supabaseGeneralDashboardService.getDashboardSummary(),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true
  });

  // Handle filter changes
  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
    setIsFiltered(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    const defaultFilters: DashboardFilters = {
      dateRange: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      },
      departments: [],
      doctors: [],
      expenseCategories: [],
      employeeDepartments: [],
      timePeriod: 'monthly'
    };
    setFilters(defaultFilters);
    setIsFiltered(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    refetch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpiCards = dashboardData ? [
    {
      label: 'Total Doctors',
      value: dashboardData.kpis.totalDoctors,
      change: 5.2, // This could be calculated from historical data
      trend: 'up' as const,
      icon: Users,
      color: 'text-blue-600',
      formatter: (val: number) => val.toString()
    },
    {
      label: 'Active Patients',
      value: dashboardData.kpis.activePatients,
      change: dashboardData.trends.visitChange,
      trend: dashboardData.trends.visitChange >= 0 ? 'up' as const : 'down' as const,
      icon: Calendar,
      color: 'text-green-600',
      formatter: (val: number) => val.toString()
    },
    {
      label: 'Monthly Visits',
      value: dashboardData.kpis.totalVisits,
      change: dashboardData.trends.visitChange,
      trend: dashboardData.trends.visitChange >= 0 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      color: 'text-purple-600',
      formatter: (val: number) => val.toString()
    },
    {
      label: 'Monthly Revenue',
      value: dashboardData.kpis.monthlyRevenue,
      change: dashboardData.trends.revenueChange,
      trend: dashboardData.trends.revenueChange >= 0 ? 'up' as const : 'down' as const,
      icon: Banknote,
      color: 'text-green-600',
      formatter: formatCurrency
    },
    {
      label: 'Monthly Expenses',
      value: dashboardData.kpis.monthlyExpenses,
      change: dashboardData.trends.expenseChange,
      trend: dashboardData.trends.expenseChange >= 0 ? 'up' as const : 'down' as const,
      icon: DollarSign,
      color: 'text-red-600',
      formatter: formatCurrency
    },
    {
      label: 'Monthly Salaries',
      value: dashboardData.kpis.monthlySalaries,
      change: 0, // Salary changes are typically less frequent
      trend: 'neutral' as const,
      icon: PiggyBank,
      color: 'text-blue-600',
      formatter: formatCurrency
    },
    {
      label: 'Net Profit',
      value: dashboardData.kpis.netProfit,
      change: dashboardData.trends.profitChange,
      trend: dashboardData.trends.profitChange >= 0 ? 'up' as const : 'down' as const,
      icon: Calculator,
      color: dashboardData.kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      formatter: formatCurrency
    }
  ] : [];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to fetch dashboard data. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>General Hospital Dashboard | Shaukat International Hospital</title>
        <meta name="description" content="Executive overview dashboard for comprehensive hospital management" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm border-b"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">General Hospital Dashboard</h1>
                  <p className="text-gray-600">Executive Overview & Analytics</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Filter Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isFiltered ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {isFiltered ? "Filtered" : "Filter"}
                  </Button>
                  
                  {isFiltered && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-md">
                      {format(filters.dateRange.startDate, 'dd MMM yyyy')} - {format(filters.dateRange.endDate, 'dd MMM yyyy')}
                    </div>
                  )}

                  {isFiltered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>

                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Main
                  </Button>
                </Link>
                
                {/* Dashboard Navigation Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="hidden sm:inline">Switch Dashboard</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {dashboardNavigation.map((option) => (
                      <DropdownMenuItem key={option.name} asChild>
                        <Link to={option.href} className="flex items-center gap-3 p-3">
                          <div className={cn("p-2 rounded-lg", option.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                            <option.icon className={cn("h-4 w-4", option.color)} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{option.name}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b shadow-sm"
          >
            <div className="container mx-auto px-4 py-6">
              <EnhancedDashboardFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableOptions={filterOptions || {
                  departments: [],
                  doctors: [],
                  expenseCategories: [],
                  employeeDepartments: []
                }}
                isLoading={filterOptionsLoading}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
              />
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Filter Status */}
              {isFiltered && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Active Filters</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span>Date Range: {format(filters.dateRange.startDate, 'dd MMM yyyy')} - {format(filters.dateRange.endDate, 'dd MMM yyyy')}</span>
                      {filters.departments.length > 0 && (
                        <span>Departments: {filters.departments.length}</span>
                      )}
                      {filters.doctors.length > 0 && (
                        <span>Doctors: {filters.doctors.length}</span>
                      )}
                      {filters.expenseCategories.length > 0 && (
                        <span>Expense Categories: {filters.expenseCategories.length}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* KPI Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                  {kpiCards.map((kpi, index) => (
                    <GeneralKPICard
                      key={kpi.label}
                      {...kpi}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue vs Expenses Chart */}
                <RevenueExpensesChart 
                  data={dashboardData?.charts.revenueVsExpenses || []}
                  loading={isLoading}
                />

                {/* Visits by Department */}
                <DepartmentChart
                  data={dashboardData?.charts.visitsByDepartment || []}
                  title="Patient Visits by Department"
                  description="Distribution of patient visits across medical departments"
                  loading={isLoading}
                />
              </div>

              {/* Second Row of Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary Distribution */}
                <DepartmentChart
                  data={dashboardData?.charts.salaryByDepartment || []}
                  title="Salary Distribution by Department"
                  description="Monthly salary costs across departments"
                  loading={isLoading}
                  valueFormatter={formatCurrency}
                />

                {/* Top Performing Doctors */}
                <TopPerformingDoctorsChart
                  data={dashboardData?.charts.topPerformingDoctors || []}
                />
              </div>

              {/* Third Row - Additional Charts for Filtered Data */}
              {isFiltered && dashboardData?.charts.visitsOverTime && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visits Over Time */}
                  <DepartmentChart
                    data={dashboardData.charts.visitsOverTime.map(item => ({
                      department: item.date,
                      value: item.visits,
                      color: '#3B82F6'
                    }))}
                    title="Visits Over Time"
                    description="Patient visits trend during selected period"
                    loading={isLoading}
                  />

                  {/* Expenses by Category */}
                  <DepartmentChart
                    data={dashboardData.charts.expensesByCategory || []}
                    title="Expenses by Category"
                    description="Expense distribution across categories"
                    loading={isLoading}
                    valueFormatter={formatCurrency}
                  />
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 gap-8">
                <RecentActivityTable
                  activities={dashboardData?.recentActivity || []}
                  loading={isLoading}
                />
              </div>

              {/* Summary Cards for Filtered Data */}
              {isFiltered && dashboardData?.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Visit Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(dashboardData.summary.averageVisitValue)}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Department</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {dashboardData.summary.topPerformingDepartment}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Most Active Doctor</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {dashboardData.summary.mostActiveDoctor}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time Period</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {filters.timePeriod}
                        </p>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2024 Shaukat International Hospital. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              General Hospital Dashboard - Executive Analytics
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default GeneralHospitalDashboard;
