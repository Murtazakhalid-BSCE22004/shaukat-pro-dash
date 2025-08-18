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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Skull } from 'lucide-react';
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

  const deleteEmployeeMutation = useMutation({
    mutationFn: supabaseEmployeesService.permanentDeleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee permanently deleted');
      onOpenChange(false);
      setConfirmationText('');
    },
    onError: (error) => {
      console.error('Error permanently deleting employee:', error);
      toast.error('Failed to permanently delete employee');
    },
  });

  const handlePermanentDelete = async () => {
    if (!employee || confirmationText !== 'PERMANENTLY DELETE') return;

    setIsDeleting(true);
    try {
      await deleteEmployeeMutation.mutateAsync(employee.id);
    } catch (error) {
      console.error('Error permanently deleting employee:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onOpenChange(false);
  };

  if (!employee) return null;

  const isConfirmationValid = confirmationText === 'PERMANENTLY DELETE';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <div className="p-2 bg-red-100 rounded-lg">
              <Skull className="h-5 w-5 text-red-600" />
            </div>
            Permanent Delete Employee
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action will permanently remove the employee and ALL their related data from the database. 
            This operation CANNOT be undone.
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
                  Status: {employee.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800 mb-2">⚠️ CRITICAL WARNING ⚠️</p>
                <p className="text-sm text-red-700 space-y-1">
                  <span className="block">• Employee record will be PERMANENTLY deleted</span>
                  <span className="block">• ALL salary payment history will be deleted</span>
                  <span className="block">• ALL related data will be lost forever</span>
                  <span className="block">• This action CANNOT be reversed</span>
                  <span className="block">• Consider deactivation instead of permanent deletion</span>
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800 mb-3">
              To confirm permanent deletion, type: <code className="bg-yellow-200 px-2 py-1 rounded text-red-700 font-bold">PERMANENTLY DELETE</code>
            </p>
            <Label htmlFor="confirmation" className="text-sm font-medium text-gray-700">
              Confirmation Text *
            </Label>
            <Input
              id="confirmation"
              type="text"
              placeholder="Type: PERMANENTLY DELETE"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-1 border-red-200 focus:ring-red-500 focus:border-red-500"
              autoComplete="off"
            />
          </div>

          {/* Alternative Suggestion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Recommended Alternative</p>
                <p className="text-sm text-blue-700 mt-1">
                  Consider deactivating the employee instead. This preserves all historical data 
                  while removing them from active operations. Deactivated employees can be reactivated later if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePermanentDelete}
              disabled={isDeleting || !isConfirmationValid}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200 border-0"
            >
              {isDeleting ? 'Permanently Deleting...' : 'Permanent Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermanentDeleteEmployeeDialog;
