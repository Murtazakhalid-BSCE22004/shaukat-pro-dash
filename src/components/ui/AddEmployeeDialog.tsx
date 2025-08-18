import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { HospitalPositions } from '@/types';
import { toast } from 'sonner';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const hospitalPositions: { value: HospitalPositions; label: string }[] = [
  { value: 'laboratory technician', label: 'Laboratory Technician' },
  { value: 'laboratory engineer', label: 'Laboratory Engineer' },
  { value: 'pharmacy attendant', label: 'Pharmacy Attendant' },
  { value: 'steward', label: 'Steward' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'ward', label: 'Ward' },
  { value: 'OT', label: 'OT' },
  { value: 'doctor attendant', label: 'Doctor Attendant' },
  { value: 'xray', label: 'X-Ray' },
  { value: 'internee', label: 'Internee' },
  { value: 'general', label: 'General' },
  { value: 'manager', label: 'Manager' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'LHV', label: 'LHV' },
];

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    cnic: '',
    contact_number: '',
    address: '',
    position: '',
    department: '',
    salary: '',
    email: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: supabaseEmployeesService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added successfully');
      handleClose();
    },
    onError: (error) => {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.cnic || !formData.contact_number || 
          !formData.address || !formData.position || !formData.salary) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate CNIC format (basic validation)
      if (formData.cnic.length !== 13) {
        toast.error('CNIC must be 13 digits');
        return;
      }

      // Validate age
      const age = parseInt(formData.age);
      if (age < 16 || age > 70) {
        toast.error('Age must be between 16 and 70');
        return;
      }

      const employeeData = {
        name: formData.name.trim(),
        age: age,
        cnic: formData.cnic.trim(),
        contact_number: formData.contact_number.trim(),
        address: formData.address.trim(),
        position: formData.position as HospitalPositions,
        department: formData.department.trim() || formData.position,
        salary: parseFloat(formData.salary),
        email: formData.email.trim() || '',
        hire_date: formData.hire_date,
        is_active: true,
      };

      await createEmployeeMutation.mutateAsync(employeeData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      age: '',
      cnic: '',
      contact_number: '',
      address: '',
      position: '',
      department: '',
      salary: '',
      email: '',
      hire_date: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-orange-600" />
            </div>
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  min="16"
                  max="70"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic" className="text-sm font-medium text-gray-700">
                  CNIC *
                </Label>
                <Input
                  id="cnic"
                  type="text"
                  placeholder="13-digit CNIC (without dashes)"
                  maxLength={13}
                  value={formData.cnic}
                  onChange={(e) => handleInputChange('cnic', e.target.value.replace(/\D/g, ''))}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number" className="text-sm font-medium text-gray-700">
                  Contact Number *
                </Label>
                <Input
                  id="contact_number"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                  Position Category *
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => {
                    handleInputChange('position', value);
                    // Auto-set department to position if department is empty
                    if (!formData.department) {
                      handleInputChange('department', value);
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 focus-visible:ring-orange-500 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Select position category" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitalPositions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Department
                </Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Enter department (auto-filled from position)"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm font-medium text-gray-700">
                  Monthly Salary (PKR) *
                </Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="Enter monthly salary"
                  min="0"
                  step="1000"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date" className="text-sm font-medium text-gray-700">
                  Hire Date *
                </Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
            >
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
