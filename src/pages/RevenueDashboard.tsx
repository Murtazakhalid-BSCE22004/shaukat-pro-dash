import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PeriodSelector from '@/components/ui/period-selector';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
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
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";
import { supabasePatientsService } from "@/services/supabasePatientsService";
import { formatMoney, FEE_CATEGORIES } from "@/utils/finance";
import '../styles/themes/analytics-dashboard.css';

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

const RevenueDashboard = () => {
  // Period selector state - default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return { from: startDate, to: endDate };
  });
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");

  // Convert DateRange to string format for API calls
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  // Helper function to get period display text
  const getPeriodDisplayText = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select dates';
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return format(dateRange.from, 'MMM dd, yyyy');
    }
    return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  // Fetch doctors and patients
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'date-range', startDate, endDate],
    queryFn: async () => {
      // Use Supabase patients by created_at range (inclusive of entire end day)
      const startISO = new Date(`${startDate}T00:00:00.000Z`).toISOString();
      const endISO = new Date(`${endDate}T23:59:59.999Z`).toISOString();
      return await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
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
        OT: patient.ot_fee || 0,
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
            OT: {
              total: patientRevenue.OT,
              hospital: patientRevenue.OT * ((100 - (doctor.ot_percentage || 0)) / 100),
              doctor: patientRevenue.OT * ((doctor.ot_percentage || 0) / 100),
            },
          }
        : {
            OPD: { total: patientRevenue.OPD, hospital: patientRevenue.OPD, doctor: 0 },
            LAB: { total: patientRevenue.LAB, hospital: patientRevenue.LAB, doctor: 0 },
            ULTRASOUND: { total: patientRevenue.ULTRASOUND, hospital: patientRevenue.ULTRASOUND, doctor: 0 },
            ECG: { total: patientRevenue.ECG, hospital: patientRevenue.ECG, doctor: 0 },
            OT: { total: patientRevenue.OT, hospital: patientRevenue.OT, doctor: 0 },
          };

      // Update totals
      totalRevenue += totalPatientRevenue;
      hospitalRevenue += splits.OPD.hospital + splits.LAB.hospital + splits.ULTRASOUND.hospital + splits.ECG.hospital + splits.OT.hospital;
      doctorRevenue += splits.OPD.doctor + splits.LAB.doctor + splits.ULTRASOUND.doctor + splits.ECG.doctor + splits.OT.doctor;
      patientCount++;

      // Update doctor breakdown
      if (doctor) {
        const doctorData = doctorBreakdown[doctor.id];
        if (doctorData) {
          doctorData.totalRevenue += totalPatientRevenue;
          doctorData.hospitalRevenue += splits.OPD.hospital + splits.LAB.hospital + splits.ULTRASOUND.hospital + splits.ECG.hospital + splits.OT.hospital;
          doctorData.doctorRevenue += splits.OPD.doctor + splits.LAB.doctor + splits.ULTRASOUND.doctor + splits.ECG.doctor + splits.OT.doctor;
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

    // Debug log for today's revenue
    if (startDate === endDate && startDate === format(new Date(), 'yyyy-MM-dd')) {
      console.log('Revenue Dashboard Today Breakdown:', {
        totalRevenue,
        hospitalRevenue,
        doctorRevenue,
        patientCount,
        dateRange: { startDate, endDate }
      });
    }

    return {
      totalRevenue,
      hospitalRevenue,
      doctorRevenue,
      patientCount,
      doctorBreakdown,
    };
  }, [patients, doctors]);

  // Filter data based on selected doctor
  const filteredData = useMemo(() => {
    if (selectedDoctor === "all") {
      return revenueData;
    }
    
    const doctorData = revenueData.doctorBreakdown[selectedDoctor];
    if (!doctorData) return revenueData;

    return {
      totalRevenue: doctorData.totalRevenue,
      hospitalRevenue: doctorData.hospitalRevenue,
      doctorRevenue: doctorData.doctorRevenue,
      patientCount: doctorData.patientCount,
      doctorBreakdown: {
        [selectedDoctor]: doctorData,
      },
    };
  }, [revenueData, selectedDoctor]);

  const stats = [
    {
      title: "Total Revenue",
      value: formatMoney(filteredData.totalRevenue),
      change: `${startDate} to ${endDate}`,
      changeType: "positive",
      icon: DollarSign,
      colorClass: "orange",
    },
    {
      title: "Hospital Profit",
      value: formatMoney(filteredData.hospitalRevenue),
      change: `${startDate} to ${endDate}`,
      changeType: "positive",
      icon: Banknote,
      colorClass: "red",
    },
    {
      title: "Doctor Payouts",
      value: formatMoney(filteredData.doctorRevenue),
      change: `${startDate} to ${endDate}`,
      changeType: "positive", 
      icon: Wallet,
      colorClass: "green",
    },
    {
      title: "Total Patients",
      value: filteredData.patientCount.toString(),
      change: `${startDate} to ${endDate}`,
      changeType: "positive",
      icon: Users,
      colorClass: "blue",
    },
  ];

  return (
    <div className="analytics-dashboard-theme">
      <Helmet>
        <title>Revenue Dashboard | Shaukat International Hospital</title>
        <meta name="description" content="Comprehensive revenue dashboard showing hospital profits, doctor payouts, and revenue breakdowns by doctor and date range." />
      </Helmet>

      {/* Header */}
      <div className="analytics-header">
        <h1 className="analytics-title">Revenue Dashboard</h1>
        <p className="analytics-subtitle">
          This is an example dashboard created using build-in elements and components.
        </p>
        </div>

        {/* Filters */}
        <div className="analytics-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Period</label>
              <Button
                variant="outline"
                onClick={() => setIsPeriodSelectorOpen(true)}
                className="filter-input justify-start text-left font-medium"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="flex-1 text-left text-gray-700 font-medium">
                    {getPeriodDisplayText()}
                  </span>
              </div>
              </Button>
              </div>
            <div className="filter-group">
              <label className="filter-label">Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="filter-input">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="filter-group">
              <label className="filter-label">Actions</label>
                <Button 
                  onClick={() => {
                  const endDate = new Date();
                  const startDate = new Date();
                  startDate.setDate(startDate.getDate() - 30);
                  setDateRange({ from: startDate, to: endDate });
                    setSelectedDoctor("all");
                  }}
                className="filter-input bg-blue-600 text-white border-0 hover:bg-blue-700"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
        </div>

        {/* Portfolio Performance Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
          <div className="stat-card-grid">
          {stats.map((stat) => (
              <div key={stat.title} className={`analytics-stat-card ${stat.colorClass}`}>
                <div className="stat-card-header">
                  <div className="stat-card-title">{stat.title}</div>
                  <div className={`stat-card-icon ${stat.colorClass}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <div className={`stat-card-change ${stat.changeType}`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
          {/* View Complete Report Button */}
          <div className="text-center mt-6">
            <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Complete Report
            </Button>
          </div>
        </div>

        {/* Doctor Revenue Breakdown Table */}
        <div className="analytics-table-card">
          <div className="analytics-table-header">
            <h3 className="analytics-table-title">Doctor Revenue Breakdown</h3>
          </div>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Visits</th>
                <th>Total Revenue</th>
                <th>Hospital Profit</th>
                <th>Doctor Payout</th>
                <th>Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(filteredData.doctorBreakdown).map((data) => {
                const profitMargin = data.totalRevenue > 0 
                  ? ((data.hospitalRevenue / data.totalRevenue) * 100) 
                  : 0;
                
                const statusClass = profitMargin >= 80 ? 'completed' : 
                                   profitMargin >= 60 ? 'active' : 
                                   profitMargin >= 40 ? 'on-track' : 'at-risk';
                
                return (
                  <tr key={data.doctor.id}>
                    <td className="font-medium">{data.doctor.name}</td>
                    <td>{data.patientCount}</td>
                    <td className="font-semibold">{formatMoney(data.totalRevenue)}</td>
                    <td className="font-semibold text-blue-600">
                      {formatMoney(data.hospitalRevenue)}
                    </td>
                    <td className="font-semibold text-purple-600">
                      {formatMoney(data.doctorRevenue)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge ${statusClass}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Revenue by Category */}
        <div className="analytics-table-card">
          <div className="analytics-table-header">
            <h3 className="analytics-table-title">Revenue by Category</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEE_CATEGORIES.map((category) => {
                const categoryTotal = Object.values(filteredData.doctorBreakdown).reduce(
                  (sum, data) => sum + (data.categoryBreakdown[category]?.total || 0),
                  0
                );
                const categoryHospital = Object.values(filteredData.doctorBreakdown).reduce(
                  (sum, data) => sum + (data.categoryBreakdown[category]?.hospital || 0),
                  0
                );
                const categoryDoctor = Object.values(filteredData.doctorBreakdown).reduce(
                  (sum, data) => sum + (data.categoryBreakdown[category]?.doctor || 0),
                  0
                );

                // Determine color class for category
                const getColorClass = (cat: string) => {
                  switch(cat) {
                    case 'OPD': return 'orange';
                    case 'LAB': return 'blue';
                    case 'ULTRASOUND': return 'green';
                    case 'ECG': return 'red';
                    case 'OT': return 'purple';
                    default: return 'blue';
                  }
                };

                const colorClass = getColorClass(category);

                return (
                  <div key={category} className={`analytics-stat-card ${colorClass}`}>
                    <div className="stat-card-header">
                      <div className="stat-card-title">{category}</div>
                      <div className={`stat-card-icon ${colorClass}`}>
                        {category === 'OPD' && <DollarSign className="w-5 h-5" />}
                        {category === 'LAB' && <Activity className="w-5 h-5" />}
                        {category === 'ULTRASOUND' && <BarChart3 className="w-5 h-5" />}
                        {category === 'ECG' && <TrendingUp className="w-5 h-5" />}
                        {category === 'OT' && <Target className="w-5 h-5" />}
                      </div>
                        </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                        <div className="text-xl font-bold text-gray-900">{formatMoney(categoryTotal)}</div>
                        </div>
                      <div>
                        <div className="text-sm text-blue-600 mb-1">Hospital Profit</div>
                        <div className="text-lg font-semibold text-blue-600">{formatMoney(categoryHospital)}</div>
                        </div>
                      <div>
                        <div className="text-sm text-purple-600 mb-1">Doctor Payout</div>
                        <div className="text-lg font-semibold text-purple-600">{formatMoney(categoryDoctor)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Period Selector Modal */}
        <PeriodSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          open={isPeriodSelectorOpen}
          onOpenChange={setIsPeriodSelectorOpen}
        />
    </div>
  );
};

export default RevenueDashboard;
