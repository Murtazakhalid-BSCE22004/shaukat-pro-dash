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
import { Trash2, AlertTriangle, XCircle, Shield } from 'lucide-react';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee } from '@/types';
import { toast } from 'sonner';

interface PermanentDeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const PermanentDeleteEmployeeDialog: React.FC<PermanentDeleteEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  employee 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const queryClient = useQueryClient();

  const permanentDeleteEmployeeMutation = useMutation({
    mutationFn: supabaseEmployeesService.permanentDeleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee permanently deleted from database');
      onOpenChange(false);
      setConfirmationText('');
    },
    onError: (error) => {
      console.error('Error permanently deleting employee:', error);
      toast.error('Failed to permanently delete employee');
    },
  });

  const handlePermanentDelete = async () => {
    if (!employee) return;
    if (confirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm permanent deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await permanentDeleteEmployeeMutation.mutateAsync(employee.id);
    } catch (error) {
      console.error('Error permanently deleting employee:', error);
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
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            Permanently Delete Employee
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action will permanently remove the employee from the database. 
            This action cannot be undone and all related records will be lost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                <p className="text-xs text-gray-500">
                  CNIC: {employee.cnic} • Contact: {employee.contact_number}
                </p>
                <p className="text-xs text-gray-500">
                  Salary: {employee.salary} • Status: {employee.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">⚠️ CRITICAL WARNING</p>
                <p className="text-sm text-red-700 mt-1">
                  • Employee will be permanently removed from database<br/>
                  • All salary payment records will be deleted<br/>
                  • This action cannot be undone<br/>
                  • No recovery possible
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Type "DELETE" to confirm permanent deletion:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setConfirmationText('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isDeleting || confirmationText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermanentDeleteEmployeeDialog;
