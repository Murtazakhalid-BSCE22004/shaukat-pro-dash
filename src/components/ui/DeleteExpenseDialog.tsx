import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Expense } from '@/types';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

const DeleteExpenseDialog: React.FC<DeleteExpenseDialogProps> = ({ open, onOpenChange, expense }) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => supabaseExpensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting expense:', error);
    }
  });

  const handleDelete = async () => {
    if (!expense) return;
    
    setIsDeleting(true);
    try {
      await deleteExpenseMutation.mutateAsync(expense.id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <span>Delete Expense</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Description:</span>
              <span className="text-gray-900">{expense.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Amount:</span>
              <span className="text-gray-900 font-semibold">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Category:</span>
              <span className="text-gray-900">{expense.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Date:</span>
              <span className="text-gray-900">
                {new Date(expense.expense_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete Expense</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExpenseDialog;
