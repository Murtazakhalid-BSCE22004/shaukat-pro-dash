import React, { useState, useMemo, useEffect } from 'react';
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
  X
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
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface AnalyticsDashboardProps {
  initialTab?: 'overview' | 'expenses' | 'trends';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ initialTab = 'overview' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(urlTab);

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { from: start, to: end };
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

    return {
      filteredExpenses,
      thisMonthExpenses,
      expensesByCategory,
      highestExpense,
      totalSpent: filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
      pieChartData,
      monthlyTrendData,
      totalFilteredTransactions: filteredExpenses.length
    };
  }, [expenses, dateRange, selectedCategory, searchTerm]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(expenses.map(exp => exp.category))];
    return categories.sort();
  }, [expenses]);

  // Reset all filters
  const resetFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ from: start, to: end });
    setSelectedCategory("all");
    setSearchTerm("");
  };

  const stats = [
    {
      title: 'Total Expenses (Filtered)',
      value: formatCurrency(analyticsData.totalSpent),
      change: `${analyticsData.totalFilteredTransactions} transactions`,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Average Daily Expense',
      value: formatCurrency(analyticsData.totalSpent / 30),
      change: 'Daily average',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'neutral'
    },
    {
      title: 'Expense Categories',
      value: Object.keys(analyticsData.expensesByCategory).length.toString(),
      change: 'Active categories',
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'neutral'
    },
    {
      title: 'Highest Category',
      value: Object.entries(analyticsData.expensesByCategory)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
      change: 'Top spending area',
      icon: Target,
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Financial analytics and insights</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
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

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                Expense Trends Analysis
                {dateRange?.from && dateRange?.to && (
                  <Badge variant="outline" className="ml-2">
                    Filtered Period
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monthly Trend Chart */}
                <div>
                  <h3 className="text-lg font-medium mb-4">6-Month Expense Trend</h3>
                  {analyticsData.monthlyTrendData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.monthlyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="expenses" fill="#3B82F6" name="Monthly Expenses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trend data available for selected filters
                    </div>
                  )}
                </div>

                {/* Trend Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.monthlyTrendData.length}
                    </div>
                    <p className="text-sm text-gray-600">Months Analyzed</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.totalSpent > 0 ? 'Active' : 'No Data'}
                    </div>
                    <p className="text-sm text-gray-600">Current Period</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <PieChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(analyticsData.expensesByCategory).length}
                    </div>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
