import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Expense } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expenseCategories = [
  'Medical Supplies',
  'Utilities',
  'Maintenance',
  'Office Supplies',
  'Marketing',
  'Equipment',
  'Insurance',
  'Transportation',
  'Food & Catering',
  'Other'
];

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    paid_by: '',
    received_by: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExpenseMutation = useMutation({
    mutationFn: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) =>
      supabaseExpensesService.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating expense:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount || !formData.expense_date || !formData.paid_by || !formData.received_by) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
             const expenseData = {
         ...formData,
         amount: parseFloat(formData.amount),
         approved_by: 'Approved',
         status: 'approved'
       };

      await createExpenseMutation.mutateAsync(expenseData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_url: '',
      paid_by: '',
      received_by: ''
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <span>Add New Expense</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2 group">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 group-hover:border-blue-300">
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2 group">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                Amount (PKR) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors duration-300">₨</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  min="0"
                  step="0.01"
                  className="h-10 pl-8 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                  style={{ 
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                    target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#d1d5db';
                    target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 group">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Enter detailed expense description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="resize-none border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
              style={{ 
                border: '1px solid #d1d5db',
                outline: 'none',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = '#d1d5db';
                target.style.boxShadow = 'none';
              }}
            />
          </div>

                     {/* Expense Date */}
           <div className="space-y-2 group">
             <Label htmlFor="expense_date" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
               Expense Date *
             </Label>
             <div className="relative">
               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
               <Input
                 id="expense_date"
                 type="date"
                 value={formData.expense_date}
                 onChange={(e) => handleInputChange('expense_date', e.target.value)}
                 className="h-10 pl-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                 style={{ 
                   border: '1px solid #d1d5db',
                   outline: 'none',
                   boxShadow: 'none'
                 }}
                 onMouseEnter={(e) => {
                   const target = e.target as HTMLInputElement;
                   target.style.borderColor = '#3b82f6';
                   target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                 }}
                 onMouseLeave={(e) => {
                   const target = e.target as HTMLInputElement;
                   target.style.borderColor = '#d1d5db';
                   target.style.boxShadow = 'none';
                 }}
               />
             </div>
           </div>

                     {/* Receipt URL */}
           <div className="space-y-2 group">
             <Label htmlFor="receipt_url" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
               Receipt URL (Optional)
             </Label>
             <Input
               id="receipt_url"
               placeholder="Enter receipt URL or file path"
               value={formData.receipt_url}
               onChange={(e) => handleInputChange('receipt_url', e.target.value)}
               className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
               style={{ 
                 border: '1px solid #d1d5db',
                 outline: 'none',
                 boxShadow: 'none'
               }}
               onMouseEnter={(e) => {
                 const target = e.target as HTMLInputElement;
                 target.style.borderColor = '#3b82f6';
                 target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
               }}
               onMouseLeave={(e) => {
                 const target = e.target as HTMLInputElement;
                 target.style.borderColor = '#d1d5db';
                 target.style.boxShadow = 'none';
               }}
             />
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid By */}
            <div className="space-y-2 group">
              <Label htmlFor="paid_by" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                Paid By *
              </Label>
              <Input
                id="paid_by"
                placeholder="Enter name of person who paid"
                value={formData.paid_by}
                onChange={(e) => handleInputChange('paid_by', e.target.value)}
                className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                style={{ 
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#3b82f6';
                  target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#d1d5db';
                  target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Received By */}
            <div className="space-y-2 group">
              <Label htmlFor="received_by" className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                Received By *
              </Label>
              <Input
                id="received_by"
                placeholder="Enter name of person who received"
                value={formData.received_by}
                onChange={(e) => handleInputChange('received_by', e.target.value)}
                className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                style={{ 
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#3b82f6';
                  target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#d1d5db';
                  target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Add Expense</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
