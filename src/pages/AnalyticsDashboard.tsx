import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, 
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Filter,
  Search,
  X,
  ArrowLeft,
  Users,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PeriodSelector from '@/components/ui/period-selector';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/utils/currency';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { supabasePatientsService } from '@/services/supabasePatientsService';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { supabaseVisitsService } from '@/services/supabaseVisitsService';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface AnalyticsDashboardProps {
  initialTab?: 'overview' | 'expenses' | 'trends';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ initialTab = 'overview' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(urlTab);

  // Filter states - Default to today
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);

  // Get color for category - moved to top to fix hoisting issue
  const getCategoryColor = (category: string): string => {
    const colors = {
      'Salaries': '#3B82F6',
      'Equipment': '#10B981',
      'Utilities': '#F59E0B',
      'Medicines': '#EF4444',
      'Maintenance': '#8B5CF6',
      'Supplies': '#06B6D4',
      'Other': '#6B7280'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch expenses data
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Fetch additional data for comprehensive analytics
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: supabasePatientsService.getAllPatients,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: supabaseVisitsService.getAllVisits,
  });

  // Calculate analytics data with filtering
  const analyticsData = useMemo(() => {
    let filteredExpenses = expenses;

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filteredExpenses = expenses.filter(exp => {
        const expenseDate = new Date(exp.expense_date);
        return expenseDate >= dateRange.from! && expenseDate <= dateRange.to!;
      });
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filteredExpenses = filteredExpenses.filter(exp => 
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter current month expenses for comparison
    const thisMonthExpenses = expenses.filter(exp => {
      const expenseDate = new Date(exp.expense_date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Group filtered expenses by category
    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + (exp.amount || 0);
    });

    // Find highest single expense from filtered data
    const highestExpense = filteredExpenses.reduce((max, exp) => 
      (exp.amount || 0) > (max.amount || 0) ? exp : max, 
      { amount: 0, description: '', category: '', expense_date: '' }
    );

    // Prepare pie chart data for top expense categories
    const pieChartData = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        color: getCategoryColor(category)
      }));

    // Prepare monthly trend data (last 6 months) - using filtered data if date range is set
    const monthlyTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      let monthExpenses;
      
      if (dateRange?.from && dateRange?.to) {
        // If date range is set, only show data within that range
        monthExpenses = filteredExpenses.filter(exp => {
          const expenseDate = new Date(exp.expense_date);
          return expenseDate.getMonth() === month.getMonth() && expenseDate.getFullYear() === month.getFullYear();
        });
      } else {
        // If no date range, show all data for the month
        monthExpenses = expenses.filter(exp => {
          const expenseDate = new Date(exp.expense_date);
          return expenseDate.getMonth() === month.getMonth() && expenseDate.getFullYear() === month.getFullYear();
        });
      }
      
      const monthTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      
      monthlyTrendData.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        expenses: monthTotal
      });
    }

    // Calculate patient analytics with date filtering
    let filteredPatients = patients;
    if (dateRange?.from && dateRange?.to) {
      filteredPatients = patients.filter(p => {
        const patientDate = new Date(p.created_at);
        return patientDate >= dateRange.from! && patientDate <= dateRange.to!;
      });
    }

    // Calculate visit analytics with date filtering
    let filteredVisits = visits;
    if (dateRange?.from && dateRange?.to) {
      filteredVisits = visits.filter(v => {
        const visitDate = new Date(v.visit_date);
        return visitDate >= dateRange.from! && visitDate <= dateRange.to!;
      });
    }

    // Patient analytics
    const patientAnalytics = {
      totalPatients: filteredPatients.length,
      totalRevenue: filteredPatients.reduce((sum, p) => 
        sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
      ),
      avgRevenuePerPatient: filteredPatients.length > 0 ? 
        filteredPatients.reduce((sum, p) => 
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        ) / filteredPatients.length : 0,
      
      // Fee category breakdown
      feeBreakdown: {
        opd: filteredPatients.reduce((sum, p) => sum + (p.opd_fee || 0), 0),
        lab: filteredPatients.reduce((sum, p) => sum + (p.lab_fee || 0), 0),
        ultrasound: filteredPatients.reduce((sum, p) => sum + (p.ultrasound_fee || 0), 0),
        ecg: filteredPatients.reduce((sum, p) => sum + (p.ecg_fee || 0), 0),
        ot: filteredPatients.reduce((sum, p) => sum + (p.ot_fee || 0), 0)
      },

      // Doctor-wise patient distribution
      doctorDistribution: doctors.reduce((acc, doctor) => {
        const doctorPatients = filteredPatients.filter(p => p.doctor_name === doctor.name);
        const doctorRevenue = doctorPatients.reduce((sum, p) => 
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        );
        acc[doctor.name] = {
          patients: doctorPatients.length,
          revenue: doctorRevenue,
          avgRevenue: doctorPatients.length > 0 ? doctorRevenue / doctorPatients.length : 0
        };
        return acc;
      }, {} as Record<string, { patients: number; revenue: number; avgRevenue: number }>)
    };

    // Doctor analytics
    const doctorAnalytics = {
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(d => d.is_active).length,
      totalVisits: filteredVisits.length,
      
      // Doctor performance data
      doctorPerformance: doctors.map(doctor => {
        const doctorVisits = filteredVisits.filter(v => v.doctor_id === doctor.id);
        const doctorRevenue = doctorVisits.reduce((sum, v) => 
          sum + (v.opd_fee || 0) + (v.lab_fee || 0) + (v.ultrasound_fee || 0) + (v.ecg_fee || 0) + (v.ot_fee || 0), 0
        );
        return {
          name: doctor.name,
          visits: doctorVisits.length,
          revenue: doctorRevenue,
          avgRevenue: doctorVisits.length > 0 ? doctorRevenue / doctorVisits.length : 0,
          patients: filteredPatients.filter(p => p.doctor_name === doctor.name).length
        };
      }).sort((a, b) => b.revenue - a.revenue),

      // Specialization distribution
      specializationData: doctors.reduce((acc, doctor) => {
        const spec = doctor.specialization || 'General';
        acc[spec] = (acc[spec] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Monthly trends for all data types
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      
      const monthExpenses = filteredExpenses.filter(exp => {
        const expenseDate = new Date(exp.expense_date);
        return expenseDate.getMonth() === month.getMonth() && expenseDate.getFullYear() === month.getFullYear();
      });
      
      const monthPatients = filteredPatients.filter(p => {
        const patientDate = new Date(p.created_at);
        return patientDate.getMonth() === month.getMonth() && patientDate.getFullYear() === month.getFullYear();
      });
      
      const monthVisits = filteredVisits.filter(v => {
        const visitDate = new Date(v.visit_date);
        return visitDate.getMonth() === month.getMonth() && visitDate.getFullYear() === month.getFullYear();
      });
      
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        expenses: monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        patients: monthPatients.length,
        visits: monthVisits.length,
        revenue: monthPatients.reduce((sum, p) => 
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        )
      };
    }).reverse();

    return {
      filteredExpenses,
      thisMonthExpenses,
      expensesByCategory,
      highestExpense,
      totalSpent: filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
      pieChartData,
      monthlyTrendData,
      totalFilteredTransactions: filteredExpenses.length,
      patientAnalytics,
      doctorAnalytics,
      monthlyTrends
    };
  }, [expenses, patients, doctors, visits, dateRange, selectedCategory, searchTerm]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(expenses.map(exp => exp.category))];
    return categories.sort();
  }, [expenses]);

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    quinary: '#8B5CF6',
    senary: '#06B6D4'
  };

  // Reset all filters
  const resetFilters = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setSelectedCategory("all");
    setSearchTerm("");
  };

  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(analyticsData.totalSpent),
      change: `${analyticsData.totalFilteredTransactions} transactions`,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Total Patients',
      value: analyticsData.patientAnalytics.totalPatients.toString(),
      change: 'Registered patients',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'neutral'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${analyticsData.patientAnalytics.totalRevenue.toLocaleString()}`,
      change: 'From patients',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    {
      title: 'Active Doctors',
      value: analyticsData.doctorAnalytics.activeDoctors.toString(),
      change: 'Treating patients',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'neutral'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link to="/professional">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Financial analytics and insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Analytics
            </Button>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Period</Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group shadow-sm hover:shadow-lg"
                onClick={() => setIsPeriodSelectorOpen(true)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                    <Calendar className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900 font-medium">
                    {dateRange?.from && dateRange?.to 
                      ? `${dateRange.from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - ${dateRange.to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`
                      : 'Select date range'
                    }
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </Button>
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2">Search</Label>
              <Input
                id="search"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-lg"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={resetFilters}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 shadow-sm hover:shadow-lg text-gray-700 hover:text-red-700 font-medium"
              >
                Reset All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Selector Modal */}
      {isPeriodSelectorOpen && (
        <PeriodSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClose={() => setIsPeriodSelectorOpen(false)}
          isOpen={isPeriodSelectorOpen}
        />
      )}

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
              <div className="flex items-center space-x-1">
                {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-600" />}
                {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                <p className="text-xs text-gray-600 font-medium">{stat.change}</p>
              </div>
              {dateRange?.from && dateRange?.to && (
                <p className="text-xs text-gray-500 mt-1">
                  {dateRange.from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - {dateRange.to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Expense Categories Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Top Expense Categories
                  {Object.keys(analyticsData.expensesByCategory).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(analyticsData.expensesByCategory).length} categories
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.pieChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No expense data available for selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Monthly Expense Trend
                  {dateRange?.from && dateRange?.to && (
                    <Badge variant="outline" className="ml-2">
                      Filtered
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.monthlyTrendData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          name="Monthly Expenses"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No trend data available for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highest Single Expense */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Highest Single Expense
                  {dateRange?.from && dateRange?.to && (
                    <Badge variant="outline" className="ml-2">
                      Filtered
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.highestExpense.amount > 0 ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {formatCurrency(analyticsData.highestExpense.amount)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {analyticsData.highestExpense.description}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {analyticsData.highestExpense.category}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No expenses found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Expense Summary
                  {dateRange?.from && dateRange?.to && (
                    <Badge variant="outline" className="ml-2">
                      Filtered
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(analyticsData.totalSpent)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Total {dateRange?.from && dateRange?.to ? 'for Period' : 'This Month'}
                  </p>
                  <div className="text-sm text-gray-600">
                    {analyticsData.totalFilteredTransactions} transactions
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expense Analysis Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                Detailed Expense Analysis
                {dateRange?.from && dateRange?.to && (
                  <Badge variant="outline" className="ml-2">
                    Filtered Period
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Category Breakdown */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
                  {Object.keys(analyticsData.expensesByCategory).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analyticsData.expensesByCategory).map(([category, amount]) => {
                        const percentage = (amount / analyticsData.totalSpent) * 100;
                        return (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getCategoryColor(category) }}
                              ></div>
                              <span className="font-medium">{category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(amount)}</div>
                              <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No expenses found for selected filters
                    </div>
                  )}
                </div>

                {/* Top 5 Expenses */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Top 5 Expenses</h3>
                  {analyticsData.filteredExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsData.filteredExpenses
                        .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                        .slice(0, 5)
                        .map((expense, index) => (
                          <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{expense.description}</div>
                                <div className="text-sm text-gray-600">{expense.category}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(expense.expense_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No expenses found for selected filters
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Fee Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'OPD', value: analyticsData.patientAnalytics.feeBreakdown.opd },
                      { name: 'Lab', value: analyticsData.patientAnalytics.feeBreakdown.lab },
                      { name: 'Ultrasound', value: analyticsData.patientAnalytics.feeBreakdown.ultrasound },
                      { name: 'ECG', value: analyticsData.patientAnalytics.feeBreakdown.ecg },
                      { name: 'OT', value: analyticsData.patientAnalytics.feeBreakdown.ot }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Amount']} />
                      <Bar dataKey="value" fill={chartColors.primary} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'OPD', value: analyticsData.patientAnalytics.feeBreakdown.opd, color: chartColors.primary },
                          { name: 'Lab', value: analyticsData.patientAnalytics.feeBreakdown.lab, color: chartColors.secondary },
                          { name: 'Ultrasound', value: analyticsData.patientAnalytics.feeBreakdown.ultrasound, color: chartColors.tertiary },
                          { name: 'ECG', value: analyticsData.patientAnalytics.feeBreakdown.ecg, color: chartColors.quaternary },
                          { name: 'OT', value: analyticsData.patientAnalytics.feeBreakdown.ot, color: chartColors.quinary }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'OPD', value: analyticsData.patientAnalytics.feeBreakdown.opd, color: chartColors.primary },
                          { name: 'Lab', value: analyticsData.patientAnalytics.feeBreakdown.lab, color: chartColors.secondary },
                          { name: 'Ultrasound', value: analyticsData.patientAnalytics.feeBreakdown.ultrasound, color: chartColors.tertiary },
                          { name: 'ECG', value: analyticsData.patientAnalytics.feeBreakdown.ecg, color: chartColors.quaternary },
                          { name: 'OT', value: analyticsData.patientAnalytics.feeBreakdown.ot, color: chartColors.quinary }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Amount']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Doctor Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(analyticsData.patientAnalytics.doctorDistribution).map(([name, data]) => ({
                    name,
                    patients: data.patients,
                    revenue: data.revenue
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Count/Amount']} />
                    <Legend />
                    <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    <Bar dataKey="revenue" fill={chartColors.secondary} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Doctors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Performing Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.doctorAnalytics.doctorPerformance.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill={chartColors.primary} name="Revenue" />
                      <Bar dataKey="visits" fill={chartColors.secondary} name="Visits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Doctor Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analyticsData.doctorAnalytics.specializationData).map(([name, value]) => ({
                          name,
                          value,
                          color: chartColors[name as keyof typeof chartColors] || chartColors.primary
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analyticsData.doctorAnalytics.specializationData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[entry[0] as keyof typeof chartColors] || chartColors.primary} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Average Revenue per Doctor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Average Revenue per Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.doctorAnalytics.doctorPerformance.map(doctor => ({
                    name: doctor.name,
                    avgRevenue: doctor.avgRevenue
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rs. ${value}`, 'Avg Revenue']} />
                    <Bar dataKey="avgRevenue" fill={chartColors.tertiary} name="Avg Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Patient Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Monthly Patient Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Monthly Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill={chartColors.secondary} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Combined Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Count/Amount']} />
                    <Legend />
                    <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    <Bar dataKey="visits" fill={chartColors.tertiary} name="Visits" />
                    <Bar dataKey="expenses" fill={chartColors.quaternary} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
