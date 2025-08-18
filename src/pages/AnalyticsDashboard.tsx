import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, PieChart, BarChart3, DollarSign, ArrowLeft, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabasePatientsService } from '@/services/supabasePatientsService';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { supabaseVisitsService } from '@/services/supabaseVisitsService';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import TopPerformingDoctorsChart from '@/components/charts/TopPerformingDoctorsChart';

interface AnalyticsDashboardProps {
  initialTab?: 'overview' | 'expenses' | 'trends';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ initialTab = 'overview' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(urlTab);
  const [periodMode, setPeriodMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Expense filters and period controls removed per request

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch additional data for comprehensive analytics
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: supabasePatientsService.getAllPatients,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: supabaseVisitsService.getAllVisits,
  });

  // Calculate analytics data (expenses removed) with period filtering
  const analyticsData = useMemo(() => {
    // Helper functions for date filtering
    const getDateRange = () => {
      const now = new Date();
      const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      if (periodMode === 'daily') {
        // Last 7 days
        const start = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        const end = endOfDay(now);
        return { start, end };
      }
      
      if (periodMode === 'weekly') {
        // Current week (Monday to Sunday)
        const day = now.getDay();
        const mondayOffset = (day + 6) % 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        const start = startOfDay(monday);
        const end = endOfDay(new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000));
        return { start, end };
      }
      
      if (periodMode === 'yearly') {
        // Last 5 years
        const start = new Date(now.getFullYear() - 4, 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
      
      // Monthly - Last 6 months
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    };

    const { start: dateStart, end: dateEnd } = getDateRange();

    // Filter data based on selected period
    const filteredPatients = patients.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= dateStart && createdAt <= dateEnd;
    });

    const filteredVisits = visits.filter(v => {
        const visitDate = new Date(v.visit_date);
      return visitDate >= dateStart && visitDate <= dateEnd;
      });

    const patientAnalytics = {
      totalPatients: filteredPatients.length,
      totalRevenue: filteredPatients.reduce((sum, p) => 
        sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
      ),
      avgRevenuePerPatient: filteredPatients.length > 0
        ? filteredPatients.reduce((sum, p) =>
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
          ) / filteredPatients.length
        : 0,
      feeBreakdown: {
        opd: filteredPatients.reduce((sum, p) => sum + (p.opd_fee || 0), 0),
        lab: filteredPatients.reduce((sum, p) => sum + (p.lab_fee || 0), 0),
        ultrasound: filteredPatients.reduce((sum, p) => sum + (p.ultrasound_fee || 0), 0),
        ecg: filteredPatients.reduce((sum, p) => sum + (p.ecg_fee || 0), 0),
        ot: filteredPatients.reduce((sum, p) => sum + (p.ot_fee || 0), 0),
      },
      doctorDistribution: doctors.reduce((acc, doctor) => {
        const doctorPatients = filteredPatients.filter((p) => p.doctor_name === doctor.name);
        const doctorRevenue = doctorPatients.reduce((sum, p) => 
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        );
        acc[doctor.name] = {
          patients: doctorPatients.length,
          revenue: doctorRevenue,
          avgRevenue: doctorPatients.length > 0 ? doctorRevenue / doctorPatients.length : 0,
        };
        return acc;
      }, {} as Record<string, { patients: number; revenue: number; avgRevenue: number }>),
    };

    const doctorAnalytics = {
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter((d) => d.is_active).length,
      totalVisits: filteredPatients.length,  // Use patients since visits are 0
      doctorPerformance: doctors
        .map((doctor) => {
          const doctorPatients = filteredPatients.filter((p) => p.doctor_name === doctor.name);
          const doctorRevenue = doctorPatients.reduce((sum, p) => 
            sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        );
        return {
          name: doctor.name,
            patients: doctorPatients.length,
          revenue: doctorRevenue,
            avgRevenue: doctorPatients.length > 0 ? doctorRevenue / doctorPatients.length : 0,
        };
        })
        .sort((a, b) => b.revenue - a.revenue),
      specializationData: doctors.reduce((acc, doctor) => {
        const spec = doctor.specialization || 'General';
        acc[spec] = (acc[spec] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Dynamic trends based on period mode
    const getTrendBuckets = () => {
      const now = new Date();
      const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      if (periodMode === 'daily') {
        return Array.from({ length: 7 }, (_, i) => {
          const day = new Date(now);
          day.setDate(now.getDate() - (6 - i));
          return {
            label: day.toLocaleDateString('en-US', { weekday: 'short' }),
            start: startOfDay(day),
            end: endOfDay(day),
          };
        });
      }
      
      if (periodMode === 'weekly') {
        return Array.from({ length: 8 }, (_, i) => {
          const weekStart = new Date(now);
          const daysToMonday = (now.getDay() + 6) % 7;
          weekStart.setDate(now.getDate() - daysToMonday - (7 * (7 - i)));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          return {
            label: `W${8 - i}`,
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd),
          };
        });
      }
      
      if (periodMode === 'yearly') {
        return Array.from({ length: 5 }, (_, i) => {
          const year = now.getFullYear() - (4 - i);
          return {
            label: String(year),
            start: new Date(year, 0, 1),
            end: new Date(year, 11, 31, 23, 59, 59, 999),
          };
        });
      }
      
      // monthly (default)
      return Array.from({ length: 6 }, (_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
          label: month.toLocaleDateString('en-US', { month: 'short' }),
          start: new Date(month.getFullYear(), month.getMonth(), 1),
          end: new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999),
        };
      });
    };

    const trendBuckets = getTrendBuckets();

    const periodTrends = trendBuckets.map(bucket => {
      const bucketPatients = filteredPatients.filter((p) => {
        const d = new Date(p.created_at);
        return d >= bucket.start && d <= bucket.end;
      });

      const bucketVisits = filteredVisits.filter((v) => {
        const d = new Date(v.visit_date);
        return d >= bucket.start && d <= bucket.end;
      });

    return {
        period: bucket.label,
        patients: bucketPatients.length,
        visits: bucketVisits.length,
        revenue: bucketPatients.reduce((sum, p) => 
          sum + (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0), 0
        ),
      };
    });

    const periodCategoryTrends = trendBuckets.map(bucket => {
      const bucketPatients = filteredPatients.filter((p) => {
        const pd = new Date(p.created_at);
        return pd >= bucket.start && pd <= bucket.end;
      });

      const totals = bucketPatients.reduce(
        (acc, p) => {
          acc.OPD += p.opd_fee || 0;
          acc.LAB += p.lab_fee || 0;
          acc.ULTRASOUND += p.ultrasound_fee || 0;
          acc.ECG += p.ecg_fee || 0;
          acc.OT += p.ot_fee || 0;
          return acc;
        },
        { OPD: 0, LAB: 0, ULTRASOUND: 0, ECG: 0, OT: 0 }
      );

      return { period: bucket.label, ...totals };
    });

    return { patientAnalytics, doctorAnalytics, periodTrends, periodCategoryTrends };
  }, [patients, doctors, visits, periodMode]);

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    quinary: '#8B5CF6',
    senary: '#06B6D4'
  };
  const stats = [
    {
      title: 'Total Patients',
      value: analyticsData.patientAnalytics.totalPatients.toString(),
      change: 'Registered patients',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${analyticsData.patientAnalytics.totalRevenue.toLocaleString()}`,
      change: 'From patients',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Doctors',
      value: analyticsData.doctorAnalytics.activeDoctors.toString(),
      change: 'Treating patients',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  // Build timeseries for Overview charts based on selected period
  const doctorByName = useMemo(() => {
    const map: Record<string, typeof doctors[number]> = {};
    doctors.forEach((d) => { map[d.name] = d; });
    return map;
  }, [doctors]);

  const overviewSeries = useMemo(() => {
    // Helpers
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    type Bucket = { label: string; start: Date; end: Date };
    const buckets: Bucket[] = (() => {
      const now = new Date();
      if (periodMode === 'daily') {
        const b: Bucket[] = [];
        for (let i = 6; i >= 0; i--) {
          const dayDate = new Date(now);
          dayDate.setDate(now.getDate() - i);
          b.push({
            label: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
            start: startOfDay(dayDate),
            end: endOfDay(dayDate),
          });
        }
        return b;
      }
      if (periodMode === 'weekly') {
        const day = now.getDay(); // 0..6 (Sun..Sat)
        const mondayOffset = (day + 6) % 7; // days since Monday
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        const b: Bucket[] = [];
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(monday);
          dayDate.setDate(monday.getDate() + i);
          b.push({
            label: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
            start: startOfDay(dayDate),
            end: endOfDay(dayDate),
          });
        }
        return b;
      }
      if (periodMode === 'yearly') {
        const b: Bucket[] = [];
        const currentYear = now.getFullYear();
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          const start = new Date(year, 0, 1);
          const end = new Date(year, 11, 31, 23, 59, 59, 999);
          b.push({ label: String(year), start, end });
        }
        return b;
      }
      // monthly (last 6 months)
      const b: Bucket[] = [];
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(m.getFullYear(), m.getMonth(), 1);
        const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999);
        b.push({ label: m.toLocaleDateString('en-US', { month: 'short' }), start, end });
      }
      return b;
    })();

    // Revenue and Hospital Profit from patients
    const revenueSeries = buckets.map((bucket) => {
      let sum = 0;
      patients.forEach((p) => {
        const pd = new Date(p.created_at);
        if (pd >= bucket.start && pd <= bucket.end) {
          sum += (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0) + (p.ot_fee || 0);
        }
      });
      return { label: bucket.label, value: sum };
    });

    const hospitalSeries = buckets.map((bucket) => {
      let sum = 0;
      patients.forEach((p) => {
        const pd = new Date(p.created_at);
        if (pd >= bucket.start && pd <= bucket.end) {
          const d = doctorByName[p.doctor_name];
          const perc = {
            OPD: d?.opd_percentage ?? 0,
            LAB: d?.lab_percentage ?? 0,
            ULTRASOUND: d?.ultrasound_percentage ?? 0,
            ECG: d?.ecg_percentage ?? 0,
            OT: d?.ot_percentage ?? 0,
          };
          sum += (p.opd_fee || 0) * (100 - perc.OPD) / 100
              + (p.lab_fee || 0) * (100 - perc.LAB) / 100
              + (p.ultrasound_fee || 0) * (100 - perc.ULTRASOUND) / 100
              + (p.ecg_fee || 0) * (100 - perc.ECG) / 100
              + (p.ot_fee || 0) * (100 - perc.OT) / 100;
        }
      });
      return { label: bucket.label, value: sum };
    });

    const patientsSeries = buckets.map((bucket) => {
      const count = patients.reduce((acc, p) => {
        const pd = new Date(p.created_at);
        return acc + (pd >= bucket.start && pd <= bucket.end ? 1 : 0);
      }, 0);
      return { label: bucket.label, value: count };
    });

    return { revenueSeries, hospitalSeries, patientsSeries };
  }, [periodMode, patients, doctorByName]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Overview of revenue, profit and patient volume</p>
      </div>

          {/* Global Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <div className="inline-flex rounded-md border border-gray-200 bg-white p-1 w-full sm:w-auto overflow-x-auto">
              {(['daily','weekly','monthly','yearly'] as const).map((opt) => (
              <Button
                  key={opt}
                  variant={periodMode === opt ? 'default' : 'ghost'}
                  size="sm"
                  className={`text-xs sm:text-sm whitespace-nowrap ${periodMode === opt ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                  onClick={() => setPeriodMode(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Button>
              ))}
            </div>
            </div>
            </div>
          </div>

      {/* Filters removed per request */}

            {/* Stats cards removed per request */}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-max sm:min-w-0">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="patients" className="text-xs sm:text-sm whitespace-nowrap">Patients</TabsTrigger>
            <TabsTrigger value="doctors" className="text-xs sm:text-sm whitespace-nowrap">Doctors</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm whitespace-nowrap">Trends</TabsTrigger>
        </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Charts - Extended Layout */}
          <div className="space-y-6 sm:space-y-8">
            {/* Revenue Chart - Full Width */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  <span className="truncate">Revenue Trend</span>
                  {overviewSeries.revenueSeries.every(item => item.value === 0) && (
                    <span className="ml-2 text-xs sm:text-sm text-gray-500 font-normal">(No visit data)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-56 sm:h-72 lg:h-80 lg:h-96">
                  {overviewSeries.revenueSeries.every(item => item.value === 0) ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No Revenue Data</p>
                        <p className="text-sm">Revenue will appear when visits are recorded</p>
                  </div>
                  </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewSeries.revenueSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                        <Bar dataKey="value" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                )}
                </div>
              </CardContent>
            </Card>

            {/* Hospital Profit Chart - Full Width */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Hospital Profit
                  {overviewSeries.hospitalSeries.every(item => item.value === 0) && (
                    <span className="ml-2 text-sm text-gray-500 font-normal">(No visit data)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-56 sm:h-72 lg:h-80 lg:h-96">
                  {overviewSeries.hospitalSeries.every(item => item.value === 0) ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No Profit Data</p>
                        <p className="text-sm">Hospital profit will appear when visits are recorded</p>
                    </div>
                  </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewSeries.hospitalSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => [`Rs. ${value}`, 'Hospital Profit']} />
                        <Bar dataKey="value" fill="#10B981" name="Hospital Profit" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Volume Chart - Full Width */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Patient Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-56 sm:h-72 lg:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewSeries.patientsSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [`${value}`, 'Patients']} />
                      <Bar dataKey="value" fill="#F59E0B" name="Patients" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row removed per request */}
        </TabsContent>

        {/* Expense tab removed per request */}

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Fee Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'OPD', value: analyticsData.patientAnalytics.feeBreakdown.opd },
                      { name: 'Lab', value: analyticsData.patientAnalytics.feeBreakdown.lab },
                      { name: 'Ultrasound', value: analyticsData.patientAnalytics.feeBreakdown.ultrasound },
                      { name: 'ECG', value: analyticsData.patientAnalytics.feeBreakdown.ecg },
                      { name: 'OT', value: analyticsData.patientAnalytics.feeBreakdown.ot }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Amount']} />
                      <Bar dataKey="value" fill={chartColors.primary} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analyticsData.patientAnalytics.feeBreakdown)
                          .filter(([_, value]) => value > 0)
                          .map(([name, value]) => ({
                            name: name.toUpperCase(),
                            value,
                            color: {
                              opd: chartColors.primary,
                              lab: chartColors.secondary,
                              ultrasound: chartColors.tertiary,
                              ecg: chartColors.quaternary,
                              ot: chartColors.quinary
                            }[name.toLowerCase()]
                          }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analyticsData.patientAnalytics.feeBreakdown)
                          .filter(([_, value]) => value > 0)
                          .map(([name, _], index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={{
                                opd: chartColors.primary,
                                lab: chartColors.secondary,
                                ultrasound: chartColors.tertiary,
                                ecg: chartColors.quaternary,
                                ot: chartColors.quinary
                              }[name.toLowerCase()]} 
                            />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Amount']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Doctor Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(analyticsData.patientAnalytics.doctorDistribution).map(([name, data]) => ({
                    name,
                    patients: data.patients,
                    revenue: data.revenue
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Count/Amount']} />
                    <Legend />
                    <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    <Bar dataKey="revenue" fill={chartColors.secondary} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Doctors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Performing Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <TopPerformingDoctorsChart data={analyticsData.doctorAnalytics.doctorPerformance.slice(0, 8)} />
                </div>
              </CardContent>
            </Card>

            {/* Doctor Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Doctor Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analyticsData.doctorAnalytics.specializationData).map(([name, value]) => ({
                          name,
                          value,
                          color: chartColors[name as keyof typeof chartColors] || chartColors.primary
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analyticsData.doctorAnalytics.specializationData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[entry[0] as keyof typeof chartColors] || chartColors.primary} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Average Revenue per Doctor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Average Revenue per Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.doctorAnalytics.doctorPerformance.map(doctor => ({
                    name: doctor.name,
                    avgRevenue: doctor.avgRevenue
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rs. ${value}`, 'Avg Revenue']} />
                    <Bar dataKey="avgRevenue" fill={chartColors.tertiary} name="Avg Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {periodMode.charAt(0).toUpperCase() + periodMode.slice(1)} Patient Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.periodTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  {periodMode.charAt(0).toUpperCase() + periodMode.slice(1)} Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.periodTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill={chartColors.secondary} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Category (Stacked Columns) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {periodMode.charAt(0).toUpperCase() + periodMode.slice(1)} Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-56 sm:h-72 lg:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.periodCategoryTrends} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="period" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      fontSize={12}
                      tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`Rs. ${value.toLocaleString()}`, name]}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="OPD" 
                      stackId="revenue" 
                      fill={chartColors.primary} 
                      name="OPD"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="LAB" 
                      stackId="revenue" 
                      fill={chartColors.secondary} 
                      name="LAB"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="ULTRASOUND" 
                      stackId="revenue" 
                      fill={chartColors.tertiary} 
                      name="Ultrasound"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="ECG" 
                      stackId="revenue" 
                      fill={chartColors.quaternary} 
                      name="ECG"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="OT" 
                      stackId="revenue" 
                      fill={chartColors.quinary} 
                      name="OT"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Combined Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Combined {periodMode.charAt(0).toUpperCase() + periodMode.slice(1)} Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.periodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Count/Amount']} />
                    <Legend />
                    <Bar dataKey="patients" fill={chartColors.primary} name="Patients" />
                    <Bar dataKey="visits" fill={chartColors.tertiary} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
