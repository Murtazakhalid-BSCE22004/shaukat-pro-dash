import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Search, RotateCcw, Users, Clock } from 'lucide-react';
import { supabasePatientsService } from '@/services/supabasePatientsService';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import DoctorSelect from '@/components/DoctorSelect';
import '../styles/themes/modern-professional.css';

type Patient = Tables<'patients'>;
type Doctor = Tables<'doctors'>;

// Helper function to get ISO date string (date only)
const isoDateOnly = (date: Date) => date.toISOString().split('T')[0];

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // Refs for native pickers
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);

  const openPicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    // Prefer native showPicker when available
    const anyEl = el as any;
    if (typeof anyEl.showPicker === 'function') {
      anyEl.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  // Fetch doctors for the dropdown
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  // Fetch all patients first, then filter client-side for better performance
  const { data: allPatients = [], isLoading } = useQuery({
    queryKey: ['allPatients'],
    queryFn: supabasePatientsService.getAllPatients,
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDoctor('all');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
  };

  // Filter patients based on all criteria
  const filteredPatients = useMemo(() => {
    let filtered = allPatients;

    // Filter by doctor
    if (selectedDoctor && selectedDoctor !== 'all') {
      filtered = filtered.filter(patient => 
        patient.doctor_name === selectedDoctor
      );
    }

    // Filter by search term (patient name or contact)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        patient.patient_name?.toLowerCase().includes(term) ||
        patient.contact_number?.includes(term)
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(patient => {
        const patientDate = isoDateOnly(new Date(patient.created_at));
        return patientDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(patient => {
        const patientDate = isoDateOnly(new Date(patient.created_at));
        return patientDate <= endDate;
      });
    }

    // Filter by time range
    if (startTime || endTime) {
      filtered = filtered.filter(patient => {
        const patientTime = new Date(patient.created_at).toTimeString().slice(0, 5); // HH:MM format
        
        if (startTime && endTime) {
          return patientTime >= startTime && patientTime <= endTime;
        } else if (startTime) {
          return patientTime >= startTime;
        } else if (endTime) {
          return patientTime <= endTime;
        }
        
        return true;
      });
    }

    return filtered;
  }, [allPatients, searchTerm, selectedDoctor, startDate, endDate, startTime, endTime]);

  return (
    <div className="modern-professional-theme p-6">
      {/* Modern Header */}
      <div className="modern-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="modern-page-title">Appointments</h1>
            <p className="modern-page-subtitle">Manage and filter patient appointments efficiently</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Total: {filteredPatients.length} appointments</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="modern-filter-card">
        <h3 className="modern-filter-title">
          <Filter className="w-5 h-5" />
            Filter Appointments
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Name or Contact */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Search Patients
              </Label>
              <div className="modern-search-container">
                <Search className="modern-search-icon absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-12 h-12 text-base font-medium border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Select Doctor
              </Label>
              <DoctorSelect
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                doctors={doctors}
                allowAll
                allValue="all"
                allLabel="All Doctors"
                valueKey="name"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Start Date
              </Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick start date"
                  onClick={() => openPicker(startDateRef.current)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-purple-100 text-purple-600 transition-colors duration-300 z-10"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={startDateRef}
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="modern-input pl-12 h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                End Date
              </Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick end date"
                  onClick={() => openPicker(endDateRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500 group-hover:text-blue-500 transition-colors duration-300"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={endDateRef}
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="pl-10 h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
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

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div className="space-y-2 group">
              <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">From Time</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick start time"
                  onClick={() => openPicker(fromRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500 group-hover:text-blue-500 transition-colors duration-300"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={fromRef}
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="pl-10 h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
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
              <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">To Time</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick end time"
                  onClick={() => openPicker(toRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500 group-hover:text-blue-500 transition-colors duration-300"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={toRef}
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="pl-10 h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300"
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

          {/* Reset Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button 
              onClick={resetFilters} 
              className="modern-btn-secondary flex items-center gap-2 px-6 py-3"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        </div>

      {/* Results Section */}
      <div className="modern-content-card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Appointment Results</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="modern-badge info">{filteredPatients.length}</span>
              <span className="text-sm text-gray-600">appointments</span>
            </div>
          </div>
        </div>
        <div className="card-content p-0">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="modern-empty-icon mb-6">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading appointments...</h3>
              <p className="text-gray-500">Please wait while we fetch appointment records</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="modern-empty-title">No appointments found</h3>
              <p className="modern-empty-subtitle">
                Try adjusting your filter criteria to find the appointments you're looking for.
              </p>
              <Button 
                onClick={resetFilters}
                className="modern-btn-primary px-8 py-3 text-base font-semibold"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Doctor</th>
                    <th>OPD Fee</th>
                    <th>Lab Fee</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const totalFees = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                          {new Date(patient.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="font-medium">{patient.patient_name}</td>
                        <td>{patient.contact_number}</td>
                        <td>
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {patient.doctor_name}
                          </span>
                        </td>
                        <td>Rs. {patient.opd_fee || 0}</td>
                        <td>Rs. {patient.lab_fee || 0}</td>
                        <td className="font-semibold text-green-600">Rs. {totalFees}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


