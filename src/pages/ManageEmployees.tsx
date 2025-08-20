import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Edit,
  Trash2,
  XCircle,
  Search,
  Settings,
  Wallet,
  Plus,
  Filter,
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
  Shield,
  Crown,
  Activity,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import PermanentDeleteEmployeeDialog from '@/components/ui/PermanentDeleteEmployeeDialog';
import ActivateEmployeeDialog from '@/components/ui/ActivateEmployeeDialog';
import PayEmployeeDialog from '@/components/ui/PayEmployeeDialog';

const ManageEmployees: React.FC = () => {
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);
  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [permanentDeleteEmployeeDialogOpen, setPermanentDeleteEmployeeDialogOpen] = useState(false);
  const [activateEmployeeDialogOpen, setActivateEmployeeDialogOpen] = useState(false);
  const [payEmployeeDialogOpen, setPayEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  // Fetch all employees
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: supabaseEmployeesService.getAllEmployees,
  });

  // Filter all employees for management (both active and inactive)
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp => {
      const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.cnic?.includes(searchTerm) ||
                          emp.contact_number?.includes(searchTerm);
      
      const matchesPosition = !positionFilter || positionFilter === 'all' || emp.position === positionFilter;
      
      return matchesSearch && matchesPosition;
    });
  }, [allEmployees, searchTerm, positionFilter]);

  // Separate active employees for payment management
  const activeEmployees = filteredEmployees.filter(emp => emp.is_active);
  const inactiveEmployees = filteredEmployees.filter(emp => !emp.is_active);

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

  // Employee action handlers
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteEmployeeDialogOpen(true);
  };

  const handlePermanentDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPermanentDeleteEmployeeDialogOpen(true);
  };

  const handlePayEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPayEmployeeDialogOpen(true);
  };

  const handleActivateEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActivateEmployeeDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPositionFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Employees</h1>
          <p className="text-gray-600">Employee management and payment processing</p>
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
          <CardTitle className="text-lg font-semibold">Filter Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            {(searchTerm || (positionFilter && positionFilter !== 'all')) && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="text-purple-600 border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-500 hover:text-purple-700 hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {activeEmployees.length} active and {inactiveEmployees.length} inactive employees
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Active Employee Management & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{employee.name}</h3>
                                            <p className="text-gray-600">{formatPositionName(employee.position)} • {employee.department}</p>
                    <p className="text-sm text-gray-500">
                      Monthly Salary: <span className="font-medium text-purple-600">{formatCurrency(employee.salary)}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      CNIC: {employee.cnic} • Contact: {employee.contact_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      Age: {employee.age} • Hired: {new Date(employee.hire_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => handlePayEmployee(employee)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
                  >
                    <Wallet className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    Pay Employee
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handleDeleteEmployee(employee)}
                      title="Deactivate Employee"
                    >
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-red-900 text-white border border-red-900 hover:bg-red-800 hover:text-white hover:border-red-800 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handlePermanentDeleteEmployee(employee)}
                      title="Permanently Delete Employee"
                    >
                      <XCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {activeEmployees.length === 0 && (
              <div className="text-center py-8">
                {allEmployees.filter(emp => emp.is_active).length === 0 ? (
                  <div>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active employees found.</p>
                    <p className="text-sm text-gray-400 mt-1">Add employees to start managing payments.</p>
                  </div>
                ) : (
                  <div>
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active employees match your search criteria.</p>
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

      {/* Inactive Employee Management */}
      {inactiveEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Inactive Employee Reactivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{employee.name}</h3>
                      <p className="text-gray-600 text-sm">{formatPositionName(employee.position)} • {employee.department}</p>
                      <p className="text-sm text-gray-500">
                        Monthly Salary: <span className="font-medium text-red-600">{formatCurrency(employee.salary)}</span> (Inactive)
                      </p>
                      <p className="text-xs text-gray-500">
                        CNIC: {employee.cnic} • Contact: {employee.contact_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleActivateEmployee(employee)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
                    >
                      <RotateCcw className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      Reactivate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-lg bg-red-900 text-white border border-red-900 hover:bg-red-800 hover:text-white hover:border-red-800 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group"
                      onClick={() => handlePermanentDeleteEmployee(employee)}
                      title="Permanently Delete Employee"
                    >
                      <XCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
      
      <PermanentDeleteEmployeeDialog 
        open={permanentDeleteEmployeeDialogOpen} 
        onOpenChange={setPermanentDeleteEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <ActivateEmployeeDialog 
        open={activateEmployeeDialogOpen} 
        onOpenChange={setActivateEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
      
      <PayEmployeeDialog 
        open={payEmployeeDialogOpen} 
        onOpenChange={setPayEmployeeDialogOpen} 
        employee={selectedEmployee}
      />
    </div>
  );
};

export default ManageEmployees;
