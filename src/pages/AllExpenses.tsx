import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  FileText,
  Calendar,
  ArrowRight,
  Edit,
  Trash2,
  Filter,
  X,
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/utils/currency';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Expense } from '@/types';
import AddExpenseDialog from '@/components/ui/AddExpenseDialog';
import EditExpenseDialog from '@/components/ui/EditExpenseDialog';
import DeleteExpenseDialog from '@/components/ui/DeleteExpenseDialog';
import { EnhancedDateRangePicker } from '@/components/ui/enhanced-date-range-picker';
import PeriodSelector from '@/components/ui/period-selector';

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

const expenseStatuses = [
  'approved'
];

const AllExpenses: React.FC = () => {
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false);
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);

  // Fetch expenses data
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: supabaseExpensesService.getAllExpenses,
  });

  // Helper function to get date strings from DateRange
  const getDateStrings = () => {
    if (!dateRange?.from || !dateRange?.to) {
      const today = new Date();
      return {
        startDate: today.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10)
      };
    }
    
    const start = dateRange.from;
    const end = dateRange.to;
    
    // If it's the same day, ensure we cover the full 24 hours
    if (start.toDateString() === end.toDateString()) {
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      return {
        startDate: dateString,
        endDate: dateString
      };
    }
    
    // For different days, construct date strings directly
    const startYear = start.getFullYear();
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDay = String(start.getDate()).padStart(2, '0');
    const startDateString = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');
    const endDateString = `${endYear}-${endMonth}-${endDay}`;
    
    return {
      startDate: startDateString,
      endDate: endDateString
    };
  };

  // Filter expenses based on selected filters
  const expenses = useMemo(() => {
    const { startDate, endDate } = getDateStrings();
    
    return allExpenses.filter(expense => {
      // Date filter
      const expenseDate = expense.expense_date;
      if (expenseDate < startDate || expenseDate > endDate) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== "all" && expense.category !== selectedCategory) {
        return false;
      }
      
      
      
      return true;
    });
  }, [allExpenses, dateRange, selectedCategory]);

  // Calculate expense totals
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  // Calculate all time total
  const allTimeTotal = useMemo(() => {
    if (!allExpenses) return 0;
    return allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [allExpenses]);



  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseDialogOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteExpenseDialogOpen(true);
  };

  const clearFilters = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setSelectedCategory("all");
        
  };

  const hasActiveFilters = selectedCategory !== "all";

  // Period display function (similar to RevenueDashboard)
  const getPeriodDisplayText = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select date range';
    
    const from = dateRange.from;
    const to = dateRange.to;
    const today = new Date();
    
    // Check if it's Today
    const todayString = today.toDateString();
    if (from.toDateString() === todayString && to.toDateString() === todayString) {
      return "Today";
    }
    
    // Check if it's Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    if (from.toDateString() === yesterdayString && to.toDateString() === yesterdayString) {
      return "Yesterday";
    }
    
    // Check if it's This week (Sunday to Saturday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartString = weekStart.toDateString();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndString = weekEnd.toDateString();
    if (from.toDateString() === weekStartString && to.toDateString() === weekEndString) {
      return "This Week";
    }
    
    // Check if it's Last week
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
    const lastWeekStartString = lastWeekStart.toDateString();
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    const lastWeekEndString = lastWeekEnd.toDateString();
    if (from.toDateString() === lastWeekStartString && to.toDateString() === lastWeekEndString) {
      return "Last Week";
    }
    
    // Check if it's This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartString = monthStart.toDateString();
    const monthEnd = new Date(today);
    const monthEndString = monthEnd.toDateString();
    if (from.toDateString() === monthStartString && to.toDateString() === monthEndString) {
      return "This Month";
    }
    
    // Check if it's Last month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthStartString = lastMonthStart.toDateString();
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthEndString = lastMonthEnd.toDateString();
    if (from.toDateString() === lastMonthStartString && to.toDateString() === lastMonthEndString) {
      return "Last Month";
    }
    
    // Check if it's This year
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearStartString = yearStart.toDateString();
    const yearEnd = new Date(today);
    const yearEndString = yearEnd.toDateString();
    if (from.toDateString() === yearStartString && to.toDateString() === yearEndString) {
      return "This Year";
    }
    
    // Check if it's Last Year
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearStartString = lastYearStart.toDateString();
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
    const lastYearEndString = lastYearEnd.toDateString();
    if (from.toDateString() === lastYearStartString && to.toDateString() === lastYearEndString) {
      return "Last Year";
    }
    
    // For custom ranges, show a shorter format
    return `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  };

  // Calculate period-specific label (must be after getPeriodDisplayText function)
  const periodLabel = useMemo(() => {
    return getPeriodDisplayText();
  }, [dateRange]);

  return (
    <div className="space-y-6">


      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">All Expenses</CardTitle>
              <p className="text-sm text-green-600 mt-1 font-medium">
                Showing {expenses.length} expenses • Total: {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setAddExpenseDialogOpen(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <DollarSign className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Filter className="h-5 w-5 text-green-600" />
            Filters & Period Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Period Selector */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Period</Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => setIsPeriodSelectorOpen(true)}
              >
                <Calendar className="h-4 w-4 text-green-600 mr-2" />
                {getPeriodDisplayText()}
              </Button>
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm hover:shadow-md">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-50 shadow-lg border border-gray-200">
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
            </div>



            {/* Clear Filters */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 opacity-0">
                Actions
              </Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full h-12 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Active filters:</span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Category: {selectedCategory}
                  </Badge>
                )}

              </div>
            </div>
          )}
        </CardContent>
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
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <span className="sr-only">Edit expense</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteExpense(expense)}
                        >
                          <span className="sr-only">Delete expense</span>
                          <Trash2 className="h-4 w-4" />
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
                {allExpenses.length === 0 ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                    <p className="text-gray-600 mb-6">
                      Get started by adding your first expense to track hospital spending.
                    </p>
                    <Button onClick={() => setAddExpenseDialogOpen(true)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses match your filters</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your date range, category, or status filters to see more expenses.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {expenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
                <div className="text-sm text-gray-600">Filtered Expenses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalExpenses)}</div>
                <div className="text-sm text-gray-600">{periodLabel}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(allTimeTotal)}</div>
                <div className="text-sm text-gray-600">All Time Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Period Selector Modal */}
      <PeriodSelector
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        open={isPeriodSelectorOpen}
        onOpenChange={setIsPeriodSelectorOpen}
      />
    </div>
  );
};

export default AllExpenses;
