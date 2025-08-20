import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  Users, 
  Building2, 
  DollarSign,
  X,
  RefreshCw,
  TrendingUp,
  Clock,
  Search,
  SlidersHorizontal,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardFilters, FilterOption } from '@/types';

interface EnhancedDashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  availableOptions: {
    departments: FilterOption[];
    doctors: FilterOption[];
    expenseCategories: FilterOption[];
    employeeDepartments: FilterOption[];
  };
  isLoading?: boolean;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

const EnhancedDashboardFilters: React.FC<EnhancedDashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  isLoading = false,
  onApplyFilters,
  onResetFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      handleFilterChange('dateRange', { startDate: range.from, endDate: range.to });
    }
  };

  const handleMultiSelectChange = (key: keyof DashboardFilters, value: string, checked: boolean) => {
    const currentValues = localFilters[key] as string[];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    handleFilterChange(key, newValues);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    if (onApplyFilters) {
      onApplyFilters();
    }
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters: DashboardFilters = {
      dateRange: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      },
      departments: [],
      doctors: [],
      expenseCategories: [],
      employeeDepartments: [],
      timePeriod: 'monthly'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  const getActiveFiltersCount = () => {
    return (
      localFilters.departments.length +
      localFilters.doctors.length +
      localFilters.expenseCategories.length +
      localFilters.employeeDepartments.length
    );
  };

  const formatDateRange = () => {
    if (!localFilters.dateRange.startDate || !localFilters.dateRange.endDate) {
      return 'Select date range';
    }
    return `${format(localFilters.dateRange.startDate, 'dd MMM yyyy')} - ${format(localFilters.dateRange.endDate, 'dd MMM yyyy')}`;
  };

  const filteredOptions = (options: FilterOption[]) => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-2 border-2 transition-all duration-200",
              getActiveFiltersCount() > 0
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-gray-300 hover:border-gray-400"
            )}
            disabled={isLoading}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[500px] p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Advanced Dashboard Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
              {/* Search for options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Search Options</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search departments, doctors, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Date Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={localFilters.dateRange.startDate}
                      selected={{
                        from: localFilters.dateRange.startDate,
                        to: localFilters.dateRange.endDate
                      }}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              {/* Time Period Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Time Period</Label>
                </div>
                <Select
                  value={localFilters.timePeriod}
                  onValueChange={(value: any) => handleFilterChange('timePeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Departments Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Departments</Label>
                  <Badge variant="outline" className="text-xs">
                    {localFilters.departments.length} selected
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredOptions(availableOptions.departments).map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${option.value}`}
                        checked={localFilters.departments.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('departments', option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`dept-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                        {option.count && (
                          <span className="text-gray-500 ml-1">({option.count})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Doctors Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Doctors</Label>
                  <Badge variant="outline" className="text-xs">
                    {localFilters.doctors.length} selected
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredOptions(availableOptions.doctors).map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doctor-${option.value}`}
                        checked={localFilters.doctors.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('doctors', option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`doctor-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                        {option.count && (
                          <span className="text-gray-500 ml-1">({option.count})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Expense Categories Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Expense Categories</Label>
                  <Badge variant="outline" className="text-xs">
                    {localFilters.expenseCategories.length} selected
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredOptions(availableOptions.expenseCategories).map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`expense-${option.value}`}
                        checked={localFilters.expenseCategories.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('expenseCategories', option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`expense-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                        {option.count && (
                          <span className="text-gray-500 ml-1">({option.count})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Employee Departments Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">Employee Departments</Label>
                  <Badge variant="outline" className="text-xs">
                    {localFilters.employeeDepartments.length} selected
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredOptions(availableOptions.employeeDepartments).map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`emp-dept-${option.value}`}
                        checked={localFilters.employeeDepartments.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('employeeDepartments', option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`emp-dept-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                        {option.count && (
                          <span className="text-gray-500 ml-1">({option.count})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="px-3"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedDashboardFilters;
