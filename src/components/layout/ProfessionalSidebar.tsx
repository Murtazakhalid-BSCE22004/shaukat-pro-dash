import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Settings,
  Activity,
  TrendingUp,
  CreditCard,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfessionalSidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/professional/dashboard', icon: Home },
  { name: 'Doctors', href: '/professional/doctors', icon: UserCheck },
  { name: 'Patients', href: '/professional/patients', icon: Users },
  { name: 'Appointments', href: '/professional/appointments', icon: Calendar },
  { name: 'Daily Report', href: '/professional/records', icon: FileText },
  { name: 'Billing', href: '/professional/billing', icon: CreditCard },
  { name: 'Revenue Dashboard', href: '/professional/revenue', icon: DollarSign },
  { name: 'Analytics', href: '/professional/analytics', icon: TrendingUp },
  { name: 'Reports', href: '/professional/reports', icon: Activity },
  { name: 'Settings', href: '/professional/settings', icon: Settings },
];



export const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({ className }) => {
  return (
    <aside className={cn("w-64 bg-white border-r border-gray-200", className)}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Shaukat Intl. Hospital</h2>
            <p className="text-xs text-[hsl(var(--brand))]">Healthcare System</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 pb-20">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--brand))/0.08] text-[hsl(var(--brand))] border-r-2 border-[hsl(var(--brand))]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
                end={item.href === '/professional/dashboard'}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>


      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
