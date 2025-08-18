import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  TrendingUp,
  CreditCard,
  Heart,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { isoDateOnly } from '@/utils/finance';
import { supabaseDoctorsService } from '@/services/supabaseDoctorsService';
import { supabasePatientsService } from '@/services/supabasePatientsService';

const ProfessionalDashboard: React.FC = () => {
  const today = isoDateOnly(new Date());

  const { data: activeDoctors = [] } = useQuery({
    queryKey: ['doctors', 'active'],
    queryFn: supabaseDoctorsService.getActiveDoctors,
  });

  const { data: patientsCount = 0 } = useQuery({
    queryKey: ['patients', 'count'],
    queryFn: supabasePatientsService.getPatientsCount,
  });

  const { data: todaysPatients = [] } = useQuery({
    queryKey: ['patients', 'today', today],
    queryFn: async () => {
      // Use local timezone to avoid UTC conversion issues
      const startISO = `${today}T00:00:00.000+05:00`;
      const endISO = `${today}T23:59:59.999+05:00`;
      return await supabasePatientsService.getPatientsByDateRange(startISO, endISO);
    },
  });

  const { data: recentPatients = [] } = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: () => supabasePatientsService.getRecentPatients(4),
  });

  const todayRevenue = useMemo(() => {
    return (todaysPatients || []).reduce((sum, p) => {
      return (
        sum +
        (p.opd_fee || 0) +
        (p.lab_fee || 0) +
        (p.ultrasound_fee || 0) +
        (p.ecg_fee || 0)
      );
    }, 0);
  }, [todaysPatients]);

  const stats = [
    {
      title: 'Total Patients',
      value: patientsCount.toString(),
      change: '',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Today Revenue',
      value: formatCurrency(todayRevenue),
      change: '',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Doctors',
      value: activeDoctors.length.toString(),
      change: '',
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Appointments Today',
      value: todaysPatients.length.toString(),
      change: '',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const doctorNameById = useMemo(() => {
    const map: Record<string, string> = {};
    activeDoctors.forEach(d => { map[d.id] = d.name; });
    return map;
  }, [activeDoctors]);

  const recentAppointments = useMemo(() => {
    return (recentPatients || [])
      .map((p) => ({
        patient: p.patient_name,
        doctor: p.doctor_name || '—',
        time: new Date(p.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        type: 'Patient',
        amount: formatCurrency(
          (p.opd_fee || 0) + (p.lab_fee || 0) + (p.ultrasound_fee || 0) + (p.ecg_fee || 0)
        ),
      }));
  }, [recentPatients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6">
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Professional Dashboard</h1>
            <p className="text-orange-100 mt-2 text-sm sm:text-base">Shaukat International Hospital - Healthcare Management</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">{stat.title}</CardTitle>
              <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-orange-600 font-medium mt-1">Active Healthcare Operations</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Appointments */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-base sm:text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.patient} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{appointment.patient}</p>
                    <p className="text-xs sm:text-sm text-blue-600 truncate font-medium">{appointment.doctor}</p>
                    <p className="text-xs text-gray-500 mt-1">{appointment.time} • {appointment.type}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-orange-600 text-sm sm:text-base">{appointment.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
            <CardTitle className="text-base sm:text-lg font-semibold text-orange-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-blue-200 group">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-sm sm:text-base font-semibold text-blue-700">New Patient</p>
              </button>
              <button className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-green-200 group">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-sm sm:text-base font-semibold text-green-700">Schedule</p>
              </button>
              <button className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-200 group">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-sm sm:text-base font-semibold text-purple-700">Billing</p>
              </button>
              <button className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-orange-200 group">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-sm sm:text-base font-semibold text-orange-700">Reports</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default ProfessionalDashboard;
