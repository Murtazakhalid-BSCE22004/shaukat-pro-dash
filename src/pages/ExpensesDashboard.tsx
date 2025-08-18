import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Plus,
  FileText,
  Calendar,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Expense } from '@/types';
import AddExpenseDialog from '@/components/ui/AddExpenseDialog';
import EditExpenseDialog from '@/components/ui/EditExpenseDialog';
import DeleteExpenseDialog from '@/components/ui/DeleteExpenseDialog';

const ExpensesDashboard: React.FC = () => {
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseDialogOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteExpenseDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-green-700">Welcome to Shaukat International Hospital</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Expenses Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Expenses */}
            <Card>
              <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {expenses.slice(0, 4).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  {expenses.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">No expenses recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>

        {/* Quick Actions */}
            <Card>
              <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <Button 
                onClick={() => setAddExpenseDialogOpen(true)}
                className="w-full justify-start text-left h-auto py-3 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-3 text-white" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Add Expense</span>
                  <span className="text-xs opacity-80">Record a new expense</span>
                </div>
                  </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto py-3 hover:bg-green-50 hover:border-green-300"
              >
                <Calendar className="h-4 w-4 mr-3 text-green-600" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Monthly Report</span>
                  <span className="text-xs opacity-80">Generate expense summary</span>
                </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={addExpenseDialogOpen} 
        onOpenChange={setAddExpenseDialogOpen} 
      />

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        open={editExpenseDialogOpen}
        onOpenChange={setEditExpenseDialogOpen}
        expense={selectedExpense}
      />

      {/* Delete Expense Dialog */}
      <DeleteExpenseDialog
        open={deleteExpenseDialogOpen}
        onOpenChange={setDeleteExpenseDialogOpen}
        expense={selectedExpense}
      />
    </div>
  );
};

export default ExpensesDashboard;