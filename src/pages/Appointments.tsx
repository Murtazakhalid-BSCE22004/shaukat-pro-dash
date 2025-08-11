import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Search, RotateCcw } from 'lucide-react';
import { supabasePatientsService } from '@/services/supabasePatientsService';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Name or Contact */}
            <div>
              <Label>Search by Name or Contact</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <Label>Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Label>Start Date</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick start date"
                  onClick={() => openPicker(startDateRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={startDateRef}
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <Label>End Date</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick end date"
                  onClick={() => openPicker(endDateRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={endDateRef}
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <Label>From Time</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick start time"
                  onClick={() => openPicker(fromRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={fromRef}
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
            <div>
              <Label>To Time</Label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Pick end time"
                  onClick={() => openPicker(toRef.current)}
                  className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-accent text-gray-500"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <Input 
                  ref={toRef}
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button 
              onClick={resetFilters} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({filteredPatients.length} appointments)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium">Patient Name</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Doctor</th>
                    <th className="text-left py-3 px-4 font-medium">OPD Fee</th>
                    <th className="text-left py-3 px-4 font-medium">Lab Fee</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const totalFees = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
                    return (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(patient.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium">{patient.patient_name}</td>
                        <td className="py-3 px-4">{patient.contact_number}</td>
                        <td className="py-3 px-4">{patient.doctor_name}</td>
                        <td className="py-3 px-4">Rs. {patient.opd_fee || 0}</td>
                        <td className="py-3 px-4">Rs. {patient.lab_fee || 0}</td>
                        <td className="py-3 px-4 font-semibold">Rs. {totalFees}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


