import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  TrendingUp,
  CreditCard,
  Heart,
  Stethoscope,
  BarChart3,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { SimpleChart, TrendChart } from '@/components/ui/simple-chart';
import { formatCurrency } from '@/utils/currency';
import { isoDateOnly } from '@/utils/finance';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { supabasePatientsService } from '@/services/supabasePatientsService';
import { supabaseVisitsService } from '@/services/supabaseVisitsService';
import { DateRange } from 'react-day-picker';

type TimePeriod = 'today' | 'yesterday' | 'week' | 'lastWeek' | 'month' | 'lastMonth' | 'year' | 'lastYear' | 'custom';

interface DateRangeString {
  start: string;
  end: string;
}

const StatisticalDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [customDateRange, setCustomDateRange] = useState<DateRangeString>({
    start: isoDateOnly(new Date()),
    end: isoDateOnly(new Date())
  });
  
  const [dateRangePicker, setDateRangePicker] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  // Calculate date ranges based on selected period
  const dateRange = useMemo((): DateRangeString => {
    const now = new Date();
    const today = isoDateOnly(now);
    
    switch (selectedPeriod) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return { 
          start: isoDateOnly(yesterday), 
          end: isoDateOnly(yesterday) 
        };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return { 
          start: isoDateOnly(weekStart), 
          end: today 
        };
      case 'lastWeek':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
        return { 
          start: isoDateOnly(lastWeekStart), 
          end: isoDateOnly(lastWeekEnd) 
        };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { 
          start: isoDateOnly(monthStart), 
          end: today 
        };
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { 
          start: isoDateOnly(lastMonthStart), 
          end: isoDateOnly(lastMonthEnd) 
        };
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { 
          start: isoDateOnly(yearStart), 
          end: today 
        };
      case 'lastYear':
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        return { 
          start: isoDateOnly(lastYearStart), 
          end: isoDateOnly(lastYearEnd) 
        };
      case 'custom':
        return customDateRange;
      default:
        return { start: today, end: today };
    }
  }, [selectedPeriod, customDateRange, dateRangePicker]);

  // Fetch data based on date range
  const { data: visits = [] } = useQuery({
    queryKey: ['visits', 'range', dateRange.start, dateRange.end],
    queryFn: () => supabaseVisitsService.getVisitsByDateRange(
      new Date(`${dateRange.start}T00:00:00.000Z`).toISOString(),
      new Date(`${dateRange.end}T23:59:59.999Z`).toISOString()
    ),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: supabaseDoctorsService.getAllDoctors,
  });

  const { data: patientsCount = 0 } = useQuery({
    queryKey: ['patients', 'count'],
    queryFn: supabasePatientsService.getPatientsCount,
  });

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    let totalRevenue = 0;
    let totalVisits = visits.length;
    let totalPatients = new Set(visits.map(v => v.patient_name)).size;
    let revenueByCategory = {
      OPD: 0,
      LAB: 0,
      OT: 0,
      ULTRASOUND: 0,
      ECG: 0
    };
    let revenueByDoctor: Record<string, number> = {};
    let dailyRevenue: Record<string, number> = {};

    visits.forEach(visit => {
      const visitRevenue = (visit.opd_fee || 0) + (visit.lab_fee || 0) + 
                          (visit.ot_fee || 0) + (visit.ultrasound_fee || 0) + (visit.ecg_fee || 0);
      
      totalRevenue += visitRevenue;
      
      // Revenue by category
      revenueByCategory.OPD += visit.opd_fee || 0;
      revenueByCategory.LAB += visit.lab_fee || 0;
      revenueByCategory.OT += visit.ot_fee || 0;
      revenueByCategory.ULTRASOUND += visit.ultrasound_fee || 0;
      revenueByCategory.ECG += visit.ecg_fee || 0;
      
      // Revenue by doctor
      const doctorId = visit.doctor_id;
      revenueByDoctor[doctorId] = (revenueByDoctor[doctorId] || 0) + visitRevenue;
      
      // Daily revenue
      const visitDate = isoDateOnly(new Date(visit.visit_date));
      dailyRevenue[visitDate] = (dailyRevenue[visitDate] || 0) + visitRevenue;
    });

    // Calculate averages
    const avgRevenuePerVisit = totalVisits > 0 ? totalRevenue / totalVisits : 0;
    const avgRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;

    // Top performing doctors
    const topDoctors = Object.entries(revenueByDoctor)
      .map(([doctorId, revenue]) => {
        const doctor = doctors.find(d => d.id === doctorId);
        return {
          name: doctor?.name || 'Unknown',
          revenue,
          visits: visits.filter(v => v.doctor_id === doctorId).length
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalVisits,
      totalPatients,
      avgRevenuePerVisit,
      avgRevenuePerPatient,
      revenueByCategory,
      revenueByDoctor,
      dailyRevenue,
      topDoctors
    };
  }, [visits, doctors]);

  // Calculate period-over-period change
  const periodChange = useMemo(() => {
    // This would typically compare with previous period
    // For now, showing placeholder data
    return {
      revenue: '+12.5%',
      visits: '+8.2%',
      patients: '+15.3%'
    };
  }, []);

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'week': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'month': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'year': return 'This Year';
      case 'lastYear': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'Today';
    }
  };

  const handleCustomDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRangePicker(range);
      setCustomDateRange({
        start: isoDateOnly(range.from),
        end: isoDateOnly(range.to)
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistical Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive healthcare analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="lastWeek">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPeriod === 'custom' && (
            <DateRangePicker
              dateRange={dateRangePicker}
              onDateRangeChange={handleCustomDateRangeChange}
            />
          )}
          
          <Badge variant="secondary" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-2" />
            {getPeriodLabel(selectedPeriod)}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</div>
            <p className="text-xs text-green-600 font-medium">{periodChange.revenue} from last period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalVisits}</div>
            <p className="text-xs text-green-600 font-medium">{periodChange.visits} from last period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalPatients}</div>
            <p className="text-xs text-green-600 font-medium">{periodChange.patients} from last period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue/Visit</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.avgRevenuePerVisit)}</div>
            <p className="text-xs text-gray-600">Per visit average</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Revenue by Category"
          data={Object.entries(statistics.revenueByCategory).map(([category, revenue]) => ({
            label: category,
            value: revenue
          }))}
          showValues={true}
        />

        <SimpleChart
          title="Top Performing Doctors"
          data={statistics.topDoctors.map((doctor) => ({
            label: doctor.name,
            value: doctor.revenue
          }))}
          showValues={true}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendChart
          title="Daily Revenue Trend"
          data={Object.entries(statistics.dailyRevenue)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7)
            .map(([date, revenue]) => ({
              label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: revenue
            }))}
          height={200}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{statistics.totalPatients}</div>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-green-600">
                    {statistics.totalVisits > 0 ? Math.round((statistics.totalPatients / statistics.totalVisits) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-600">Return Rate</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-purple-600">
                    {formatCurrency(statistics.avgRevenuePerPatient)}
                  </div>
                  <p className="text-xs text-gray-600">Per Patient</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{doctors.length}</div>
                <p className="text-sm text-gray-600">Active Doctors</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-blue-600">
                    {doctors.length > 0 ? Math.round(statistics.totalVisits / doctors.length) : 0}
                  </div>
                  <p className="text-xs text-gray-600">Avg Visits/Doctor</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-green-600">
                    {doctors.length > 0 ? formatCurrency(statistics.totalRevenue / doctors.length) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-gray-600">Avg Revenue/Doctor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics.totalVisits > 0 ? Math.round((statistics.totalPatients / statistics.totalVisits) * 100) : 0}%
                  </div>
                  <p className="text-sm text-blue-700">Patient Return Rate</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {doctors.length > 0 ? Math.round(statistics.totalVisits / doctors.length) : 0}
                  </div>
                  <p className="text-sm text-green-700">Avg Visits per Doctor</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(statistics.avgRevenuePerVisit)}
                  </div>
                  <p className="text-sm text-purple-700">Avg Revenue per Visit</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(statistics.avgRevenuePerPatient)}
                  </div>
                  <p className="text-sm text-orange-700">Avg Revenue per Patient</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statistics.revenueByCategory)
                .filter(([_, revenue]) => revenue > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([category, revenue]) => {
                  const percentage = statistics.totalRevenue > 0 ? (revenue / statistics.totalRevenue) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="text-sm">New Patient</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="text-sm">Schedule Visit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticalDashboard;
