import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee } from '@/types';
import { toast } from 'sonner';

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  employee 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteEmployeeMutation = useMutation({
    mutationFn: supabaseEmployeesService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deactivated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error deleting employee:', error);
      toast.error('Failed to deactivate employee');
    },
  });

  const handleDelete = async () => {
    if (!employee) return;

    setIsDeleting(true);
    try {
      await deleteEmployeeMutation.mutateAsync(employee.id);
    } catch (error) {
      console.error('Error deleting employee:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            Deactivate Employee
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action will deactivate the employee. They will no longer appear in active employee lists, 
            but their records will be preserved for historical purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trash2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                <p className="text-xs text-gray-500">
                  CNIC: {employee.cnic} • Contact: {employee.contact_number}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  • Employee will be marked as inactive<br/>
                  • Salary calculations will exclude this employee<br/>
                  • Historical records will remain intact<br/>
                  • Employee can be reactivated later if needed
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate Employee'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEmployeeDialog;
