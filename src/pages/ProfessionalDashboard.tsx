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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Shaukat International Hospital</h1>
        <p className="text-gray-600 mt-2">Healthcare Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.patient} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
                    <p className="text-xs text-gray-500">{appointment.time} • {appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{appointment.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Heart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">New Patient</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Schedule</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Billing</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-700">Reports</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
