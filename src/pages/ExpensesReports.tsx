import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileSpreadsheet, 
  Calendar,
  Printer,
  Download,
  Filter,
  Tag,
  CheckCircle,
  Clock,
  XCircle
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
import PeriodSelector from '@/components/ui/period-selector';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear 
} from 'date-fns';

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

const ExpensesReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    return {
      startDate: dateRange.from.toISOString().slice(0, 10),
      endDate: dateRange.to.toISOString().slice(0, 10)
    };
  };

  // Filter expenses based on date range, category, and status
  const filteredExpenses = useMemo(() => {
    let filtered = allExpenses;

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      const { startDate, endDate } = getDateStrings();
      filtered = filtered.filter(expense => {
        const expenseDate = expense.expense_date;
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }



    return filtered;
  }, [allExpenses, dateRange, selectedCategory]);

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [filteredExpenses]);

  const allTimeTotal = useMemo(() => {
    if (!allExpenses) return 0;
    return allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [allExpenses]);

  // Helper functions for period calculations
  const calculatePeriodRange = (period: string): DateRange | undefined => {
    const today = new Date();
    
    switch (period) {
      case 'today':
        return { from: startOfDay(today), to: endOfDay(today) };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case 'this-week':
        return { from: startOfWeek(today), to: endOfWeek(today) };
      case 'last-week':
        const lastWeekStart = subDays(startOfWeek(today), 7);
        const lastWeekEnd = subDays(endOfWeek(today), 7);
        return { from: lastWeekStart, to: lastWeekEnd };
      case 'this-month':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'last-month':
        const lastMonth = subDays(startOfMonth(today), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case 'this-year':
        return { from: startOfYear(today), to: endOfYear(today) };
      case 'last-year':
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
      default:
        return undefined;
    }
  };

  const handlePeriodChange = (period: string) => {
    const range = calculatePeriodRange(period);
    setDateRange(range);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedCategory('all');

  };

  const hasActiveFilters = selectedCategory !== 'all' || (dateRange?.from && dateRange?.to);

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
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (from.toDateString() === weekStart.toDateString() && to.toDateString() === weekEnd.toDateString()) {
      return "This Week";
    }
    
    // Check if it's Last week
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    if (from.toDateString() === lastWeekStart.toDateString() && to.toDateString() === lastWeekEnd.toDateString()) {
      return "Last Week";
    }
    
    // Check if it's This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (from.toDateString() === monthStart.toDateString() && to.toDateString() === monthEnd.toDateString()) {
      return "This Month";
    }
    
    // Check if it's Last month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    if (from.toDateString() === lastMonthStart.toDateString() && to.toDateString() === lastMonthEnd.toDateString()) {
      return "Last Month";
    }
    
    // Check if it's This year
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    if (from.toDateString() === yearStart.toDateString() && to.toDateString() === yearEnd.toDateString()) {
      return "This Year";
    }
    
    // Check if it's Last year
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
    if (from.toDateString() === lastYearStart.toDateString() && to.toDateString() === lastYearEnd.toDateString()) {
      return "Last Year";
    }
    
    // For custom ranges, show a shorter format
    return `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  };

  // Calculate period-specific label (must be after getPeriodDisplayText function)
  const periodLabel = useMemo(() => {
    return getPeriodDisplayText();
  }, [dateRange]);

  const getStatusBadge = (status: string) => {
    return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
  };

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Date', 'Category', 'Description', 'Amount (PKR)', 'Status', 'Paid By', 'Received By'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.expense_date,
        expense.category,
        `"${expense.description?.replace(/"/g, '""') || ''}"`,
        expense.amount,
        expense.status,
        `"${expense.paid_by?.replace(/"/g, '""') || ''}"`,
        `"${expense.received_by?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-report-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Expenses Report
              </CardTitle>
              <p className="text-sm text-green-600 mt-1 font-medium">
                {filteredExpenses.length} expenses • Total: {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handlePrint}
                variant="outline" 
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button 
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Filter className="h-5 w-5 text-green-600" />
            Report Filters
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
              <Label className="text-sm font-medium text-gray-700 mb-2">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm hover:shadow-md focus:ring-green-200 focus:ring-offset-2">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-50 shadow-lg border border-gray-200 bg-white">
                  <SelectItem value="all" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3">All Categories</SelectItem>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category} className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            {/* Clear Filters */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 opacity-0">Actions</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full h-12 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Filter className="h-4 w-4" />
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

      {/* Excel-like Table */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg font-semibold">
            Expense Report - {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Amount (PKR)</th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Paid By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Received By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense, index) => (
                    <tr key={expense.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {new Date(expense.expense_date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {expense.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 max-w-xs truncate">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 text-right border-r border-gray-200">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {expense.paid_by || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.received_by || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Total ({filteredExpenses.length} expenses)
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right border-r border-gray-200">
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td colSpan={3} className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600 mb-6">
                No expenses match your current filter criteria. Try adjusting your filters to see results.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {filteredExpenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</div>
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

export default ExpensesReports;
