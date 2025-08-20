import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

import '../styles/themes/professional-theme.css';

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();
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
      change: 'Active Healthcare Operations',
      icon: Users,
      variant: 'customers',
    },
    {
      title: 'Today Revenue',
      value: formatCurrency(todayRevenue),
      change: 'Active Healthcare Operations',
      icon: DollarSign,
      variant: 'revenue',
    },
    {
      title: 'Active Doctors',
      value: activeDoctors.length.toString(),
      change: 'Active Healthcare Operations',
      icon: Stethoscope,
      variant: 'orders',
    },
    {
      title: 'Appointments Today',
      value: todaysPatients.length.toString(),
      change: 'Active Healthcare Operations',
      icon: Calendar,
      variant: 'margin',
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
    <div className="theme-professional-exact">{/* Main Content */}
        {/* Welcome Header */}
        <div className="welcome-header animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1>Welcome to Professional Dashboard</h1>
              <p>Shaukat International Hospital - Doctors & Patient Management</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Exact Design Match */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.title} 
              className={`stat-card ${stat.variant} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="icon">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3>{stat.title}</h3>
              <div className="value">{stat.value}</div>
              <div className="change">{stat.change}</div>
                </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area - Left Side */}
          <div className="lg:col-span-2 space-y-6">
                        {/* Recent Appointments Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Recent Appointments</h3>
                <div>
                  <span className="text-sm text-gray-500">Today's Activity</span>
                </div>
              </div>
              <div className="chart-value">{formatCurrency(todayRevenue)}</div>
              <div className="text-sm text-gray-500 mb-4">Today's Revenue</div>
              
              {/* Recent Appointments List */}
              <div className="space-y-3">
                {recentAppointments.slice(0, 4).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{appointment.patient}</p>
                      <p className="text-xs sm:text-sm text-purple-600 truncate font-medium">{appointment.doctor}</p>
                      <p className="text-xs text-gray-500 mt-1">{appointment.time} • {appointment.type}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-bold text-orange-600 text-sm sm:text-base">{appointment.amount}</p>
                    </div>
                  </div>
                ))}
                {recentAppointments.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>No recent appointments found</p>
                  </div>
                )}
              </div>
            </div>

          {/* Quick Actions */}
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Quick Actions</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate('/professional/patients')}
                  className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-200 group"
                >
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm sm:text-base font-semibold text-purple-700">New Patient</p>
                </button>
                <button 
                  onClick={() => navigate('/professional/appointments')}
                  className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-green-200 group"
                >
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm sm:text-base font-semibold text-green-700">Schedule</p>
                </button>
                <button 
                  onClick={() => navigate('/professional/billing')}
                  className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-blue-200 group"
                >
                  <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm sm:text-base font-semibold text-blue-700">Billing</p>
                </button>
                <button 
                  onClick={() => navigate('/professional/reports')}
                  className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-orange-200 group"
                >
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm sm:text-base font-semibold text-orange-700">Reports</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Hospital Statistics */}
            <div className="info-card">
              <h4>Hospital Statistics</h4>
              <div className="metric">
                <span className="metric-label">Total Doctors</span>
                <span className="metric-value text-blue">{activeDoctors.length}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total Patients</span>
                <span className="metric-value text-green">{patientsCount}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Today's Revenue</span>
                <span className="metric-value text-yellow">{formatCurrency(todayRevenue)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Today's Appointments</span>
                <span className="metric-value text-primary">{todaysPatients.length}</span>
              </div>
            </div>

            {/* Healthcare Info */}
            <div className="survey-section">
              <h4 className="survey-title">Hospital Management</h4>
              <div className="survey-content">
                <p>Shaukat International Hospital provides comprehensive healthcare management solutions for doctors, patients, and administrative staff.</p>
                <br />
                <p>Monitor daily operations, track patient visits, manage doctor schedules, and view real-time revenue analytics.</p>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/professional/reports')}
                  className="btn-primary w-full"
                >
                  Generate Report
                </button>
              </div>
            </div>

            {/* Management Actions */}
            <div className="info-card">
              <h4>Management Actions</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/professional/patients')}
                  className="btn-primary w-full text-left"
                >
                  <Heart className="h-4 w-4 inline mr-2" />
                  Add New Patient
                </button>
                <button 
                  onClick={() => navigate('/professional/appointments')}
                  className="btn-accent w-full text-left"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Schedule Appointment
                </button>
                <button 
                  onClick={() => navigate('/professional/reports')}
                  className="btn-primary w-full text-left"
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  View Reports
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
