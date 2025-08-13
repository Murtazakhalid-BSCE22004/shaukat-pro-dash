import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabasePatientsService, type Patient } from "@/services/supabasePatientsService";
import { FEE_CATEGORIES, computeVisitSplit, formatMoney, isoDateOnly } from "@/utils/finance";
import { Printer, Download, Calendar, Users, DollarSign, TrendingUp, Building2, ArrowLeft } from "lucide-react";
import HospitalLogo from "@/components/ui/HospitalLogo";

type ReportType = 'doctor_performance' | 'patient_volume' | 'revenue_analysis' | 'payment_status' | 'hospital_profit';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportData {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: any[];
  columns: string[];
}

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('doctor_performance');
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  // Helper function to format dates in local timezone
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(formatLocalDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))); // 30 days ago
  const [endDate, setEndDate] = useState(formatLocalDate(new Date()));

  // Function to calculate dates based on time range
  const calculateDatesForTimeRange = (range: TimeRange) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    console.log('Current date (now):', now.toISOString(), 'Local:', now.toLocaleDateString());

    switch (range) {
      case 'daily':
        // For daily, use the same date for both start and end
        // Create dates using local time to avoid timezone issues
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        console.log('Daily dates created:', { 
          start: start.toISOString(), 
          startLocal: start.toLocaleDateString(),
          end: end.toISOString(), 
          endLocal: end.toLocaleDateString() 
        });
        break;
      case 'weekly':
        // Start from Monday of current week
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
    }

    const result = {
      start: formatLocalDate(start),
      end: formatLocalDate(end)
    };

    console.log('Final formatted dates:', result);
    return result;
  };

  // Effect to automatically update dates when time range changes
  useEffect(() => {
    const { start, end } = calculateDatesForTimeRange(timeRange);
    console.log(`Time range changed to ${timeRange}:`, { start, end, timeRange });
    setStartDate(start);
    setEndDate(end);
  }, [timeRange]);

  // Handle manual date changes
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    // If user manually changes dates, we could optionally reset time range to 'custom'
    // For now, we'll allow manual override
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    // If user manually changes dates, we could optionally reset time range to 'custom'
    // For now, we'll allow manual override
  };

  // Fetch data
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'date-range', startDate, endDate],
    queryFn: async () => {
      // Use local timezone to avoid UTC conversion issues
      const startISO = `${startDate}T00:00:00.000+05:00`;
      const endISO = `${endDate}T23:59:59.999+05:00`;
      return await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
    },
  });

  // Generate report data based on selection
  const reportData = useMemo((): ReportData => {
    switch (selectedReport) {
      case 'doctor_performance':
        return generateDoctorPerformanceReport(doctors, patients);
      case 'patient_volume':
        return generatePatientVolumeReport(patients);
      case 'revenue_analysis':
        return generateRevenueAnalysisReport(doctors, patients);
      case 'payment_status':
        return generatePaymentStatusReport(patients);
      case 'hospital_profit':
        return generateHospitalProfitReport(doctors, patients);
      default:
        return generateDoctorPerformanceReport(doctors, patients);
    }
  }, [selectedReport, doctors, patients]);

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Export to PDF (placeholder - you can implement actual PDF generation)
  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0 print:relative">
      
      <Helmet>
        <title>Reports | Shaukat International Hospital</title>
        <meta name="description" content="Comprehensive reports for doctors, patients, revenue, and hospital operations." />
      </Helmet>

      <div className="container mx-auto px-4 print:px-0">
        {/* Header Section */}
        <section className="mb-8 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Link to="/professional">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive insights into hospital operations and performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handlePrint} variant="outline" className="print:hidden">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <div className="print:hidden text-xs text-gray-500 mt-2">
                <p>💡 Tip: Use landscape orientation for better table layout</p>
              </div>
              <Button onClick={handleExport} variant="outline" className="print:hidden">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </section>

        {/* Report Controls */}
        <section className="mb-8 print:hidden">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">Report Type</label>
                  <Select value={selectedReport} onValueChange={(value: ReportType) => setSelectedReport(value)}>
                    <SelectTrigger className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 group-hover:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor_performance">Doctor Performance</SelectItem>
                      <SelectItem value="patient_volume">Patient Volume</SelectItem>
                      <SelectItem value="revenue_analysis">Daily Revenue</SelectItem>
                      <SelectItem value="hospital_profit">Hospital Profit</SelectItem>
                      <SelectItem value="payment_status">Payment Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">Time Range</label>
                  <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                    <SelectTrigger className="h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 group-hover:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Dates will be automatically set based on selection</p>
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                    Start Date
                    {timeRange !== 'daily' && <span className="text-xs text-blue-600 ml-1">(Auto)</span>}
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300 ${timeRange !== 'daily' ? 'bg-blue-50 border-blue-200' : ''}`}
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                    End Date
                    {timeRange !== 'daily' && <span className="text-xs text-blue-600 ml-1">(Auto)</span>}
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className={`h-10 border border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-blue-300 bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group-hover:border-blue-300 ${timeRange !== 'daily' ? 'bg-blue-50 border-blue-200' : ''}`}
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
                <div className="md:col-span-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const { start, end } = calculateDatesForTimeRange(timeRange);
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Reset to Auto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Report Header */}
        <section className="mb-8">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="text-center print:pb-2">
              {/* Print Header with Logo - Only visible when printing */}
              <div className="hidden print:block print:mb-6 print:border-b-2 print:border-gray-400 print:pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="print:w-24 print:h-24 print:mr-6 print:flex-shrink-0">
                    <HospitalLogo size="lg" className="print:w-full print:h-full" />
                  </div>
                  <div className="text-center print:flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Shaukat International Hospital</h1>
                    <p className="text-lg text-gray-600 print:text-base mt-1">Professional Healthcare Services</p>
                    <p className="text-sm text-gray-500 print:text-xs mt-1">Quality Care, Trusted Results</p>
                  </div>
                </div>
                <div className="text-center mt-4 print:border-t print:border-gray-300 print:pt-4">
                  <h2 className="text-2xl font-bold text-gray-800 print:text-xl">{reportData.title}</h2>
                  <p className="text-gray-600 print:text-sm mt-2">{reportData.description}</p>
                </div>
              </div>
              
              {/* Screen Header - Hidden when printing */}
              <div className="print:hidden">
                <div className="flex items-center justify-center mb-4 print:mb-2">
                  {reportData.icon}
                  <h2 className="text-2xl font-bold text-gray-800 ml-3 print:text-xl">{reportData.title}</h2>
                </div>
                <p className="text-gray-600 print:text-sm">{reportData.description}</p>
              </div>
              
              {/* Report Period Information */}
              <div className="mt-4 print:mt-2 text-sm text-gray-500">
                <div className="print:flex print:justify-between print:items-center print:border-t print:border-gray-200 print:pt-2">
                  <div>
                    <span className="font-medium">Report Period:</span> {startDate} to {endDate}
                    {timeRange !== 'daily' && <span className="text-blue-600 ml-2">(Auto-set for {timeRange})</span>}
                  </div>
                  <div className="print:block hidden">
                    <span className="font-medium">Generated:</span> {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div className="print:hidden">
                  <span className="font-medium ml-2">Generated:</span> {new Date().toLocaleDateString()}
                </div>
                <div className="print:hidden">
                  <span className="text-xs text-gray-400">
                    Debug: Current timezone offset: {new Date().getTimezoneOffset()} minutes
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Report Content */}
        <section className="mb-8">
          <Card className="print:shadow-none print:border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="print:w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 print:bg-gray-100 print:border-b-2 print:border-gray-400">
                      {reportData.columns.map((column, index) => (
                        <TableHead key={index} className="font-semibold text-gray-700 text-center print:text-sm print:py-2 print:border print:border-gray-300">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-gray-50 print:hover:bg-transparent print:border-b print:border-gray-200">
                        {Object.values(row).map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="text-center print:text-sm print:py-2 print:border print:border-gray-200">
                            {typeof cell === 'number' ? formatMoney(cell) : String(cell)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Report Summary */}
        <section className="print:break-inside-avoid">
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 print:text-lg">Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg print:bg-blue-100 print:border print:border-blue-300">
                  <div className="text-2xl font-bold text-blue-600 print:text-xl">
                    {reportData.data.length}
                  </div>
                  <div className="text-sm text-blue-600 print:text-blue-800">Total Records</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg print:bg-green-100 print:border print:border-green-300">
                  <div className="text-2xl font-bold text-green-600 print:text-xl">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-green-600 print:text-green-800">Report Date</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg print:bg-purple-100 print:border print:border-purple-300">
                  <div className="text-2xl font-bold text-purple-600 print:text-xl">
                    {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                  </div>
                  <div className="text-sm text-purple-600 print:text-purple-800">Time Period</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Print Footer - Only visible when printing */}
        <section className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
          <div className="text-center text-sm text-gray-600">
            <div className="print:mb-4 print:p-4 print:bg-gray-50 print:rounded-lg print:border print:border-gray-200">
              <p className="font-semibold">Official Document</p>
              <p>This report was generated by Shaukat International Hospital Management System</p>
              <p className="mt-1">For any queries, please contact the administration office</p>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <span>Page 1 of 1</span>
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

// Report generation functions
function generateDoctorPerformanceReport(doctors: Doctor[], patients: Patient[]): ReportData {
  const doctorStats = doctors.map(doctor => {
    const doctorPatients = patients.filter(p => p.doctor_name === doctor.name);
    
    // Calculate revenue splits for each patient
    let totalRevenue = 0;
    let hospitalProfit = 0;
    let doctorProfit = 0;
    
    doctorPatients.forEach(patient => {
      // Convert patient to visit format for computeVisitSplit
      const visitData = {
        id: patient.id,
        patientName: patient.patient_name,
        contact: patient.contact_number,
        doctorId: doctor.id,
        date: patient.created_at,
        fees: {
          OPD: patient.opd_fee || 0,
          LAB: patient.lab_fee || 0,
          OT: patient.ot_fee || 0,
          ULTRASOUND: patient.ultrasound_fee || 0,
          ECG: patient.ecg_fee || 0,
        },
      };

      const doctorData = {
        id: doctor.id,
        name: doctor.name,
        percentages: {
          OPD: doctor.opd_percentage ?? 0,
          LAB: doctor.lab_percentage ?? 0,
          OT: doctor.ot_percentage ?? 0,
          ULTRASOUND: doctor.ultrasound_percentage ?? 0,
          ECG: doctor.ecg_percentage ?? 0,
        },
        createdAt: doctor.created_at,
      };

      const split = computeVisitSplit(visitData, doctorData);
      totalRevenue += split.feeTotal;
      hospitalProfit += split.hospitalTotal;
      doctorProfit += split.doctorTotal;
    });
    
    return {
      'Doctor Name': doctor.name,
      'Specialization': doctor.specialization || 'N/A',
      'Patient Count': doctorPatients.length,
      'Total Revenue': totalRevenue,
      'Hospital Profit': hospitalProfit,
      'Doctor Profit': doctorProfit,
      'Hospital %': totalRevenue > 0 ? `${((hospitalProfit / totalRevenue) * 100).toFixed(1)}%` : '0%',
    };
  });

  return {
    title: 'Doctor Performance Report',
    description: 'Comprehensive analysis of doctor performance including patient count, revenue, and hospital vs doctor profit splits',
    icon: <Users className="w-8 h-8 text-blue-600" />,
    data: doctorStats,
    columns: ['Doctor Name', 'Specialization', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %']
  };
}

function generatePatientVolumeReport(patients: Patient[]): ReportData {
  const dailyStats = patients.reduce((acc, patient) => {
    const date = new Date(patient.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, count: 0, totalRevenue: 0, hospitalProfit: 0, doctorProfit: 0 };
    }
    
    const totalPatientRevenue = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
    
    // For patient volume report, we'll show total revenue since we don't have doctor info here
    acc[date].count++;
    acc[date].totalRevenue += totalPatientRevenue;
    acc[date].hospitalProfit += totalPatientRevenue; // Assuming 100% hospital profit for this report
    acc[date].doctorProfit += 0; // No doctor split in this context
    
    return acc;
  }, {} as Record<string, { date: string; count: number; totalRevenue: number; hospitalProfit: number; doctorProfit: number }>);

  const data = Object.values(dailyStats).map(stat => ({
    'Date': stat.date,
    'Patient Count': stat.count,
    'Total Revenue': stat.totalRevenue,
    'Hospital Profit': stat.hospitalProfit,
    'Average Revenue per Patient': stat.count > 0 ? stat.totalRevenue / stat.count : 0,
  }));

  return {
    title: 'Patient Volume Report',
    description: 'Daily patient volume trends and revenue analysis',
    icon: <TrendingUp className="w-8 h-8 text-green-600" />,
    data: data,
    columns: ['Date', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Average Revenue per Patient']
  };
}

function generateRevenueAnalysisReport(doctors: Doctor[], patients: Patient[]): ReportData {
  // Calculate revenue by category with hospital vs doctor profit splits
  const revenueByCategory = FEE_CATEGORIES.reduce((acc, category) => {
    const categoryKey = category.toLowerCase().replace(' ', '_') + '_fee';
    let total = 0;
    let hospitalProfit = 0;
    let doctorProfit = 0;
    
    patients.forEach(patient => {
      const fee = patient[categoryKey as keyof Patient] as number || 0;
      total += fee;
      
      // Find the doctor for this patient to calculate splits
      const doctor = doctors.find(d => d.name === patient.doctor_name);
      if (doctor) {
        const percentageKey = category.toLowerCase().replace(' ', '_') + '_percentage';
        const doctorPercentage = doctor[percentageKey as keyof Doctor] as number || 0;
        const doctorAmount = fee * (doctorPercentage / 100);
        const hospitalAmount = fee - doctorAmount;
        
        hospitalProfit += hospitalAmount;
        doctorProfit += doctorAmount;
      } else {
        // If no doctor found, assume 100% hospital profit
        hospitalProfit += fee;
      }
    });
    
    acc[category] = { total, hospital: hospitalProfit, doctor: doctorProfit };
    return acc;
  }, {} as Record<string, { total: number; hospital: number; doctor: number }>);

  const data = Object.entries(revenueByCategory).map(([category, amounts]) => ({
    'Fee Category': category,
    'Total Revenue': amounts.total,
    'Hospital Profit': amounts.hospital,
    'Doctor Profit': amounts.doctor,
    'Hospital %': amounts.total > 0 ? `${((amounts.hospital / amounts.total) * 100).toFixed(1)}%` : '0%',
    'Patient Count': patients.filter(p => (p[category.toLowerCase().replace(' ', '_') + '_fee' as keyof Patient] as number || 0) > 0).length,
  }));

  return {
    title: 'Daily Revenue Report',
    description: 'Daily revenue breakdown by fee categories with hospital vs doctor profit splits',
    icon: <DollarSign className="w-8 h-8 text-green-600" />,
    data: data,
    columns: ['Fee Category', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %', 'Patient Count']
  };
}

function generatePaymentStatusReport(patients: Patient[]): ReportData {
  const paymentStatus = patients.map(patient => {
    const totalFees = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
    return {
      'Patient Name': patient.patient_name,
      'Contact': patient.contact_number,
      'Doctor': patient.doctor_name,
      'Total Fees': totalFees,
      'Date': new Date(patient.created_at).toLocaleDateString(),
      'Status': totalFees > 0 ? 'Pending' : 'No Fees',
    };
  });

  return {
    title: 'Payment Status Report',
    description: 'Overview of patient payment status and outstanding amounts',
    icon: <Calendar className="w-8 h-8 text-purple-600" />,
    data: paymentStatus,
    columns: ['Patient Name', 'Contact', 'Doctor', 'Total Fees', 'Date', 'Status']
  };
}

function generateHospitalProfitReport(doctors: Doctor[], patients: Patient[]): ReportData {
  // Calculate comprehensive hospital profit metrics
  let totalHospitalProfit = 0;
  let totalDoctorProfit = 0;
  let totalRevenue = 0;
  let patientCount = 0;
  
  const revenueByDoctor: Record<string, { 
    doctorName: string; 
    patientCount: number; 
    totalRevenue: number; 
    hospitalProfit: number; 
    doctorProfit: number; 
    hospitalPercentage: number;
  }> = {};

  // Initialize doctor revenue tracking
  doctors.forEach(doctor => {
    revenueByDoctor[doctor.id] = {
      doctorName: doctor.name,
      patientCount: 0,
      totalRevenue: 0,
      hospitalProfit: 0,
      doctorProfit: 0,
      hospitalPercentage: 0,
    };
  });

  // Calculate revenue splits for each patient
  patients.forEach(patient => {
    const totalPatientRevenue = (patient.opd_fee || 0) + (patient.lab_fee || 0) + (patient.ot_fee || 0) + (patient.ultrasound_fee || 0) + (patient.ecg_fee || 0);
    
    // Find the doctor for this patient
    const doctor = doctors.find(d => d.name === patient.doctor_name);
    
    if (doctor) {
      // Calculate splits using computeVisitSplit
      const visitData = {
        id: patient.id,
        patientName: patient.patient_name,
        contact: patient.contact_number,
        doctorId: doctor.id,
        date: patient.created_at,
        fees: {
          OPD: patient.opd_fee || 0,
          LAB: patient.lab_fee || 0,
          OT: patient.ot_fee || 0,
          ULTRASOUND: patient.ultrasound_fee || 0,
          ECG: patient.ecg_fee || 0,
        },
      };

      const doctorData = {
        id: doctor.id,
        name: doctor.name,
        percentages: {
          OPD: doctor.opd_percentage ?? 0,
          LAB: doctor.lab_percentage ?? 0,
          OT: doctor.ot_percentage ?? 0,
          ULTRASOUND: doctor.ultrasound_percentage ?? 0,
          ECG: doctor.ecg_percentage ?? 0,
        },
        createdAt: doctor.created_at,
      };

      const split = computeVisitSplit(visitData, doctorData);
      
      // Update totals
      totalRevenue += split.feeTotal;
      totalHospitalProfit += split.hospitalTotal;
      totalDoctorProfit += split.doctorTotal;
      patientCount++;
      
      // Update doctor-specific totals
      const doctorRevenue = revenueByDoctor[doctor.id];
      if (doctorRevenue) {
        doctorRevenue.patientCount++;
        doctorRevenue.totalRevenue += split.feeTotal;
        doctorRevenue.hospitalProfit += split.hospitalTotal;
        doctorRevenue.doctorProfit += split.doctorTotal;
        doctorRevenue.hospitalPercentage = split.feeTotal > 0 ? (split.hospitalTotal / split.feeTotal) * 100 : 0;
      }
    } else {
      // If no doctor found, assume 100% hospital profit
      totalRevenue += totalPatientRevenue;
      totalHospitalProfit += totalPatientRevenue;
      patientCount++;
    }
  });

  // Convert to table format
  const data = Object.values(revenueByDoctor)
    .filter(doc => doc.patientCount > 0) // Only show doctors with patients
    .map(doc => ({
      'Doctor Name': doc.doctorName,
      'Patient Count': doc.patientCount,
      'Total Revenue': doc.totalRevenue,
      'Hospital Profit': doc.hospitalProfit,
      'Doctor Profit': doc.doctorProfit,
      'Hospital %': `${doc.hospitalPercentage.toFixed(1)}%`,
    }));

  // Add summary row
  data.unshift({
    'Doctor Name': 'TOTAL',
    'Patient Count': patientCount,
    'Total Revenue': totalRevenue,
    'Hospital Profit': totalHospitalProfit,
    'Doctor Profit': totalDoctorProfit,
    'Hospital %': totalRevenue > 0 ? `${((totalHospitalProfit / totalRevenue) * 100).toFixed(1)}%` : '0%',
  });

  return {
    title: 'Hospital Profit Report',
    description: 'Comprehensive breakdown of hospital profit vs doctor payouts with detailed doctor-wise analysis',
    icon: <Building2 className="w-8 h-8 text-blue-600" />,
    data: data,
    columns: ['Doctor Name', 'Patient Count', 'Total Revenue', 'Hospital Profit', 'Doctor Profit', 'Hospital %']
  };
}

export default ReportsPage;
