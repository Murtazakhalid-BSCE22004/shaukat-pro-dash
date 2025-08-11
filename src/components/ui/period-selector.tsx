import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { ChevronLeft, ChevronRight, X, Check, Calendar as CalendarIcon, Clock } from "lucide-react";
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

  const handlePredefinedPeriod = (period: string) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case "Today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "Yesterday":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
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

    console.log(`Setting ${period} period:`, { start, end, startString: start.toDateString(), endString: end.toDateString() });
    
    // Additional debugging for This week
    if (period === "This week") {
      console.log('This week calculation details:', {
        now: now.toDateString(),
        nowDay: now.getDay(),
        startDate: start.toDateString(),
        endDate: end.toDateString(),
        startISO: start.toISOString(),
        endISO: end.toISOString()
      });
    }
    
    // Additional debugging for Today
    if (period === "Today") {
      console.log('Today calculation details:', {
        now: now.toDateString(),
        startDate: start.toDateString(),
        endDate: end.toDateString(),
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        startTime: start.getTime(),
        endTime: end.getTime(),
        areSame: start.getTime() === end.getTime()
      });
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
        // Check if both dates are exactly today (same day)
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
        // Check if it's exactly the current week (Sunday to Saturday)
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
        // Check if it's exactly the previous week
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-[1000px] max-w-[95vw] max-h-[95vh] overflow-hidden shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Select Date Period</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Choose your desired date range for analysis</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Current Selection Display */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">Selected Period:</span>
              <span className="text-base">{formatPeriodDisplay()}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Start Date Calendar */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Date</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <Calendar
                  mode="single"
                  selected={localDateRange?.from}
                  onSelect={(date) => setLocalDateRange(prev => ({ ...prev, from: date }))}
                  className="rounded-lg"
                  disabled={(date) => localDateRange?.to && date > localDateRange.to}
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-900 font-bold",
                    head_cell: "text-gray-600 font-semibold",
                    caption: "text-gray-900 font-semibold text-lg"
                  }}
                />
              </div>
            </div>

            {/* End Date Calendar */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">End Date</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 mx-auto rounded-full"></div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <Calendar
                  mode="single"
                  selected={localDateRange?.to}
                  onSelect={(date) => setLocalDateRange(prev => ({ ...prev, to: date }))}
                  className="rounded-lg"
                  disabled={(date) => localDateRange?.from && date < localDateRange.from}
                  classNames={{
                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-700",
                    day_today: "bg-indigo-100 text-indigo-900 font-bold",
                    head_cell: "text-gray-600 font-semibold",
                    caption: "text-gray-900 font-semibold text-lg"
                  }}
                />
              </div>
            </div>

            {/* Predefined Periods */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Select</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Today",
                  "Yesterday", 
                  "This week",
                  "Last week",
                  "This month",
                  "Last month",
                  "This year",
                  "Last Year"
                ].map((period) => (
                  <Button
                    key={period}
                    variant={getPeriodButtonVariant(period)}
                    size="sm"
                    className={`h-11 text-sm font-medium transition-all duration-300 hover:scale-102 ${
                      getPeriodButtonVariant(period) === "default" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border-0" 
                        : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md border-2 border-gray-200 text-gray-700"
                    }`}
                    onClick={() => handlePredefinedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <Button 
              onClick={handleOK} 
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Check className="h-5 w-5" />
              Apply Selection
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              <X className="h-5 w-5" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodSelector;
