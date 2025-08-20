import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/expenses' },
  { id: 'expenses', label: 'All Expenses', icon: DollarSign, path: '/expenses/expenses' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/expenses/reports' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/expenses/analytics' },
];

const ExpensesSidebar: React.FC = () => {
  return (
    <DashboardSidebar
      title="Expenses"
      menuItems={menuItems}
      basePath="/expenses"
      themeColor="green"
    />
  );
};

export default ExpensesSidebar;
