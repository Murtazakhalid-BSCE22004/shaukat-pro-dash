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
import { Plus, Search, Filter, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import PeriodSelector from '@/components/ui/period-selector';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import DoctorSelect from '@/components/DoctorSelect';
import '../styles/themes/modern-professional.css';

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
    <div className="modern-professional-theme p-6">
      {/* Modern Header */}
      <div className="modern-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="modern-page-title">Patients Management</h1>
            <p className="modern-page-subtitle">Manage patient records and information efficiently</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="modern-btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      <div className="modern-filter-card">
        <h3 className="modern-filter-title">
          <Filter className="w-5 h-5" />
          Filter Patients
        </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Search Patients
              </Label>
              <div className="modern-search-container">
                <Search className="modern-search-icon absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10" />
                <Input
                  placeholder="Search by name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-12 h-12 text-base font-medium border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Select Doctor
              </Label>
              <div className="relative">
                <DoctorSelect
                  value={selectedDoctor}
                  onChange={setSelectedDoctor}
                  doctors={doctors}
                  loading={isDoctorsLoading}
                  allowAll
                  allLabel="All Doctors"
                  allValue="all"
                  valueKey="name"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Select Period
              </Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-medium h-12 border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 bg-gradient-to-r from-white to-purple-25"
                onClick={() => setIsPeriodSelectorOpen(true)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="flex-1 text-left text-gray-700 font-medium">
                    {getPeriodDisplayText()}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    <DoctorSelect
                      value={newPatient.doctor_name}
                      onChange={(val) => handleInputChange('doctor_name', val)}
                      doctors={doctors}
                      loading={isDoctorsLoading}
                      placeholder="Select Doctor"
                      valueKey="name"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Fee Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out group border-0"
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

      <div className="modern-content-card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Patient List</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="modern-badge info">{filteredPatients.length}</span>
              <span className="text-sm text-gray-600">patients</span>
            </div>
          </div>
        </div>
        <div className="card-content p-0">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="modern-empty-icon mb-6">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading patients...</h3>
              <p className="text-gray-500">Please wait while we fetch your patient records</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="modern-empty-title">No patients found</h3>
              <p className="modern-empty-subtitle">
                Get started by adding your first patient record to begin managing healthcare efficiently.
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="modern-btn-primary px-8 py-3 text-base font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Patient
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="modern-table-container hidden lg:block">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Contact</th>
                      <th>Doctor</th>
                      <th>OPD Fee</th>
                      <th>Lab Fee</th>
                      <th>Ultrasound</th>
                      <th>ECG</th>
                      <th>OT</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
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
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on mobile */}
              <div className="lg:hidden space-y-4">
                {filteredPatients.map((patient) => {
                  const totalFee = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0) + (patient.ot_fee || 0);
                  return (
                    <Card key={patient.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-3">
                          {/* Patient Info Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{patient.patient_name}</h3>
                              <p className="text-sm text-gray-600">{patient.contact_number}</p>
                              <p className="text-sm text-blue-600 font-medium">{patient.doctor_name || 'No doctor assigned'}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">Rs. {totalFee}</div>
                              <div className="text-xs text-gray-500">Total</div>
                            </div>
                          </div>

                          {/* Fee Breakdown Grid */}
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {patient.opd_fee && patient.opd_fee > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 font-medium">OPD Fee</div>
                                <div className="text-sm font-bold text-blue-700">Rs. {patient.opd_fee}</div>
                              </div>
                            )}
                            {patient.lab_fee && patient.lab_fee > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-xs text-green-600 font-medium">Lab Fee</div>
                                <div className="text-sm font-bold text-green-700">Rs. {patient.lab_fee}</div>
                              </div>
                            )}
                            {patient.ultrasound_fee && patient.ultrasound_fee > 0 && (
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-xs text-purple-600 font-medium">Ultrasound</div>
                                <div className="text-sm font-bold text-purple-700">Rs. {patient.ultrasound_fee}</div>
                              </div>
                            )}
                            {patient.ecg_fee && patient.ecg_fee > 0 && (
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="text-xs text-orange-600 font-medium">ECG</div>
                                <div className="text-sm font-bold text-orange-700">Rs. {patient.ecg_fee}</div>
                              </div>
                            )}
                            {patient.ot_fee && patient.ot_fee > 0 && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-xs text-red-600 font-medium">Operation Theater</div>
                                <div className="text-sm font-bold text-red-700">Rs. {patient.ot_fee}</div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
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
                              className="flex-1 h-9 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
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
                              className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700 focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 border-0"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      

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
