import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface EnhancedDateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const predefinedPeriods = [
  { label: "Today", getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Yesterday", getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "This week", getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
  { label: "Last week", getRange: () => ({ from: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), to: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }) }) },
  { label: "This month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last month", getRange: () => ({ from: startOfMonth(subDays(new Date(), 30)), to: endOfMonth(subDays(new Date(), 30)) }) },
  { label: "This year", getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: "Last Year", getRange: () => ({ from: startOfYear(subDays(new Date(), 365)), to: endOfYear(subDays(new Date(), 365)) }) },
];

export function EnhancedDateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  placeholder = "Select date range"
}: EnhancedDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const handlePredefinedPeriod = (period: typeof predefinedPeriods[0]) => {
    const range = period.getRange();
    onDateRangeChange(range);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "dd-MMM-yy");
    return `${format(range.from, "dd-MMM-yy")} - ${format(range.to, "dd-MMM-yy")}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Period</Label>
              <div className="grid grid-cols-2 gap-2">
                {predefinedPeriods.map((period) => (
                  <Button
                    key={period.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedPeriod(period)}
                    className="text-xs h-8"
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Start</Label>
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => {
                    if (date) {
                      const newRange = { from: date, to: dateRange?.to };
                      onDateRangeChange(newRange);
                    }
                  }}
                  initialFocus
                  className="w-full"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">End</Label>
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(date) => {
                    if (date) {
                      const newRange = { from: dateRange?.from, to: date };
                      onDateRangeChange(newRange);
                    }
                  }}
                  initialFocus
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-red-600 hover:text-red-700"
              >
                ✕ Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (dateRange?.from && dateRange?.to) {
                    setIsOpen(false);
                  }
                }}
                disabled={!dateRange?.from || !dateRange?.to}
                className="bg-green-600 hover:bg-green-700"
              >
                ✔ OK
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
