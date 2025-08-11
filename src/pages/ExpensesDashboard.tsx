import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  BarChart3,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/currency';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import AddExpenseDialog from '@/components/ui/AddExpenseDialog';

interface ExpensesDashboardProps {
  initialTab?: 'overview' | 'expenses' | 'reports';
}

const ExpensesDashboard: React.FC<ExpensesDashboardProps> = ({ initialTab = 'overview' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(urlTab);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch expenses data
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Calculate expense totals
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  const todayExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return expenses.filter(exp => exp.expense_date === today);
  }, [expenses]);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses.filter(exp => {
      const expenseDate = new Date(exp.expense_date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  }, [expenses]);

  const totalTodayExpenses = useMemo(() => {
    return todayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [todayExpenses]);

  const totalThisMonthExpenses = useMemo(() => {
    return thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [thisMonthExpenses]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(exp => {
      grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
    });
    return grouped;
  }, [expenses]);

  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      change: '+12.3%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: "Today's Expenses",
      value: formatCurrency(totalTodayExpenses),
      change: '+8.1%',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'This Month',
      value: formatCurrency(totalThisMonthExpenses),
      change: '+15.7%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Average Daily',
      value: formatCurrency(totalThisMonthExpenses / Math.max(1, new Date().getDate())),
      change: '+2.4%',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expenses Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage hospital expenses and track spending</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setAddExpenseDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(expensesByCategory).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.expense_date).toLocaleDateString()} • 
                            Paid by: {expense.paid_by} • 
                            Received by: {expense.received_by}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Header with filters and search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">All Expenses</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {expenses.length} expenses • Total: {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Expenses List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {expense.description}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(expense.expense_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>Paid by:</span>
                                <span className="font-medium">{expense.paid_by}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>Received by:</span>
                                <span className="font-medium">{expense.received_by}</span>
                              </div>
                            </div>
                            {expense.receipt_url && (
                              <div className="mt-2">
                                <a 
                                  href={expense.receipt_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>View Receipt</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {getStatusBadge(expense.status)}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">View details</span>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                    <p className="text-gray-600 mb-6">
                      Get started by adding your first expense to track hospital spending.
                    </p>
                    <Button onClick={() => setAddExpenseDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Footer */}
          {expenses.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
                    <div className="text-sm text-gray-600">Total Expenses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalTodayExpenses)}</div>
                    <div className="text-sm text-gray-600">Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalThisMonthExpenses)}</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalExpenses)}</div>
                    <div className="text-sm text-gray-600">All Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Expenses:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(totalTodayExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month:</span>
                    <span className="font-semibold text-purple-600">{formatCurrency(totalThisMonthExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Daily:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(totalThisMonthExpenses / Math.max(1, new Date().getDate()))}</span>
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
                    Generate Monthly Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Expense Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={addExpenseDialogOpen} 
        onOpenChange={setAddExpenseDialogOpen} 
      />
    </div>
  );
};

export default ExpensesDashboard;
