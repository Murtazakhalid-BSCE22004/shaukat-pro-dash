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
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  HandCoins,
  Banknote
} from 'lucide-react';
import { supabaseExpensesService } from '@/services/supabaseExpensesService';
import { Employee } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';

interface PayEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

type PaymentType = 'monthly_salary' | 'advance_salary' | 'general_amount';

const paymentTypes = [
  {
    value: 'monthly_salary' as PaymentType,
    label: 'Monthly Salary',
    description: 'Regular monthly salary payment',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    value: 'advance_salary' as PaymentType,
    label: 'Advance Salary',
    description: 'Advance payment against future salary',
    icon: HandCoins,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    value: 'general_amount' as PaymentType,
    label: 'General Payment',
    description: 'Custom payment amount',
    icon: Banknote,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
];

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'digital_wallet', label: 'Digital Wallet' }
];

const PayEmployeeDialog: React.FC<PayEmployeeDialogProps> = ({ open, onOpenChange, employee }) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('monthly_salary');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: supabaseExpensesService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Payment processed successfully');
      handleClose();
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    },
  });

  const getPaymentAmount = () => {
    if (!employee) return 0;
    
    switch (paymentType) {
      case 'monthly_salary':
        return employee.salary;
      case 'advance_salary':
        return Math.min(parseFloat(customAmount) || 0, employee.salary);
      case 'general_amount':
        return parseFloat(customAmount) || 0;
      default:
        return 0;
    }
  };

  const getPaymentDescription = () => {
    if (!employee) return '';
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    switch (paymentType) {
      case 'monthly_salary':
        return `Monthly salary payment for ${employee.name} - ${currentMonth}`;
      case 'advance_salary':
        return `Advance salary payment for ${employee.name} - ${currentMonth}`;
      case 'general_amount':
        return `General payment for ${employee.name} - ${notes || 'Custom payment'}`;
      default:
        return '';
    }
  };

  const getPaymentCategory = () => {
    switch (paymentType) {
      case 'monthly_salary':
        return 'Monthly Salary';
      case 'advance_salary':
        return 'Salary Advance';
      case 'general_amount':
        return 'General Payment';
      default:
        return 'Payment';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsSubmitting(true);

    try {
      const amount = getPaymentAmount();
      
      // Validation
      if (amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }

      if (paymentType === 'advance_salary' && amount > employee.salary) {
        toast.error('Advance amount cannot exceed monthly salary');
        return;
      }

      if ((paymentType === 'advance_salary' || paymentType === 'general_amount') && !customAmount) {
        toast.error('Please enter the payment amount');
        return;
      }

      // Create payment record as expense
      const paymentData = {
        category: getPaymentCategory(),
        description: getPaymentDescription(),
        amount: amount,
        expense_date: new Date().toISOString().split('T')[0],
        approved_by: 'System Admin', // You can make this dynamic
        status: 'approved' as const,
        paid_by: 'Finance Department',
        received_by: employee.name,
      };

      await createPaymentMutation.mutateAsync(paymentData);

    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentType('monthly_salary');
    setCustomAmount('');
    setPaymentMethod('bank_transfer');
    setNotes('');
    onOpenChange(false);
  };

  const selectedPaymentType = paymentTypes.find(type => type.value === paymentType);

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            Pay Employee
          </DialogTitle>
        </DialogHeader>

        {/* Employee Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{employee.name}</h3>
              <p className="text-gray-600">{employee.position} • {employee.department}</p>
              <p className="text-sm text-gray-500">
                Monthly Salary: <span className="font-medium text-orange-600">{formatCurrency(employee.salary)}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900">Payment Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {paymentTypes.map((type) => (
                <div
                  key={type.value}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    paymentType === type.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentType(type.value)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      value={type.value}
                      checked={paymentType === type.value}
                      onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                      className="text-orange-600"
                    />
                    <div className={`p-2 rounded-lg ${type.bgColor}`}>
                      <type.icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{type.label}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    {paymentType === type.value && type.value === 'monthly_salary' && (
                      <div className="text-right">
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(employee.salary)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          {(paymentType === 'advance_salary' || paymentType === 'general_amount') && (
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Payment Amount (PKR) *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">Rs</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  max={paymentType === 'advance_salary' ? employee.salary : undefined}
                  step="100"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-10 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
                  required
                />
              </div>
              {paymentType === 'advance_salary' && (
                <p className="text-xs text-gray-500">
                  Maximum advance: {formatCurrency(employee.salary)} (monthly salary)
                </p>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 transition-all duration-200"
              rows={3}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-orange-700">Employee:</span>
                <span className="font-medium text-orange-900">{employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Payment Type:</span>
                <span className="font-medium text-orange-900">{selectedPaymentType?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Amount:</span>
                <span className="font-bold text-orange-900 text-lg">
                  {formatCurrency(getPaymentAmount())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Method:</span>
                <span className="font-medium text-orange-900">
                  {paymentMethods.find(m => m.value === paymentMethod)?.label}
                </span>
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || getPaymentAmount() <= 0}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
            >
              {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(getPaymentAmount())}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayEmployeeDialog;
