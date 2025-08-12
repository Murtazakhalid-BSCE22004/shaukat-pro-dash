import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabaseVisitsService } from "@/services/supabaseVisitsService";
import { supabasePatientsService } from "@/services/supabasePatientsService";
import { toast } from "sonner";
import { ArrowLeft, Plus, BarChart3, TrendingUp, Users, Activity, DollarSign, Calendar, Filter, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PeriodSelector from "@/components/ui/period-selector";
import { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const DoctorsPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [opdPercentage, setOpdPercentage] = useState(0);
  const [labPercentage, setLabPercentage] = useState(0);
  const [ultrasoundPercentage, setUltrasoundPercentage] = useState(0);
  const [ecgPercentage, setEcgPercentage] = useState(0);
  const [otPercentage, setOtPercentage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Analytics state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  // Fetch all doctors
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  // Fetch additional data for analytics
  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: supabaseVisitsService.getAllVisits,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: supabasePatientsService.getAllPatients,
  });

  // Create or update doctor mutation
  const saveDoctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      if (editingId) {
        return await supabaseDoctorsService.updateDoctor(editingId, doctorData);
      } else {
        return await supabaseDoctorsService.createDoctor(doctorData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success(editingId ? "Doctor updated successfully" : "Doctor added successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Error saving doctor: " + (error?.message || error));
    }
  });

  const resetForm = () => {
    setName("");
    setQualification("");
    setOpdPercentage(0);
    setLabPercentage(0);
    setUltrasoundPercentage(0);
    setEcgPercentage(0);
    setOtPercentage(0);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    if (!qualification.trim()) {
      toast.error("Qualification is required");
      return;
    }

    const doctorData = {
      name: name.trim(),
      qualification: qualification.trim(),
      specialization: "General", // Default value for existing schema
      consultation_fee: 0, // Default value for existing schema
      experience_years: 0, // Default value for existing schema
      opd_percentage: opdPercentage,
      lab_percentage: labPercentage,
      ultrasound_percentage: ultrasoundPercentage,
      ecg_percentage: ecgPercentage,
      ot_percentage: otPercentage,
      is_active: true,
    };
    
    saveDoctorMutation.mutate(doctorData);
  };

  const startEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setName(doctor.name);
    setQualification(doctor.qualification || "");
    setOpdPercentage(doctor.opd_percentage || 0);
    setLabPercentage(doctor.lab_percentage || 0);
    setUltrasoundPercentage(doctor.ultrasound_percentage || 0);
    setEcgPercentage(doctor.ecg_percentage || 0);
    setOtPercentage(doctor.ot_percentage || 0);
  };

  const removeDoctor = async (id: string) => {
    try {
      await supabaseDoctorsService.deleteDoctor(id);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success("Doctor removed successfully");
      if (editingId === id) resetForm();
    } catch (error) {
      toast.error("Error removing doctor");
    }
  };

  // Analytics calculations
  const analyticsData = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => d.is_active).length,
    totalVisits: visits.length,
    totalPatients: patients.length,
    
    // Filter data by date range
    filteredVisits: dateRange?.from && dateRange?.to ? visits.filter(v => {
      const visitDate = new Date(v.visit_date);
      return visitDate >= dateRange.from! && visitDate <= dateRange.to!;
    }) : visits,
    
    filteredPatients: dateRange?.from && dateRange?.to ? patients.filter(p => {
      const patientDate = new Date(p.created_at);
      return patientDate >= dateRange.from! && patientDate <= dateRange.to!;
    }) : patients,
    
    // Doctor performance data
    doctorPerformance: doctors.map(doctor => {
      const doctorVisits = visits.filter(v => v.doctor_id === doctor.id);
      const doctorRevenue = doctorVisits.reduce((sum, v) => 
        sum + (v.opd_fee || 0) + (v.lab_fee || 0) + (v.ultrasound_fee || 0) + (v.ecg_fee || 0) + (v.ot_fee || 0), 0
      );
      return {
        name: doctor.name,
        visits: doctorVisits.length,
        revenue: doctorRevenue,
        avgRevenue: doctorVisits.length > 0 ? doctorRevenue / doctorVisits.length : 0,
        patients: patients.filter(p => p.doctor_name === doctor.name).length
      };
    }).sort((a, b) => b.revenue - a.revenue),

    // Monthly trends (last 6 months)
    monthlyTrends: Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthVisits = visits.filter(v => {
        const visitDate = new Date(v.visit_date);
        return visitDate.getMonth() === month.getMonth() && visitDate.getFullYear() === month.getFullYear();
      });
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        visits: monthVisits.length,
        revenue: monthVisits.reduce((sum, v) => 
          sum + (v.opd_fee || 0) + (v.lab_fee || 0) + (v.ultrasound_fee || 0) + (v.ecg_fee || 0) + (v.ot_fee || 0), 0
        )
      };
    }).reverse(),

    // Specialization distribution
    specializationData: doctors.reduce((acc, doctor) => {
      const spec = doctor.specialization || 'General';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    quinary: '#8B5CF6'
  };

  // Get period display text
  const getPeriodDisplayText = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return 'Select date range';
    }

    const now = new Date();
    const from = dateRange.from;
    const to = dateRange.to;

    // Check for Today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (from.toDateString() === today.toDateString() && to.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check for Yesterday
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (from.toDateString() === yesterday.toDateString() && to.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check for This Week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (from.toDateString() === weekStart.toDateString() && to.toDateString() === weekEnd.toDateString()) {
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

    // For custom ranges, show a shorter format
    return `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  };

  return (
    <>
      <Helmet>
        <title>Doctors | Shaukat International Hospital</title>
        <meta name="description" content="Manage doctors and their details for the hospital system." />
      </Helmet>

      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
              <p className="text-gray-600 mt-2">Manage doctor profiles and view analytics</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={resetForm}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Doctor
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'analytics')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Doctor List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-600" />
              {editingId ? "Edit Doctor" : "Add New Doctor"}
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
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Ahmed Khan"
                      required
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
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      Qualification <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="MBBS, FCPS"
                      required
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
              </div>

              {/* Percentage Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Percentage Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      OPD Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="opdPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={opdPercentage}
                        onChange={(e) => setOpdPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
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
                      Lab Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="labPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={labPercentage}
                        onChange={(e) => setLabPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
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
                      Ultrasound Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="ultrasoundPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={ultrasoundPercentage}
                        onChange={(e) => setUltrasoundPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
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
                      ECG Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="ecgPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={ecgPercentage}
                        onChange={(e) => setEcgPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
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
                      OT Percentage
                    </Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">%</span>
                      <Input
                        id="otPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={otPercentage}
                        onChange={(e) => setOtPercentage(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 group-hover:border-blue-300"
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
                  disabled={saveDoctorMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 border-0"
                >
                  {saveDoctorMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    editingId ? "Update Doctor" : "Add Doctor"
                  )}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="px-5 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white text-gray-700"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800">Doctors List</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Showing</span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{doctors.length}</span>
                <span className="text-sm text-gray-600">doctors</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-600 mb-1">No doctors found</p>
                <p className="text-sm text-gray-500">Add your first doctor to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">Name</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">Qualification</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">OPD %</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">Lab %</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">Ultrasound %</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">ECG %</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">OT %</TableHead>
                      <TableHead className="font-medium text-gray-700 py-3 text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor: Doctor, index: number) => (
                      <TableRow 
                        key={doctor.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <TableCell className="font-medium text-gray-900 py-3">{doctor.name}</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.qualification || "N/A"}</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.opd_percentage || 0}%</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.lab_percentage || 0}%</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.ultrasound_percentage || 0}%</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.ecg_percentage || 0}%</TableCell>
                        <TableCell className="text-gray-700 py-3">{doctor.ot_percentage || 0}%</TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(doctor)}
                              className="h-7 px-2.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeDoctor(doctor.id)}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Header with Period Selector */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Doctor Analytics
                </CardTitle>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsPeriodSelectorOpen(true)}
                >
                  <Calendar className="h-4 w-4" />
                  {getPeriodDisplayText()}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Doctors</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalDoctors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Doctors</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.activeDoctors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Visits</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.filteredVisits.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Rs. {analyticsData.filteredVisits.reduce((sum, v) => 
                        sum + (v.opd_fee || 0) + (v.lab_fee || 0) + (v.ultrasound_fee || 0) + (v.ecg_fee || 0) + (v.ot_fee || 0), 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctor Performance Bar Chart */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Doctor Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsData.doctorPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.doctorPerformance.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specialization Distribution Pie Chart */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <PieChart className="w-4 h-4 text-green-600" />
                    Specialization Distribution
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {Object.keys(analyticsData.specializationData).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analyticsData.specializationData).map(([spec, count]) => ({
                          name: spec,
                          value: count,
                          color: chartColors.primary
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analyticsData.specializationData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors.primary} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Doctors']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <RechartsPieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No specialization data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trends Line Chart */}
            <Card className="border border-gray-200 shadow-sm bg-white lg:col-span-2">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsData.monthlyTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'visits' ? value : `Rs. ${Number(value).toLocaleString()}`, 
                          name === 'visits' ? 'Visits' : 'Revenue'
                        ]} 
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Period Selector Modal */}
      <PeriodSelector
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isOpen={isPeriodSelectorOpen}
        onClose={() => setIsPeriodSelectorOpen(false)}
      />
      </div>
    </>
  );
};

export default DoctorsPage;
