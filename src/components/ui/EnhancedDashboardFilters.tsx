import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { DashboardFilters } from '@/types';

interface FilterOption {
  departments: string[];
  doctors: string[];
  expenseCategories: string[];
  employeeDepartments: string[];
}

interface EnhancedDashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  availableOptions: FilterOption;
  isLoading: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const EnhancedDashboardFilters: React.FC<EnhancedDashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  isLoading,
  onApplyFilters,
  onResetFilters,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Dashboard Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Period: {filters.timePeriod} | 
              Departments: {filters.departments.length || 'All'} | 
              Doctors: {filters.doctors.length || 'All'}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={onApplyFilters}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardFilters;