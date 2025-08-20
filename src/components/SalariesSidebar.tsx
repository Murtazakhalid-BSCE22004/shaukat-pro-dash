import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  CreditCard,
  Settings
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/salaries' },
  { id: 'employees', label: 'All Employees', icon: Users, path: '/salaries/employees' },
  { id: 'manage', label: 'Manage Employees', icon: Settings, path: '/salaries/manage' },
  { id: 'departments', label: 'Departments', icon: Building, path: '/salaries/departments' },
  { id: 'payroll', label: 'Payroll', icon: DollarSign, path: '/salaries/payroll' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, path: '/salaries/attendance' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/salaries/reports' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/salaries/analytics' },
  { id: 'advances', label: 'Advances', icon: CreditCard, path: '/salaries/advances' },
];

const SalariesSidebar: React.FC = () => {
  return (
    <DashboardSidebar
      title="Salaries"
      menuItems={menuItems}
      basePath="/salaries"
      themeColor="orange"
    />
  );
};

export default SalariesSidebar;
