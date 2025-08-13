import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PeriodSelector from "@/components/ui/period-selector";
import { DateRange } from "react-day-picker";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Wallet,
  Banknote,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  SortAsc,
  SortDesc,
  ArrowLeft
} from "lucide-react";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabasePatientsService } from "@/services/supabasePatientsService";
import { formatMoney, FEE_CATEGORIES } from "@/utils/finance";

interface RevenueData {
  totalRevenue: number;
  hospitalRevenue: number;
  doctorRevenue: number;
  patientCount: number;
  doctorBreakdown: {
    [doctorId: string]: {
      doctor: Doctor;
      totalRevenue: number;
      hospitalRevenue: number;
      doctorRevenue: number;
      patientCount: number;
      categoryBreakdown: {
        [category: string]: {
          total: number;
          hospital: number;
          doctor: number;
        };
      };
    };
  };
}

type SortField = 'name' | 'visits' | 'totalRevenue' | 'hospitalRevenue' | 'doctorRevenue' | 'profitMargin';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const RevenueDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'totalRevenue',
    direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);

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
  
  // Debug: Check what today should be
  const today = new Date();
  console.log('Current date info:', {
    today: today,
    todayString: today.toDateString(),
    todayISO: today.toISOString(),
    todayLocal: today.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Debug logging for date range
  console.log('Current dateRange:', dateRange);
  if (dateRange?.from && dateRange?.to) {
    console.log('Date range details:', {
      from: dateRange.from,
      to: dateRange.to,
      fromString: dateRange.from.toDateString(),
      toString: dateRange.to.toDateString(),
      isSameDay: dateRange.from.toDateString() === dateRange.to.toDateString()
    });
  }
  console.log('Processed startDate, endDate:', { startDate, endDate });

  // Test: Get all patients to see if there are any
  const { data: allPatients = [] } = useQuery({
    queryKey: ['all-patients'],
    queryFn: supabasePatientsService.getAllPatients,
  });
  
  console.log('Total patients in database:', allPatients.length);
  if (allPatients.length > 0) {
    console.log('Sample patient created_at:', allPatients[0].created_at);
  }

  // Fetch doctors and patients
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'date-range', startDate, endDate],
    queryFn: async () => {
      // Use Supabase patients by created_at range
      // For better precision, use start of day and start of next day
      // Use local timezone to avoid UTC conversion issues
      const startISO = `${startDate}T00:00:00.000+05:00`;
      
      // For end date, use start of next day to avoid timezone precision issues
      // This approach: startDate <= created_at < endDate (next day start)
      // is more reliable than: startDate <= created_at <= endDate (end of day)
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayYear = nextDay.getFullYear();
      const nextDayMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
      const nextDayDate = String(nextDay.getDate()).padStart(2, '0');
      const endISO = `${nextDayYear}-${nextDayMonth}-${nextDayDate}T00:00:00.000+05:00`;
      
      console.log('Fetching patients for date range:', { startDate, endDate, startISO, endISO });
      console.log('Date objects:', { 
        startDateObj: new Date(startDate), 
        endDateObj: new Date(endDate),
        startISOObj: new Date(startISO),
        endISOObj: new Date(endISO)
      });
      
      // Additional debugging for same-day ranges
      if (startDate === endDate) {
        console.log('Same-day range detected. Checking timezone handling:');
        console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('startDate (local):', startDate);
        console.log('startISO (UTC):', startISO);
        console.log('endISO (UTC):', endISO);
        console.log('Patient created_at (from console):', '2025-08-10T08:48:55.810664+00:00');
        console.log('Is patient created_at >= startISO?', '2025-08-10T08:48:55.810664+00:00' >= startISO);
        console.log('Is patient created_at < endISO?', '2025-08-10T08:48:55.810664+00:00' < endISO);
      }
      
      const result = await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
      console.log('Fetched patients count:', result.length);
      
      return result;
    },
  });

  // Calculate revenue data
  const revenueData = useMemo<RevenueData>(() => {
    const doctorBreakdown: RevenueData['doctorBreakdown'] = {};
    let totalRevenue = 0;
    let hospitalRevenue = 0;
    let doctorRevenue = 0;
    let patientCount = 0;

    const normalizeName = (s?: string | null) => (s || "")
      .toLowerCase()
      .replace(/^dr\.?\s+/, "")
      .trim();

    // Initialize doctor breakdown
    doctors.forEach(doctor => {
      doctorBreakdown[doctor.id] = {
        doctor,
        totalRevenue: 0,
        hospitalRevenue: 0,
        doctorRevenue: 0,
        patientCount: 0,
        categoryBreakdown: {
          OPD: { total: 0, hospital: 0, doctor: 0 },
          LAB: { total: 0, hospital: 0, doctor: 0 },
          OT: { total: 0, hospital: 0, doctor: 0 },
          ULTRASOUND: { total: 0, hospital: 0, doctor: 0 },
          ECG: { total: 0, hospital: 0, doctor: 0 },
        },
      };
    });

    // Helper to find the best matching doctor for a given patient doctor_name
    const findDoctor = (name: string | null | undefined) => {
      const norm = normalizeName(name);
      if (!norm) return null;
      // 1) exact (normalized) match
      let doc = doctors.find((d) => normalizeName(d.name) === norm);
      if (doc) return doc;
      // 2) substring either way
      doc = doctors.find((d) => {
        const dn = normalizeName(d.name);
        return dn.includes(norm) || norm.includes(dn);
      });
      if (doc) return doc;
      // 3) first token match (handles first-name only in patients)
      const first = norm.split(/\s+/)[0] ?? "";
      doc = doctors.find((d) => normalizeName(d.name).startsWith(first));
      return doc || null;
    };

    // Process patients
    patients.forEach(patient => {
      const doctor = findDoctor(patient.doctor_name);

      // Calculate patient revenue
      const patientRevenue = {
        OPD: patient.opd_fee || 0,
        LAB: patient.lab_fee || 0,
        ULTRASOUND: patient.ultrasound_fee || 0,
        ECG: patient.ecg_fee || 0,
      };

      const totalPatientRevenue = Object.values(patientRevenue).reduce((sum, fee) => sum + fee, 0);

      // Calculate splits based on doctor percentages
      const splits = doctor
        ? {
            OPD: {
              total: patientRevenue.OPD,
              hospital: patientRevenue.OPD * ((100 - (doctor.opd_percentage || 0)) / 100),
              doctor: patientRevenue.OPD * ((doctor.opd_percentage || 0) / 100),
            },
            LAB: {
              total: patientRevenue.LAB,
              hospital: patientRevenue.LAB * ((100 - (doctor.lab_percentage || 0)) / 100),
              doctor: patientRevenue.LAB * ((doctor.lab_percentage || 0) / 100),
            },
            ULTRASOUND: {
              total: patientRevenue.ULTRASOUND,
              hospital: patientRevenue.ULTRASOUND * ((100 - (doctor.ultrasound_percentage || 0)) / 100),
              doctor: patientRevenue.ULTRASOUND * ((doctor.ultrasound_percentage || 0) / 100),
            },
            ECG: {
              total: patientRevenue.ECG,
              hospital: patientRevenue.ECG * ((100 - (doctor.ecg_percentage || 0)) / 100),
              doctor: patientRevenue.ECG * ((doctor.ecg_percentage || 0) / 100),
            },
          }
        : {
            OPD: { total: patientRevenue.OPD, hospital: patientRevenue.OPD, doctor: 0 },
            LAB: { total: patientRevenue.LAB, hospital: patientRevenue.LAB, doctor: 0 },
            ULTRASOUND: { total: patientRevenue.ULTRASOUND, hospital: patientRevenue.ULTRASOUND, doctor: 0 },
            ECG: { total: patientRevenue.ECG, hospital: patientRevenue.ECG, doctor: 0 },
          };

      // Update totals
      totalRevenue += totalPatientRevenue;
      hospitalRevenue += splits.OPD.hospital + splits.LAB.hospital + splits.ULTRASOUND.hospital + splits.ECG.hospital;
      doctorRevenue += splits.OPD.doctor + splits.LAB.doctor + splits.ULTRASOUND.doctor + splits.ECG.doctor;
      patientCount++;

      // Update doctor breakdown
      if (doctor) {
        const doctorData = doctorBreakdown[doctor.id];
        if (doctorData) {
          doctorData.totalRevenue += totalPatientRevenue;
          doctorData.hospitalRevenue += splits.OPD.hospital + splits.LAB.hospital + splits.ULTRASOUND.hospital + splits.ECG.hospital;
          doctorData.doctorRevenue += splits.OPD.doctor + splits.LAB.doctor + splits.ULTRASOUND.doctor + splits.ECG.doctor;
          doctorData.patientCount++;

          // Update category breakdown
          FEE_CATEGORIES.forEach(category => {
            const categoryData = doctorData.categoryBreakdown[category];
            if (categoryData) {
              categoryData.total += splits[category]?.total || 0;
              categoryData.hospital += splits[category]?.hospital || 0;
              categoryData.doctor += splits[category]?.doctor || 0;
            }
          });
        }
      }
    });

    return {
      totalRevenue,
      hospitalRevenue,
      doctorRevenue,
      patientCount,
      doctorBreakdown,
    };
  }, [patients, doctors]);

  // Filter and sort data based on selected doctor and search term
  const filteredAndSortedData = useMemo(() => {
    let filteredData = revenueData;
    
    // Filter by doctor
    if (selectedDoctor !== "all") {
      const doctorData = revenueData.doctorBreakdown[selectedDoctor];
      if (doctorData) {
        filteredData = {
          totalRevenue: doctorData.totalRevenue,
          hospitalRevenue: doctorData.hospitalRevenue,
          doctorRevenue: doctorData.doctorRevenue,
          patientCount: doctorData.patientCount,
          doctorBreakdown: {
            [selectedDoctor]: doctorData,
          },
        };
      }
    }

    // Filter by search term
    let filteredDoctors = Object.values(filteredData.doctorBreakdown);
    if (searchTerm) {
      filteredDoctors = filteredDoctors.filter(data =>
        data.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort doctors based on sortConfig
    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.doctor.name.toLowerCase();
          bValue = b.doctor.name.toLowerCase();
          break;
        case 'visits':
          aValue = a.patientCount;
          bValue = b.patientCount;
          break;
        case 'totalRevenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'hospitalRevenue':
          aValue = a.hospitalRevenue;
          bValue = b.hospitalRevenue;
          break;
        case 'doctorRevenue':
          aValue = a.doctorRevenue;
          bValue = b.doctorRevenue;
          break;
        case 'profitMargin':
          aValue = a.totalRevenue > 0 ? (a.hospitalRevenue / a.totalRevenue) * 100 : 0;
          bValue = b.totalRevenue > 0 ? (b.hospitalRevenue / b.totalRevenue) * 100 : 0;
          break;
        default:
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    // Reconstruct the filtered and sorted data
    const sortedBreakdown: RevenueData['doctorBreakdown'] = {};
    sortedDoctors.forEach(data => {
      sortedBreakdown[data.doctor.id] = data;
    });

    return {
      ...filteredData,
      doctorBreakdown: sortedBreakdown,
    };
  }, [revenueData, selectedDoctor, searchTerm, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatMoney(filteredAndSortedData.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-500",
    },
    {
      title: "Hospital Profit",
      value: formatMoney(filteredAndSortedData.hospitalRevenue),
      icon: Banknote,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    {
      title: "Doctor Payouts",
      value: formatMoney(filteredAndSortedData.doctorRevenue),
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-500",
    },
    {
      title: "Total Patients",
      value: filteredAndSortedData.patientCount.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <main className="container mx-auto py-8">
      <Helmet>
        <title>Revenue Dashboard | Shaukat International Hospital</title>
        <meta name="description" content="Comprehensive revenue dashboard showing hospital profits, doctor payouts, and revenue breakdowns by doctor and date range." />
      </Helmet>

      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Revenue Dashboard</h1>
              <p className="text-lg text-gray-600 font-medium">
                Comprehensive revenue analysis and profit tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <Activity className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-semibold">Real-time data</span>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="md:col-span-2 xl:col-span-1">
                <Label className="text-sm font-medium text-gray-700 mb-2">Period</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group shadow-sm hover:shadow-lg"
                  onClick={() => setIsPeriodSelectorOpen(true)}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    </div>
                    <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900 font-medium truncate">
                      {dateRange?.from && dateRange?.to 
                        ? (() => {
                            const from = dateRange.from;
                            const to = dateRange.to;
                            const today = new Date();
                            
                            // Check if it's Today
                            const todayString = today.toDateString();
                            if (from.toDateString() === todayString && to.toDateString() === todayString) {
                              return "Today";
                            }
                            
                            // Check if it's Yesterday
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayString = yesterday.toDateString();
                            if (from.toDateString() === yesterdayString && to.toDateString() === yesterdayString) {
                              return "Yesterday";
                            }
                            
                            // Check if it's This week (Sunday to Saturday)
                            const weekStart = new Date(today);
                            weekStart.setDate(today.getDate() - today.getDay());
                            const weekStartString = weekStart.toDateString();
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            const weekEndString = weekEnd.toDateString();
                            if (from.toDateString() === weekStartString && to.toDateString() === weekEndString) {
                              return "This Week";
                            }
                            
                            // Check if it's Last week
                            const lastWeekStart = new Date(today);
                            lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                            const lastWeekStartString = lastWeekStart.toDateString();
                            const lastWeekEnd = new Date(lastWeekStart);
                            lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                            const lastWeekEndString = lastWeekEnd.toDateString();
                            if (from.toDateString() === lastWeekStartString && to.toDateString() === lastWeekEndString) {
                              return "Last Week";
                            }
                            
                            // Check if it's This month
                            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                            const monthStartString = monthStart.toDateString();
                            const monthEnd = new Date(today);
                            const monthEndString = monthEnd.toDateString();
                            if (from.toDateString() === monthStartString && to.toDateString() === monthEndString) {
                              return "This Month";
                            }
                            
                            // Check if it's Last month
                            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                            const lastMonthStartString = lastMonthStart.toDateString();
                            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                            const lastMonthEndString = lastMonthEnd.toDateString();
                            if (from.toDateString() === lastMonthStartString && to.toDateString() === lastMonthEndString) {
                              return "Last Month";
                            }
                            
                            // Check if it's This year
                            const yearStart = new Date(today.getFullYear(), 0, 1);
                            const yearStartString = yearStart.toDateString();
                            const yearEnd = new Date(today);
                            const yearEndString = yearEnd.toDateString();
                            if (from.toDateString() === yearStartString && to.toDateString() === yearEndString) {
                              return "This Year";
                            }
                            
                            // Check if it's Last Year
                            const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
                            const lastYearStartString = lastYearStart.toDateString();
                            const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
                            const lastYearEndString = lastYearEnd.toDateString();
                            if (from.toDateString() === lastYearStartString && to.toDateString() === lastYearEndString) {
                              return "Last Year";
                            }
                            
                            // For custom ranges, show a shorter format
                            return `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
                          })()
                        : 'Select date range'
                      }
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </Button>
              </div>
              <div>
                <Label htmlFor="doctor" className="text-sm font-medium text-gray-700 mb-2">Doctor</Label>
                <select
                  id="doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="h-10 w-full border-2 border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md px-3 py-2"
                  style={{ border: '2px solid #d1d5db', outline: 'none', boxShadow: 'none' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLSelectElement;
                    target.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLSelectElement;
                    target.style.borderColor = '#d1d5db';
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLSelectElement;
                    target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLSelectElement;
                    target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="all">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2">Search Doctors</Label>
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 border-2 border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:border-blue-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ border: '2px solid #d1d5db', outline: 'none', boxShadow: 'none' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#d1d5db';
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              <div className="md:col-span-2 xl:col-span-1">
                <Label className="text-sm font-medium text-gray-700 mb-2">Actions</Label>
                <Button 
                  onClick={() => {
                    const today = new Date();
                    setDateRange({ from: today, to: today });
                    setSelectedDoctor("all");
                    setSearchTerm("");
                    setSortConfig({ field: 'totalRevenue', direction: 'desc' });
                  }}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 shadow-sm hover:shadow-lg text-gray-700 hover:text-orange-700 font-medium"
                >
                  Reset to Today
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className={`hover:shadow-lg transition-all duration-300 border-2 ${stat.borderColor} hover:scale-105`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-semibold ${stat.color}`}>{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <p className="text-xs text-gray-500">
                  {dateRange?.from && dateRange?.to 
                    ? `${dateRange.from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} - ${dateRange.to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`
                    : 'Select date range'
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Doctor Breakdown Table with Sorting */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Doctor Revenue Breakdown
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
                {Object.keys(filteredAndSortedData.doctorBreakdown).length} doctors
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Doctor
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('visits')}
                  >
                    <div className="flex items-center gap-2">
                      Visits
                      {getSortIcon('visits')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    <div className="flex items-center gap-2">
                      Total Revenue
                      {getSortIcon('totalRevenue')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('hospitalRevenue')}
                  >
                    <div className="flex items-center gap-2">
                      Hospital Profit
                      {getSortIcon('hospitalRevenue')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('doctorRevenue')}
                  >
                    <div className="flex items-center gap-2">
                      Doctor Payout
                      {getSortIcon('doctorRevenue')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 font-semibold text-gray-700"
                    onClick={() => handleSort('profitMargin')}
                  >
                    <div className="flex items-center gap-2">
                      Profit Margin
                      {getSortIcon('profitMargin')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(filteredAndSortedData.doctorBreakdown).map((data, index) => (
                  <TableRow key={data.doctor.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <TableCell className="font-semibold text-gray-800">{data.doctor.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {data.patientCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 text-lg">{formatMoney(data.totalRevenue)}</TableCell>
                    <TableCell className="font-bold text-blue-600 text-lg">
                      {formatMoney(data.hospitalRevenue)}
                    </TableCell>
                    <TableCell className="font-bold text-purple-600 text-lg">
                      {formatMoney(data.doctorRevenue)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={data.totalRevenue > 0 && (data.hospitalRevenue / data.totalRevenue) > 0.5 ? "default" : "secondary"}
                        className={`${
                          data.totalRevenue > 0 && (data.hospitalRevenue / data.totalRevenue) > 0.5 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-orange-100 text-orange-700 border-orange-200'
                        }`}
                      >
                        {data.totalRevenue > 0 
                          ? `${((data.hospitalRevenue / data.totalRevenue) * 100).toFixed(1)}%`
                          : "0%"
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Enhanced Category Breakdown with Sorting */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <PieChart className="h-5 w-5 text-emerald-600" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEE_CATEGORIES
                .map((category) => {
                  const categoryTotal = Object.values(filteredAndSortedData.doctorBreakdown).reduce(
                    (sum, data) => sum + (data.categoryBreakdown[category]?.total || 0),
                    0
                  );
                  const categoryHospital = Object.values(filteredAndSortedData.doctorBreakdown).reduce(
                    (sum, data) => sum + (data.categoryBreakdown[category]?.hospital || 0),
                    0
                  );
                  const categoryDoctor = Object.values(filteredAndSortedData.doctorBreakdown).reduce(
                    (sum, data) => sum + (data.categoryBreakdown[category]?.doctor || 0),
                    0
                  );

                  return {
                    category,
                    total: categoryTotal,
                    hospital: categoryHospital,
                    doctor: categoryDoctor,
                  };
                })
                .filter(item => item.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((item) => (
                  <Card key={item.category} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:scale-105">
                    <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-emerald-50">
                      <CardTitle className="text-lg flex items-center justify-between text-gray-800">
                        {item.category}
                        <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                          {filteredAndSortedData.totalRevenue > 0 
                            ? `${((item.total / filteredAndSortedData.totalRevenue) * 100).toFixed(1)}%`
                            : "0%"
                          }
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                          <span className="font-bold text-lg text-emerald-600">{formatMoney(item.total)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Hospital Profit</span>
                          <span className="font-bold text-lg text-blue-600">{formatMoney(item.hospital)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Doctor Payout</span>
                          <span className="font-bold text-lg text-purple-600">{formatMoney(item.doctor)}</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Revenue Share</span>
                            <span>{filteredAndSortedData.totalRevenue > 0 ? ((item.total / filteredAndSortedData.totalRevenue) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                              style={{ 
                                width: `${filteredAndSortedData.totalRevenue > 0 ? (item.total / filteredAndSortedData.totalRevenue) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Period Selector Modal */}
      <PeriodSelector
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isOpen={isPeriodSelectorOpen}
        onClose={() => setIsPeriodSelectorOpen(false)}
      />
    </main>
  );
};

export default RevenueDashboard;
