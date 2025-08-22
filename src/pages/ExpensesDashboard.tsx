import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Plus,
  FileText,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
  Filter,
  Tag
} from 'lucide-react';
import '../styles/themes/professional-theme.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/currency';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Expense } from '@/types';
import AddExpenseDialog from '@/components/ui/AddExpenseDialog';
import EditExpenseDialog from '@/components/ui/EditExpenseDialog';
import DeleteExpenseDialog from '@/components/ui/DeleteExpenseDialog';

const expenseCategories = [
  'Medical Supplies',
  'Utilities',
  'Maintenance',
  'Office Supplies',
  'Marketing',
  'Equipment',
  'Insurance',
  'Transportation',
  'Food & Catering',
  'Other'
];

const ExpensesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch expenses data
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Filter expenses by category
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter(exp => exp.category === selectedCategory);
  }, [expenses, selectedCategory]);

  // Calculate expense totals
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [filteredExpenses]);

  const todayExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredExpenses.filter(exp => exp.expense_date === today);
  }, [filteredExpenses]);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return filteredExpenses.filter(exp => {
      const expenseDate = new Date(exp.expense_date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  }, [filteredExpenses]);

  const totalTodayExpenses = useMemo(() => {
    return todayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [todayExpenses]);

  const totalThisMonthExpenses = useMemo(() => {
    return thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [thisMonthExpenses]);

  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      change: 'All time hospital expenses',
      icon: DollarSign,
      variant: 'revenue',
    },
    {
      title: "Today's Expenses",
      value: formatCurrency(totalTodayExpenses),
      change: 'Expenses for today',
      icon: Calendar,
      variant: 'margin',
    },
    {
      title: 'This Month',
      value: formatCurrency(totalThisMonthExpenses),
      change: 'Current month total',
      icon: TrendingUp,
      variant: 'orders',
    },
    {
      title: 'Average Daily',
      value: formatCurrency(totalThisMonthExpenses / Math.max(1, new Date().getDate())),
      change: 'Daily average this month',
      icon: BarChart3,
      variant: 'customers',
    },
  ];

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseDialogOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteExpenseDialogOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
  };

  const hasActiveFilters = selectedCategory !== 'all';

  return (
    <div className="theme-professional-exact min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="welcome-header animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1>Welcome to Expenses Dashboard</h1>
              <p>Shaukat International Hospital - Financial Management</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium text-gray-700">Filter by Category:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-64 h-10 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm hover:shadow-md focus:ring-green-200 focus:ring-offset-2">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 z-50 shadow-lg border border-gray-200 bg-white">
                    <SelectItem value="all" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <Tag className="h-3 w-3 text-gray-600" />
                        </div>
                        <span>All Categories</span>
                      </div>
                    </SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category} className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-50 rounded">
                            <Tag className="h-3 w-3 text-green-600" />
                          </div>
                          <span>{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-10 px-4 border-2 border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.title} 
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
          {/* Recent Expenses - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Recent Expenses</h3>
                <div>
                  <span className="text-sm text-gray-500">Latest expense records</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map((expense, index) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{expense.description}</p>
                      <p className="text-xs text-gray-600">{expense.category}</p>
                          <p className="text-xs text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm mb-2">{formatCurrency(expense.amount)}</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteExpense(expense)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                      </div>
                    </div>
                  ))}
                  {filteredExpenses.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>No expenses found for selected category</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
        {/* Quick Actions */}
            <div className="info-card">
              <h4>Quick Actions</h4>
              <div className="space-y-3">
                <button 
                onClick={() => setAddExpenseDialogOpen(true)}
                  className="btn-primary w-full text-left"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add New Expense
                </button>
                <button 
                  onClick={() => navigate('/expenses/reports')}
                  className="btn-accent w-full text-left"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Monthly Report
                </button>
                <button 
                  onClick={() => navigate('/expenses/analytics')}
                  className="btn-primary w-full text-left"
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Expense Statistics */}
            <div className="info-card">
              <h4>Expense Statistics</h4>
              <div className="metric">
                <span className="metric-label">Total Expenses</span>
                <span className="metric-value text-yellow">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Today's Expenses</span>
                <span className="metric-value text-red">{formatCurrency(totalTodayExpenses)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">This Month</span>
                <span className="metric-value text-blue">{formatCurrency(totalThisMonthExpenses)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total Records</span>
                <span className="metric-value text-green">{filteredExpenses.length}</span>
              </div>
            </div>

            {/* Expense Management */}
            <div className="survey-section">
              <h4 className="survey-title">Expense Management</h4>
              <div className="survey-content">
                <p>Track and manage all hospital expenses including operational costs, equipment purchases, and administrative expenses.</p>
                <br />
                <p>Monitor spending patterns and generate comprehensive financial reports for better budget management.</p>
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
      <AddExpenseDialog 
        open={addExpenseDialogOpen} 
        onOpenChange={setAddExpenseDialogOpen} 
      />

      <EditExpenseDialog
        open={editExpenseDialogOpen}
        onOpenChange={setEditExpenseDialogOpen}
        expense={selectedExpense}
      />

      <DeleteExpenseDialog
        open={deleteExpenseDialogOpen}
        onOpenChange={setDeleteExpenseDialogOpen}
        expense={selectedExpense}
      />
    </div>
  );
};

export default ExpensesDashboard;