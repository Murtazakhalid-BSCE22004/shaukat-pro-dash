import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Plus,
  Stethoscope,
  FlaskConical,
  Pill,
  Coffee,
  Calculator,
  Phone,
  Bed,
  HeartPulse,
  Zap,
  UserCheck,
  X,
  Shield,
  Crown,
  Activity,
  RotateCcw,
  Skull
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/utils/currency';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee, HospitalPositions } from '@/types';
import AddEmployeeDialog from '@/components/ui/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/ui/EditEmployeeDialog';
import DeleteEmployeeDialog from '@/components/ui/DeleteEmployeeDialog';
import ActivateEmployeeDialog from '@/components/ui/ActivateEmployeeDialog';
import PermanentDeleteEmployeeDialog from '@/components/ui/PermanentDeleteEmployeeDialog';

const AllEmployees: React.FC = () => {
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);
  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [activateEmployeeDialogOpen, setActivateEmployeeDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'hire_date' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch all employees
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: supabaseEmployeesService.getAllEmployees,
  });

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = allEmployees.filter(emp => {
      const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.cnic?.includes(searchTerm) ||
                          emp.contact_number?.includes(searchTerm);
      
      const matchesPosition = !positionFilter || positionFilter === 'all' || emp.position === positionFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && emp.is_active) ||
                          (statusFilter === 'inactive' && !emp.is_active);
      
      return matchesSearch && matchesPosition && matchesStatus;
    });

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'salary':
          aValue = a.salary || 0;
          bValue = b.salary || 0;
          break;
        case 'hire_date':
          aValue = new Date(a.hire_date || '').getTime();
          bValue = new Date(b.hire_date || '').getTime();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allEmployees, searchTerm, positionFilter, statusFilter, sortBy, sortOrder]);

  // Hospital position categories for filter
  const hospitalPositions: HospitalPositions[] = [
    'laboratory technician',
    'laboratory engineer', 
    'pharmacy attendant',
    'steward',
    'accountant',
    'receptionist',
    'ward',
    'OT',
    'doctor attendant',
    'xray',
    'internee',
    'general',
    'manager',
    'nurse',
    'electrician',
    'LHV'
  ];

  // Format position names for display
  const formatPositionName = (position: string) => {
    return position
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get icon for each position
  const getPositionIcon = (position: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'laboratory technician': FlaskConical,
      'laboratory engineer': FlaskConical,
      'pharmacy attendant': Pill,
      'steward': Coffee,
      'accountant': Calculator,
      'receptionist': Phone,
      'ward': Bed,
      'OT': HeartPulse,
      'doctor attendant': UserCheck,
      'xray': Activity,
      'internee': Users,
      'general': Users,
      'manager': Crown,
      'nurse': Stethoscope,
      'electrician': Zap,
      'LHV': Shield
    };
    
    const IconComponent = iconMap[position] || Users;
    return <IconComponent className="h-4 w-4 mr-2 text-purple-600" />;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    if (status === 'active') return <UserCheck className="h-4 w-4 mr-2 text-green-600" />;
    if (status === 'inactive') return <X className="h-4 w-4 mr-2 text-red-600" />;
    return <Filter className="h-4 w-4 mr-2 text-gray-600" />;
  };

  // Employee action handlers
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteEmployeeDialogOpen(true);
  };

  const handleActivateEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActivateEmployeeDialogOpen(true);
  };

  const handlePermanentDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPermanentDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPositionFilter('all');
    setStatusFilter('all');
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-50 transition-colors duration-200">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-50 transition-colors duration-200">
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Employees</h1>
          <p className="text-gray-600">Complete employee directory with search and filtering</p>
        </div>
        <Button 
          onClick={() => setAddEmployeeDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search & Filter Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 transition-all duration-300 group-hover:text-purple-600 group-hover:scale-110" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-purple-400 hover:bg-purple-25 hover:shadow-md hover:shadow-purple-100 hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
              />
            </div>
            
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-purple-200 bg-gradient-to-b from-white to-purple-25 shadow-xl backdrop-blur-sm">
                <SelectItem value="all" className="relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 focus:bg-gradient-to-r focus:from-purple-50 focus:to-purple-100 transition-all duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group">
                  <Filter className="h-4 w-4 mr-3 text-purple-600 group-hover:text-purple-700 transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-purple-800">All Positions</span>
                </SelectItem>
                {hospitalPositions.map(position => (
                  <SelectItem key={position} value={position} className="relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 focus:bg-gradient-to-r focus:from-purple-50 focus:to-purple-100 transition-all duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group">
                    {getPositionIcon(position)}
                    <span className="font-medium text-gray-700 group-hover:text-purple-800">{formatPositionName(position)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-purple-200 bg-gradient-to-b from-white to-purple-25 shadow-xl backdrop-blur-sm">
                <SelectItem value="all" className="relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 focus:bg-gradient-to-r focus:from-purple-50 focus:to-purple-100 transition-all duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group">
                  {getStatusIcon('all')}
                  <span className="font-medium text-gray-700 group-hover:text-purple-800">All Status</span>
                </SelectItem>
                <SelectItem value="active" className="relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 focus:bg-gradient-to-r focus:from-green-50 focus:to-green-100 transition-all duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group">
                  {getStatusIcon('active')}
                  <span className="font-medium text-gray-700 group-hover:text-green-800">Active</span>
                </SelectItem>
                <SelectItem value="inactive" className="relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-4 pr-2 text-sm outline-none hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 focus:bg-gradient-to-r focus:from-red-50 focus:to-red-100 transition-all duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group">
                  {getStatusIcon('inactive')}
                  <span className="font-medium text-gray-700 group-hover:text-red-800">Inactive</span>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || (positionFilter && positionFilter !== 'all') || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-500 hover:text-orange-700 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedEmployees.length} of {allEmployees.length} employees
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
              >
                Name {getSortIcon('name')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('salary')}
                className="flex items-center gap-1 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
              >
                Salary {getSortIcon('salary')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('hire_date')}
                className="flex items-center gap-1 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
              >
                Hire Date {getSortIcon('hire_date')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Employee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${employee.is_active ? 'bg-green-100 hover:bg-green-50' : 'bg-red-100 hover:bg-red-50'}`}>
                    <Users className={`h-4 w-4 transition-colors duration-200 ${employee.is_active ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      {getStatusBadge(employee.is_active)}
                    </div>
                                            <p className="text-sm text-gray-600">
                          {formatPositionName(employee.position)} • {employee.department}
                        </p>
                    <p className="text-xs text-gray-500">
                      Age: {employee.age} • CNIC: {employee.cnic} • Contact: {employee.contact_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hired: {new Date(employee.hire_date).toLocaleDateString()} • Address: {employee.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 mb-2">{formatCurrency(employee.salary)}/month</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                    
                    {employee.is_active ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                        onClick={() => handleDeleteEmployee(employee)}
                        title="Deactivate Employee"
                      >
                        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                          onClick={() => handleActivateEmployee(employee)}
                          title="Activate Employee"
                        >
                          <RotateCcw className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 hover:text-red-800 hover:border-red-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                          onClick={() => handlePermanentDeleteEmployee(employee)}
                          title="Permanent Delete Employee"
                        >
                          <Skull className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredAndSortedEmployees.length === 0 && (
              <div className="text-center py-8">
                {allEmployees.length === 0 ? (
                  <div>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No employees recorded yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Employee" to get started.</p>
                  </div>
                ) : (
                  <div>
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No employees match your search criteria.</p>
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <AddEmployeeDialog 
        open={addEmployeeDialogOpen} 
        onOpenChange={setAddEmployeeDialogOpen} 
      />
      
      <EditEmployeeDialog 
        open={editEmployeeDialogOpen} 
        onOpenChange={setEditEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <DeleteEmployeeDialog 
        open={deleteEmployeeDialogOpen} 
        onOpenChange={setDeleteEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <ActivateEmployeeDialog 
        open={activateEmployeeDialogOpen} 
        onOpenChange={setActivateEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <PermanentDeleteEmployeeDialog 
        open={permanentDeleteDialogOpen} 
        onOpenChange={setPermanentDeleteDialogOpen} 
        employee={selectedEmployee}
      />
    </div>
  );
};

export default AllEmployees;
