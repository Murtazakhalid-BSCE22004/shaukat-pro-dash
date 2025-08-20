import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee } from '@/types';
import AddEmployeeDialog from '@/components/ui/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/ui/EditEmployeeDialog';
import DeleteEmployeeDialog from '@/components/ui/DeleteEmployeeDialog';
import '../styles/themes/modern-professional.css';

const EmployeeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);
  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch all employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: supabaseEmployeesService.getAllEmployees,
  });

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteEmployeeDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="modern-professional-theme p-6">
      {/* Modern Header */}
      <div className="modern-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="modern-page-title">Employee Management</h1>
            <p className="modern-page-subtitle">Manage employee records, roles, and information efficiently</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setAddEmployeeDialogOpen(true)}
              className="modern-btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-filter-card">
        <h3 className="modern-filter-title">
          <Filter className="w-5 h-5" />
          Filter Employees
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              Search Employees
            </label>
            <div className="modern-search-container">
              <Search className="modern-search-icon absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10" />
              <Input
                placeholder="Search by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-12 h-12 text-base font-medium border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="modern-stat-card revenue">
          <div className="card-icon">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="card-title">Total Employees</h3>
          <div className="card-value">{employees.length}</div>
          <div className="card-change">All registered employees</div>
        </div>
        <div className="modern-stat-card customers">
          <div className="card-icon">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <h3 className="card-title">Active Employees</h3>
          <div className="card-value">{employees.filter(e => e.is_active).length}</div>
          <div className="card-change">Currently working</div>
        </div>
        <div className="modern-stat-card margin">
          <div className="card-icon">
            <UserX className="h-6 w-6 text-white" />
          </div>
          <h3 className="card-title">Inactive Employees</h3>
          <div className="card-value">{employees.filter(e => !e.is_active).length}</div>
          <div className="card-change">Not currently working</div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="modern-content-card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Employee Directory</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="modern-badge info">{filteredEmployees.length}</span>
              <span className="text-sm text-gray-600">employees</span>
            </div>
          </div>
        </div>
        <div className="card-content p-0">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="modern-empty-icon mb-6">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading employees...</h3>
              <p className="text-gray-500">Please wait while we fetch employee records</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="modern-empty-title">No employees found</h3>
              <p className="modern-empty-subtitle">
                Get started by adding your first employee to begin HR management.
              </p>
              <Button
                onClick={() => setAddEmployeeDialogOpen(true)}
                className="modern-btn-primary mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{employee.name}</span>
                          <span className="text-sm text-gray-500">{employee.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                          {employee.department || 'N/A'}
                        </span>
                      </td>
                      <td className="text-gray-700">{employee.position || 'N/A'}</td>
                      <td className="font-semibold text-green-600">
                        Rs. {employee.salary?.toLocaleString() || '0'}
                      </td>
                      <td>{getStatusBadge(employee.is_active)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditEmployee(employee)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEmployee(employee)}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddEmployeeDialog
        isOpen={addEmployeeDialogOpen}
        onClose={() => setAddEmployeeDialogOpen(false)}
      />
      
      {selectedEmployee && (
        <EditEmployeeDialog
          isOpen={editEmployeeDialogOpen}
          onClose={() => {
            setEditEmployeeDialogOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}

      {selectedEmployee && (
        <DeleteEmployeeDialog
          isOpen={deleteEmployeeDialogOpen}
          onClose={() => {
            setDeleteEmployeeDialogOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
