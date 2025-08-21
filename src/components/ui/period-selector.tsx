import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Check, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface PeriodSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  dateRange,
  onDateRangeChange,
  open,
  onOpenChange
}) => {
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange);

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
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalDateRange(dateRange);
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            Select Date Period
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Period Display */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Selected Period:</span>
              <span className="font-semibold">{formatPeriodDisplay()}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Calendars Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Select Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date Calendar */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <Calendar
                      mode="single"
                      selected={localDateRange?.from}
                      onSelect={(date) => setLocalDateRange(prev => ({ ...prev, from: date }))}
                      disabled={(date) => localDateRange?.to && date > localDateRange.to}
                      classNames={{
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                        day_today: "bg-blue-100 text-blue-900 font-bold border border-blue-300",
                        head_cell: "text-gray-600 font-medium text-xs",
                        caption: "text-gray-900 font-medium text-sm mb-2",
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
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <Calendar
                      mode="single"
                      selected={localDateRange?.to}
                      onSelect={(date) => setLocalDateRange(prev => ({ ...prev, to: date }))}
                      disabled={(date) => localDateRange?.from && date < localDateRange.from}
                      classNames={{
                        day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-700",
                        day_today: "bg-indigo-100 text-indigo-900 font-bold border border-indigo-300",
                        head_cell: "text-gray-600 font-medium text-xs",
                        caption: "text-gray-900 font-medium text-sm mb-2",
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
              </div>
            </div>

            {/* Quick Select Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Select</h3>
              
              {/* Quick Select Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Today", color: "bg-yellow-500 hover:bg-yellow-600" },
                  { name: "Yesterday", color: "bg-blue-500 hover:bg-blue-600" },
                  { name: "This week", color: "bg-purple-500 hover:bg-purple-600" },
                  { name: "Last week", color: "bg-indigo-500 hover:bg-indigo-600" },
                  { name: "This month", color: "bg-green-500 hover:bg-green-600" },
                  { name: "Last month", color: "bg-teal-500 hover:bg-teal-600" },
                  { name: "This year", color: "bg-red-500 hover:bg-red-600" },
                  { name: "Last Year", color: "bg-gray-500 hover:bg-gray-600" }
                ].map((period) => (
                  <Button
                    key={period.name}
                    variant={getPeriodButtonVariant(period.name)}
                    size="sm"
                    className={`h-12 text-sm font-medium transition-all duration-200 rounded-lg ${
                      getPeriodButtonVariant(period.name) === "default" 
                        ? `${period.color} text-white border-0 shadow-sm` 
                        : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:shadow-sm"
                    }`}
                    onClick={() => handlePredefinedPeriod(period.name)}
                  >
                    {period.name}
                  </Button>
                ))}
              </div>
              
              {/* Quick Tips Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Quick Tips</h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Use Quick Select for common periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Or manually select start and end dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Changes are applied immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="px-6 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleOK} 
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out border-0"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodSelector;
