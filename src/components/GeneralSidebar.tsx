import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/general' },
  { id: 'overview', label: 'Hospital Overview', icon: Building2, path: '/general/overview' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/general/analytics' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, path: '/general/performance' },
  { id: 'staff', label: 'All Staff', icon: Users, path: '/general/staff' },
  { id: 'financials', label: 'Financials', icon: DollarSign, path: '/general/financials' },
  { id: 'reports', label: 'Executive Reports', icon: FileText, path: '/general/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/general/settings' },
];

const GeneralSidebar: React.FC = () => {
  return (
    <DashboardSidebar
      title="General Hospital"
      menuItems={menuItems}
      basePath="/general"
      themeColor="navy"
    />
  );
};

export default GeneralSidebar;
