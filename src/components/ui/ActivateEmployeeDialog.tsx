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
import { UserCheck, CheckCircle } from 'lucide-react';
import { supabaseEmployeesService } from '@/services/supabaseEmployeesService';
import { Employee } from '@/types';
import { toast } from 'sonner';

interface ActivateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const ActivateEmployeeDialog: React.FC<ActivateEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  employee 
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const queryClient = useQueryClient();

  const activateEmployeeMutation = useMutation({
    mutationFn: supabaseEmployeesService.activateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee activated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error activating employee:', error);
      toast.error('Failed to activate employee');
    },
  });

  const handleActivate = async () => {
    if (!employee) return;

    setIsActivating(true);
    try {
      await activateEmployeeMutation.mutateAsync(employee.id);
    } catch (error) {
      console.error('Error activating employee:', error);
    } finally {
      setIsActivating(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            Activate Employee
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action will reactivate the employee. They will appear in active employee lists 
            and be included in salary calculations again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
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

          {/* Benefits Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Activation Benefits</p>
                <p className="text-sm text-green-700 mt-1">
                  • Employee will be marked as active<br/>
                  • Will be included in salary calculations<br/>
                  • Will appear in active employee lists<br/>
                  • Can receive salary payments again<br/>
                  • All historical records remain intact
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
              disabled={isActivating}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleActivate}
              disabled={isActivating}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
            >
              {isActivating ? 'Activating...' : 'Activate Employee'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivateEmployeeDialog;
