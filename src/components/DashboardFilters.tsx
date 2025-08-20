import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Calendar, 
  Users, 
  Stethoscope, 
  DollarSign, 
  Building2,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useDashboardFilters } from '@/contexts/DashboardFilterContext';
import { FilterOption } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  className?: string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ className }) => {
  const { state, updateFilters, resetFilters } = useDashboardFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (state.filters.departments.length > 0) count++;
    if (state.filters.doctors.length > 0) count++;
    if (state.filters.expenseCategories.length > 0) count++;
    if (state.filters.employeeDepartments.length > 0) count++;
    setActiveFilters(count);
  }, [state.filters]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    updateFilters({ dateRange: { startDate, endDate } });
  };

  const handleTimePeriodChange = (period: string) => {
    updateFilters({ timePeriod: period as any });
  };

  const handleDepartmentChange = (department: string, checked: boolean) => {
    const current = state.filters.departments;
    const updated = checked 
      ? [...current, department]
      : current.filter(d => d !== department);
    updateFilters({ departments: updated });
  };

  const handleDoctorChange = (doctor: string, checked: boolean) => {
    const current = state.filters.doctors;
    const updated = checked 
      ? [...current, doctor]
      : current.filter(d => d !== doctor);
    updateFilters({ doctors: updated });
  };

  const handleExpenseCategoryChange = (category: string, checked: boolean) => {
    const current = state.filters.expenseCategories;
    const updated = checked 
      ? [...current, category]
      : current.filter(c => c !== category);
    updateFilters({ expenseCategories: updated });
  };

  const handleEmployeeDepartmentChange = (department: string, checked: boolean) => {
    const current = state.filters.employeeDepartments;
    const updated = checked 
      ? [...current, department]
      : current.filter(d => d !== department);
    updateFilters({ employeeDepartments: updated });
  };

  const clearAllFilters = () => {
    resetFilters();
  };

  const formatDateRange = () => {
    const start = state.filters.dateRange.startDate.toLocaleDateString();
    const end = state.filters.dateRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Dashboard Filters</CardTitle>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {activeFilters} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Date Range</Label>
                  </div>
                  <DateRangePicker
                    startDate={state.filters.dateRange.startDate}
                    endDate={state.filters.dateRange.endDate}
                    onDateRangeChange={handleDateRangeChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {formatDateRange()}
                  </p>
                </div>

                {/* Time Period Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Time Period</Label>
                  </div>
                  <Select
                    value={state.filters.timePeriod}
                    onValueChange={handleTimePeriodChange}
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

                {/* Department Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Medical Departments</Label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.availableOptions.departments.map((dept) => (
                      <div key={dept.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept.value}`}
                          checked={state.filters.departments.includes(dept.value)}
                          onCheckedChange={(checked) => 
                            handleDepartmentChange(dept.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`dept-${dept.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {dept.label}
                          {dept.count && (
                            <span className="text-gray-500 ml-1">({dept.count})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Doctors</Label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.availableOptions.doctors.map((doctor) => (
                      <div key={doctor.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`doctor-${doctor.value}`}
                          checked={state.filters.doctors.includes(doctor.value)}
                          onCheckedChange={(checked) => 
                            handleDoctorChange(doctor.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`doctor-${doctor.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {doctor.label}
                          {doctor.count && (
                            <span className="text-gray-500 ml-1">({doctor.count})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Categories Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Expense Categories</Label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.availableOptions.expenseCategories.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`expense-${category.value}`}
                          checked={state.filters.expenseCategories.includes(category.value)}
                          onCheckedChange={(checked) => 
                            handleExpenseCategoryChange(category.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`expense-${category.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category.label}
                          {category.count && (
                            <span className="text-gray-500 ml-1">({category.count})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee Departments Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Employee Departments</Label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.availableOptions.employeeDepartments.map((dept) => (
                      <div key={dept.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`emp-dept-${dept.value}`}
                          checked={state.filters.employeeDepartments.includes(dept.value)}
                          onCheckedChange={(checked) => 
                            handleEmployeeDepartmentChange(dept.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`emp-dept-${dept.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {dept.label}
                          {dept.count && (
                            <span className="text-gray-500 ml-1">({dept.count})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFilters > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.filters.departments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="bg-blue-100 text-blue-700">
                        Dept: {dept}
                        <button
                          onClick={() => handleDepartmentChange(dept, false)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {state.filters.doctors.map((doctor) => (
                      <Badge key={doctor} variant="secondary" className="bg-green-100 text-green-700">
                        Dr: {doctor}
                        <button
                          onClick={() => handleDoctorChange(doctor, false)}
                          className="ml-1 hover:text-green-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {state.filters.expenseCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="bg-red-100 text-red-700">
                        Expense: {category}
                        <button
                          onClick={() => handleExpenseCategoryChange(category, false)}
                          className="ml-1 hover:text-red-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {state.filters.employeeDepartments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="bg-purple-100 text-purple-700">
                        Emp: {dept}
                        <button
                          onClick={() => handleEmployeeDepartmentChange(dept, false)}
                          className="ml-1 hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default DashboardFilters;

