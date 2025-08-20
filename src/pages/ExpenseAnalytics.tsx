import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Calendar,
  FileText,
  Activity,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Area,
  AreaChart
} from 'recharts';
import { formatCurrency } from '@/utils/currency';

interface ExpenseAnalyticsProps {
  initialTab?: 'overview' | 'trends' | 'categories';
}

const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ initialTab = 'overview' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(urlTab);
  const [periodMode, setPeriodMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch expenses data
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Calculate expense analytics data with period filtering
  const analyticsData = useMemo(() => {
    // Helper functions for date filtering
    const getDateRange = () => {
      const now = new Date();
      const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      if (periodMode === 'daily') {
        // Last 7 days
        const start = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        const end = endOfDay(now);
        return { start, end };
      }
      
      if (periodMode === 'weekly') {
        // Last 4 weeks
        const start = startOfDay(new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000));
        const end = endOfDay(now);
        return { start, end };
      }
      
      if (periodMode === 'yearly') {
        // Last 3 years
        const start = new Date(now.getFullYear() - 2, 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
      
      // Monthly - Last 6 months
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    };

    const { start: dateStart, end: dateEnd } = getDateRange();

    // Filter expenses based on selected period
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= dateStart && expenseDate <= dateEnd;
    });

    // Basic expense analytics
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const approvedExpenses = filteredExpenses; // All expenses are approved
  const totalApproved = approvedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Category breakdown
    const categoryData = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += expense.amount || 0;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    const categoryChartData = Object.values(categoryData).map(cat => ({
      name: cat.name,
      value: cat.value,
      count: cat.count,
      percentage: totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : '0'
    }));

    // Status breakdown (all expenses are approved)
    const statusData = [
      { name: 'Approved', value: totalApproved, count: approvedExpenses.length, color: '#16A34A' }
    ];

    // Time-based analytics
    const timeData = (() => {
      if (periodMode === 'daily') {
        // Group by day for last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayExpenses = filteredExpenses.filter(exp => exp.expense_date === dateStr);
          const total = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
          days.push({
            period: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            amount: total,
            count: dayExpenses.length
          });
        }
        return days;
      }
      
      if (periodMode === 'weekly') {
        // Group by week for last 4 weeks
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - (i * 7));
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          
          const weekExpenses = filteredExpenses.filter(exp => {
            const expDate = new Date(exp.expense_date);
            return expDate >= startDate && expDate <= endDate;
          });
          
          const total = weekExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
          weeks.push({
            period: `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`,
            amount: total,
            count: weekExpenses.length
          });
        }
        return weeks;
      }
      
      if (periodMode === 'yearly') {
        // Group by year for last 3 years
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = 2; i >= 0; i--) {
          const year = currentYear - i;
          const yearExpenses = filteredExpenses.filter(exp => {
            const expYear = new Date(exp.expense_date).getFullYear();
            return expYear === year;
          });
          const total = yearExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
          years.push({
            period: year.toString(),
            amount: total,
            count: yearExpenses.length
          });
        }
        return years;
      }
      
      // Monthly - last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const monthExpenses = filteredExpenses.filter(exp => {
          const expDate = new Date(exp.expense_date);
          return expDate.getFullYear() === year && expDate.getMonth() === month;
        });
        
        const total = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        months.push({
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: total,
          count: monthExpenses.length
        });
      }
      return months;
    })();

    // Calculate averages and trends
    const averageExpenseAmount = filteredExpenses.length > 0 
      ? totalExpenses / filteredExpenses.length 
      : 0;

    const averageDailyExpense = timeData.length > 0 
      ? timeData.reduce((sum, day) => sum + day.amount, 0) / timeData.length 
      : 0;

    // Approval rate
        const approvalRate = 100; // All expenses are approved

    return {
      summary: {
        totalExpenses,
        totalCount: filteredExpenses.length,
        approvedCount: approvedExpenses.length,
        averageAmount: averageExpenseAmount,
        averageDaily: averageDailyExpense,
        approvalRate
      },
      categoryData: categoryChartData,
      statusData,
      timeData,
      topCategories: categoryChartData
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      periodMode
    };
  }, [expenses, periodMode]);

  // Chart colors
  const chartColors = {
    primary: '#16A34A',
    secondary: '#22C55E',
    accent: '#15803D',
    gradient: ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0']
  };

  const pieColors = ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-700">Expense Analytics</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Comprehensive expense insights and trends</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
              <Button
                key={period}
                variant={periodMode === period ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodMode(period)}
                className={periodMode === period ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600"}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Expenses</CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(analyticsData.summary.totalExpenses)}</div>
            <p className="text-xs text-gray-600">{analyticsData.summary.totalCount} transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Approval Rate</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{analyticsData.summary.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600">{analyticsData.summary.approvedCount} approved</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Average Amount</CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(analyticsData.summary.averageAmount)}</div>
            <p className="text-xs text-gray-600">per transaction</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Daily Average</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(analyticsData.summary.averageDaily)}</div>
            <p className="text-xs text-gray-600">per {periodMode.slice(0, -2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Trends</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Expense Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Amount']}
                        labelFormatter={(label) => `Status: ${label}`}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.statusData.map((status, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span>{status.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(status.value)}</div>
                        <div className="text-xs text-gray-500">{status.count} items</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Top Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.value)}</div>
                          <div className="text-xs text-gray-500">{category.percentage}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Expense Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Transaction Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Transactions']}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Bar dataKey="count" fill={chartColors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {analyticsData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Category Amounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.categoryData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      />
                      <Bar dataKey="value" fill={chartColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Category Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Category Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Count</th>
                      <th className="text-right py-2 font-medium">Average</th>
                      <th className="text-right py-2 font-medium">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.categoryData
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{category.name}</td>
                          <td className="text-right py-2">{formatCurrency(category.value)}</td>
                          <td className="text-right py-2">{category.count}</td>
                          <td className="text-right py-2">
                            {formatCurrency(category.value / category.count)}
                          </td>
                          <td className="text-right py-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {category.percentage}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseAnalytics;
