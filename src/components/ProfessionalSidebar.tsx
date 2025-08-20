import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Stethoscope,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/professional' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/professional/patients' },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/professional/doctors' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/professional/appointments' },
  { id: 'medical-records', label: 'Medical Records', icon: FileText, path: '/professional/records' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/professional/billing' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, path: '/professional/revenue' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/professional/analytics' },
  { id: 'reports', label: 'Reports', icon: TrendingUp, path: '/professional/reports' },
];

const ProfessionalSidebar: React.FC = () => {
  return (
    <DashboardSidebar
      title="Professional"
      menuItems={menuItems}
      basePath="/professional"
      themeColor="blue"
    />
  );
};

export default ProfessionalSidebar;
