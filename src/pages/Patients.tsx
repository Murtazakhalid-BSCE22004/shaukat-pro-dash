import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDoctorsService, type Doctor } from '@/services/supabaseDoctorsService';
import { supabasePatientsService, type Patient } from '@/services/supabasePatientsService';

// Type for the form state with string values for fee fields
type PatientFormData = {
  patient_name: string;
  contact_number: string;
  doctor_name: string;
  opd_fee: string;
  lab_fee: string;
  ultrasound_fee: string;
  ecg_fee: string;
  ot_fee: string;
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import PeriodSelector from '@/components/ui/period-selector';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

const Patients: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState<PatientFormData>({
    patient_name: '',
    contact_number: '',
    doctor_name: '',
    opd_fee: '',
    lab_fee: '',
    ultrasound_fee: '',
    ecg_fee: '',
    ot_fee: ''
  });

  // Period selector state - default to today
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000 local time
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999 local time
    
    return { from: startOfDay, to: endOfDay };
  });
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);

  // Ensure date range is set to today when component mounts
  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000 local time
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999 local time
    
    setDateRange({ from: startOfDay, to: endOfDay });
  }, []);

  // Fetch active doctors for dropdown
  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['active-doctors'],
    queryFn: supabaseDoctorsService.getActiveDoctors,
  });

  // Fetch patients
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Helper function to get date strings from DateRange
  const getDateStrings = () => {
    if (!dateRange?.from || !dateRange?.to) {
      const today = new Date();
      return {
        startDate: today.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10)
      };
    }
    
    // Handle same-day ranges properly
    const start = dateRange.from;
    const end = dateRange.to;
    
    // If it's the same day, ensure we cover the full 24 hours
    if (start.toDateString() === end.toDateString()) {
      // For same-day ranges, construct the date string directly to avoid timezone issues
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      return {
        startDate: dateString,
        endDate: dateString
      };
    }
    
    // For different days, construct date strings directly to avoid timezone issues
    const startYear = start.getFullYear();
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDay = String(start.getDate()).padStart(2, '0');
    const startDateString = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');
    const endDateString = `${endYear}-${endMonth}-${endDay}`;
    
    return {
      startDate: startDateString,
      endDate: endDateString
    };
  };

  const { startDate, endDate } = getDateStrings();

  // Function to get period display text
  const getPeriodDisplayText = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return 'Select date range';
    }

    const now = new Date();
    const from = dateRange.from;
    const to = dateRange.to;

    // Check for Today - use more robust comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (fromDate.getTime() === todayDate.getTime() && toDate.getTime() === todayDate.getTime()) {
      return 'Today';
    }

    // Check for Yesterday - use more robust comparison
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (fromDate.getTime() === yesterdayDate.getTime() && toDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    }

    // Check for This Week - use more robust comparison
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const weekEndDate = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
    
    if (fromDate.getTime() === weekStartDate.getTime() && toDate.getTime() === weekEndDate.getTime()) {
      return 'This Week';
    }

    // Check for Last Week
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    if (from.toDateString() === lastWeekStart.toDateString() && to.toDateString() === lastWeekEnd.toDateString()) {
      return 'Last Week';
    }

    // Check for This Month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (from.toDateString() === monthStart.toDateString() && to.toDateString() === now.toDateString()) {
      return 'This Month';
    }

    // Check for Last Month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    if (from.toDateString() === lastMonthStart.toDateString() && to.toDateString() === lastMonthEnd.toDateString()) {
      return 'Last Month';
    }

    // Check for This Year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    if (from.toDateString() === yearStart.toDateString() && to.toDateString() === now.toDateString()) {
      return 'This Year';
    }

    // Check for Last Year
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
    if (from.toDateString() === lastYearStart.toDateString() && to.toDateString() === lastYearEnd.toDateString()) {
      return 'Last Year';
    }

    // If it's a custom range, show the date range
    return `${format(from, 'dd MMM yyyy')} - ${format(to, 'dd MMM yyyy')}`;
  };

  // Debug logging
  console.log('Patients - Date Range Debug:', {
    dateRange,
    startDate,
    endDate,
    dateRangeFrom: dateRange?.from?.toDateString(),
    dateRangeTo: dateRange?.to?.toDateString(),
    startDateISO: startDate,
    endDateISO: endDate,
    periodDisplayText: getPeriodDisplayText(),
    isToday: dateRange?.from?.toDateString() === new Date().toDateString() && 
             dateRange?.to?.toDateString() === new Date().toDateString()
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', { selectedDoctor, startDate, endDate, searchTerm }],
    queryFn: async () => {
      // Create proper ISO strings for the date range
      // Use local timezone to avoid UTC conversion issues
      const range = {
        startISO: startDate ? `${startDate}T00:00:00.000+05:00` : undefined,
        endISO: endDate ? `${endDate}T23:59:59.999+05:00` : undefined,
      };
      
      console.log('Query date range:', { startDate, endDate, range });
      
      return await supabasePatientsService.getPatientsByFilters({
        doctorName: selectedDoctor !== 'all' ? selectedDoctor : undefined,
        startDate: range.startISO,
        endDate: range.endISO,
        searchTerm,
      });
    },
  });

  // Create or update patient mutation
  const savePatientMutation = useMutation({
    mutationFn: async (payload: PatientFormData) => {
      // Convert string values to numbers for database
      const patientData = {
        patient_name: payload.patient_name,
        contact_number: payload.contact_number,
        doctor_name: payload.doctor_name,
        opd_fee: payload.opd_fee === '' ? 0 : parseFloat(payload.opd_fee) || 0,
        lab_fee: payload.lab_fee === '' ? 0 : parseFloat(payload.lab_fee) || 0,
        ultrasound_fee: payload.ultrasound_fee === '' ? 0 : parseFloat(payload.ultrasound_fee) || 0,
        ecg_fee: payload.ecg_fee === '' ? 0 : parseFloat(payload.ecg_fee) || 0,
        ot_fee: payload.ot_fee === '' ? 0 : parseFloat(payload.ot_fee) || 0,
      };
      
      if (editingId) {
        return await supabasePatientsService.updatePatient(editingId, patientData);
      }
      return await supabasePatientsService.createPatient(patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(editingId ? 'Patient updated successfully' : 'Patient added successfully');
      resetForm();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error('Error saving patient: ' + error);
    }
  });

  // Delete patient
  const deletePatient = async (id: string) => {
    try {
      await supabasePatientsService.deletePatient(id);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
      if (editingId === id) {
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error('Error deleting patient');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewPatient({
      patient_name: '',
      contact_number: '',
      doctor_name: '',
      opd_fee: '',
      lab_fee: '',
      ultrasound_fee: '',
      ecg_fee: '',
      ot_fee: ''
    });
  };

  const filteredPatients = patients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.patient_name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!newPatient.contact_number.trim()) {
      toast.error('Contact number is required');
      return;
    }
    if (!newPatient.doctor_name.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    
    savePatientMutation.mutate(newPatient);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
            <p className="text-gray-600 mt-2">Manage patient records and information</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="w-4 h-4 text-gray-600" />
            Filter Patients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2 group">
              <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                <Input
                  placeholder="Search by name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
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
            <div className="space-y-2 group">
              <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">Doctor</Label>
              <select
                className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 group-hover:border-blue-300"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                style={{ 
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLSelectElement;
                  target.style.borderColor = '#3b82f6';
                  target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLSelectElement;
                  target.style.borderColor = '#d1d5db';
                  target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Doctors</option>
                {isDoctorsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>{doc.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Period</Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10 border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group bg-white text-gray-700"
                onClick={() => setIsPeriodSelectorOpen(true)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1.5 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-all duration-200">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900">
                    {getPeriodDisplayText()}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-600" />
              {editingId ? 'Edit Patient' : 'Add New Patient'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Patient Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newPatient.patient_name}
                      onChange={(e) => handleInputChange('patient_name', e.target.value)}
                      required
                      className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                      placeholder="Enter patient name"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newPatient.contact_number}
                      onChange={(e) => handleInputChange('contact_number', e.target.value)}
                      required
                      className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                      placeholder="0300-1234567"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Doctor Name <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 group-hover:border-blue-300"
                      value={newPatient.doctor_name}
                      onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                      required
                      style={{ 
                        border: '1px solid #d1d5db',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLSelectElement;
                        target.style.borderColor = '#3b82f6';
                        target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLSelectElement;
                        target.style.borderColor = '#d1d5db';
                        target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="" className="text-gray-400">Select Doctor</option>
                      {isDoctorsLoading ? (
                        <option disabled className="text-gray-400">Loading...</option>
                      ) : (
                        doctors.map((doc) => (
                          <option key={doc.id} value={doc.name} className="text-gray-900">{doc.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fee Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Fee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      OPD Fee <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">Rs.</span>
                      <Input
                        type="number"
                        value={newPatient.opd_fee}
                        onChange={(e) => handleInputChange('opd_fee', e.target.value)}
                        required
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 pl-10 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                        placeholder="0"
                        min="0"
                        step="0.01"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Lab Fee
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">Rs.</span>
                      <Input
                        type="number"
                        value={newPatient.lab_fee}
                        onChange={(e) => handleInputChange('lab_fee', e.target.value)}
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 pl-10 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                        placeholder="0"
                        min="0"
                        step="0.01"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Ultrasound Fee
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">Rs.</span>
                      <Input
                        type="number"
                        value={newPatient.ultrasound_fee}
                        onChange={(e) => handleInputChange('ultrasound_fee', e.target.value)}
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 pl-10 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                        placeholder="0"
                        min="0"
                        step="0.01"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      ECG Fee
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">Rs.</span>
                      <Input
                        type="number"
                        value={newPatient.ecg_fee}
                        onChange={(e) => handleInputChange('ecg_fee', e.target.value)}
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 pl-10 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                        placeholder="0"
                        min="0"
                        step="0.01"
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      OT Fee
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">Rs.</span>
                      <Input
                        type="number"
                        value={newPatient.ot_fee}
                        onChange={(e) => handleInputChange('ot_fee', e.target.value)}
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 pl-10 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
                        placeholder="0"
                        min="0"
                        step="0.01"
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
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={savePatientMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 border-0"
                >
                  {savePatientMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    editingId ? 'Update Patient' : 'Add Patient'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { resetForm(); setShowAddForm(false); }}
                  className="px-5 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800">Patient List</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{filteredPatients.length}</span>
              <span className="text-sm text-gray-600">patients</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">No patients found</p>
              <p className="text-sm text-gray-500">Add your first patient to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Patient Name</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Contact</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Doctor</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">OPD Fee</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Lab Fee</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Ultrasound</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">ECG</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">OT</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Total</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => (
                    <TableRow 
                      key={patient.id} 
                      className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <TableCell className="font-medium text-gray-900 py-3">{patient.patient_name}</TableCell>
                      <TableCell className="text-gray-700 py-3">{patient.contact_number}</TableCell>
                      <TableCell className="text-gray-700 py-3">{patient.doctor_name}</TableCell>
                      <TableCell className="text-gray-700 py-3">Rs. {patient.opd_fee}</TableCell>
                      <TableCell className="text-gray-700 py-3">Rs. {patient.lab_fee}</TableCell>
                      <TableCell className="text-gray-700 py-3">Rs. {patient.ultrasound_fee}</TableCell>
                      <TableCell className="text-gray-700 py-3">Rs. {patient.ecg_fee}</TableCell>
                      <TableCell className="text-gray-700 py-3">Rs. {patient.ot_fee || 0}</TableCell>
                      <TableCell className="text-gray-900 py-3 font-medium">
                        Rs. {(patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0) + (patient.ot_fee || 0)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(patient.id);
                              setNewPatient({
                                patient_name: patient.patient_name,
                                contact_number: patient.contact_number,
                                doctor_name: patient.doctor_name,
                                opd_fee: patient.opd_fee ? patient.opd_fee.toString() : '',
                                lab_fee: patient.lab_fee ? patient.lab_fee.toString() : '',
                                ultrasound_fee: patient.ultrasound_fee ? patient.ultrasound_fee.toString() : '',
                                ecg_fee: patient.ecg_fee ? patient.ecg_fee.toString() : '',
                                ot_fee: patient.ot_fee ? patient.ot_fee.toString() : ''
                              });
                              setShowAddForm(true);
                            }}
                            className="h-7 px-2.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this patient?')) {
                                deletePatient(patient.id);
                              }
                            }}
                            className="h-7 px-2.5 text-xs bg-red-600 hover:bg-red-700 focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 border-0"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      

      {/* Period Selector Modal */}
      <PeriodSelector
        key={`period-selector-${dateRange?.from?.toDateString()}-${dateRange?.to?.toDateString()}`}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isOpen={isPeriodSelectorOpen}
        onClose={() => setIsPeriodSelectorOpen(false)}
      />
    </div>
  );
};

export default Patients;
