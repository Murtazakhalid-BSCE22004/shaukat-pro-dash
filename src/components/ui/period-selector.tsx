import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { ChevronLeft, ChevronRight, X, Check, Calendar as CalendarIcon, Clock, Zap, Sun, BarChart3, Target, FileText } from "lucide-react";
import { format } from "date-fns";

interface PeriodSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  dateRange,
  onDateRangeChange,
  onClose,
  isOpen = false
}) => {
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  const handlePredefinedPeriod = (period: string) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case "Today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case "Yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday);
        start.setHours(0, 0, 0, 0);
        end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
        break;
      case "This week":
        start = new Date(now);
        start.setDate(start.getDate() - now.getDay());
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;
      case "Last week":
        start = new Date(now);
        start.setDate(start.getDate() - now.getDay() - 7);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;
      case "This month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        break;
      case "Last month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "This year":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now);
        break;
      case "Last Year":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }
    
    setLocalDateRange({ from: start, to: end });
  };

  const handleOK = () => {
    onDateRangeChange(localDateRange);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setLocalDateRange(dateRange);
    if (onClose) onClose();
  };

  const formatPeriodDisplay = () => {
    if (!localDateRange?.from || !localDateRange?.to) {
      return "Select period";
    }
    return `${format(localDateRange.from, 'dd MMM yyyy')} - ${format(localDateRange.to, 'dd MMM yyyy')}`;
  };

  const getPeriodButtonVariant = (period: string) => {
    if (!localDateRange?.from || !localDateRange?.to) return "outline";
    
    const now = new Date();
    let isActive = false;
    
    switch (period) {
      case "Today":
        const today = new Date();
        const todayString = today.toDateString();
        const fromString = localDateRange.from.toDateString();
        const toString = localDateRange.to.toDateString();
        isActive = fromString === todayString && toString === todayString;
        break;
      case "Yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        isActive = localDateRange.from.toDateString() === yesterdayString && 
                   localDateRange.to.toDateString() === yesterdayString;
        break;
      case "This week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekStartString = weekStart.toDateString();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekEndString = weekEnd.toDateString();
        isActive = localDateRange.from.toDateString() === weekStartString && 
                   localDateRange.to.toDateString() === weekEndString;
        break;
      case "Last week":
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekStartString = lastWeekStart.toDateString();
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        const lastWeekEndString = lastWeekEnd.toDateString();
        isActive = localDateRange.from.toDateString() === lastWeekStartString && 
                   localDateRange.to.toDateString() === lastWeekEndString;
        break;
      case "This month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStartString = monthStart.toDateString();
        const monthEnd = new Date(now);
        const monthEndString = monthEnd.toDateString();
        isActive = localDateRange.from.toDateString() === monthStartString && 
                   localDateRange.to.toDateString() === monthEndString;
        break;
      case "Last month":
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStartString = lastMonthStart.toDateString();
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthEndString = lastMonthEnd.toDateString();
        isActive = localDateRange.from.toDateString() === lastMonthStartString && 
                   localDateRange.to.toDateString() === lastMonthEndString;
        break;
      case "This year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearStartString = yearStart.toDateString();
        const yearEnd = new Date(now);
        const yearEndString = yearEnd.toDateString();
        isActive = localDateRange.from.toDateString() === yearStartString && 
                   localDateRange.to.toDateString() === yearEndString;
        break;
      case "Last Year":
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearStartString = lastYearStart.toDateString();
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        const lastYearEndString = lastYearEnd.toDateString();
        isActive = localDateRange.from.toDateString() === lastYearStartString && 
                   localDateRange.to.toDateString() === lastYearEndString;
        break;
    }
    
    return isActive ? "default" : "outline";
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "Today": return <Sun className="h-4 w-4" />;
      case "Yesterday": return <CalendarIcon className="h-4 w-4" />;
      case "This week": return <BarChart3 className="h-4 w-4" />;
      case "Last week": return <BarChart3 className="h-4 w-4" />;
      case "This month": return <CalendarIcon className="h-4 w-4" />;
      case "Last month": return <CalendarIcon className="h-4 w-4" />;
      case "This year": return <Target className="h-4 w-4" />;
      case "Last Year": return <FileText className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl border-0">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Select Date Period</h2>
                <p className="text-blue-100 text-sm mt-1">Choose your desired date range for analysis</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 lg:p-5">
          {/* Current Selection Display */}
          <div className="mb-3 lg:mb-4 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-3 rounded-xl font-medium shadow-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold">Selected Period:</span>
              <span className="text-base font-bold">{formatPeriodDisplay()}</span>
            </div>
          </div>

          {/* Main Content Grid - Better responsive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Start Date Calendar */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Start Date</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
              </div>
              <div className="border-2 border-gray-100 rounded-xl p-2 lg:p-3 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar
                  mode="single"
                  selected={localDateRange?.from}
                  onSelect={(date) => setLocalDateRange(prev => ({ ...prev, from: date }))}
                  className="rounded-lg"
                  disabled={(date) => localDateRange?.to && date > localDateRange.to}
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-900 font-bold",
                                         head_cell: "text-gray-600 font-semibold text-xs",
                     caption: "text-gray-900 font-semibold text-sm mb-2",
                     day: "h-8 w-8 text-xs font-medium hover:bg-blue-50 rounded-md transition-colors",
                    nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex mb-1",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                  }}
                />
              </div>
            </div>

            {/* End Date Calendar */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900 mb-2">End Date</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 mx-auto rounded-full"></div>
              </div>
              <div className="border-2 border-gray-100 rounded-xl p-2 lg:p-3 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar
                  mode="single"
                  selected={localDateRange?.to}
                  onSelect={(date) => setLocalDateRange(prev => ({ ...prev, to: date }))}
                  className="rounded-lg"
                  disabled={(date) => localDateRange?.from && date < localDateRange.from}
                  classNames={{
                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-700",
                    day_today: "bg-indigo-100 text-indigo-900 font-bold",
                                         head_cell: "text-gray-600 font-semibold text-xs",
                     caption: "text-gray-900 font-semibold text-sm mb-2",
                     day: "h-8 w-8 text-xs font-medium hover:bg-indigo-50 rounded-md transition-colors",
                    nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex mb-1",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-indigo-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                  }}
                />
              </div>
            </div>

            {/* Quick Select Periods - Improved layout */}
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Quick Select</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Today", icon: "🌅" },
                  { name: "Yesterday", icon: "📅" },
                  { name: "This week", icon: "📊" },
                  { name: "Last week", icon: "📈" },
                  { name: "This month", icon: "🗓️" },
                  { name: "Last month", icon: "📆" },
                  { name: "This year", icon: "🎯" },
                  { name: "Last Year", icon: "📋" }
                ].map((period) => (
                  <Button
                    key={period.name}
                    variant={getPeriodButtonVariant(period.name)}
                    size="sm"
                    className={`h-10 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      getPeriodButtonVariant(period.name) === "default" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg border-0" 
                        : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-sm border border-gray-200 text-gray-700"
                    }`}
                    onClick={() => handlePredefinedPeriod(period.name)}
                  >
                                         <div className="flex flex-col items-center gap-0.5">
                       <span className="text-sm">{period.icon}</span>
                       <span className="text-xs font-medium leading-tight">{period.name}</span>
                     </div>
                  </Button>
                ))}
              </div>
              
              {/* Quick Tips - Improved styling */}
              <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800">Quick Tips</span>
                </div>
                <ul className="text-xs text-blue-700 leading-relaxed space-y-0.5">
                  <li>• Use Quick Select for common periods</li>
                  <li>• Or manually select start and end dates</li>
                  <li>• Changes are applied immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons - Improved spacing */}
          <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleOK} 
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Check className="h-4 w-4" />
              Apply Selection
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all duration-200 rounded-xl"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodSelector;
