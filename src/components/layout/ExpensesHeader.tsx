import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import HospitalLogo from '@/components/ui/HospitalLogo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Stethoscope, 
  DollarSign, 
  UserCog, 
  Building2 
} from 'lucide-react';

const ExpensesHeader: React.FC = () => {
  const location = useLocation();
  
  const dashboards = [
    {
      id: 'professional',
      name: 'Professional Dashboard',
      description: 'Healthcare Management',
      path: '/professional',
      icon: Stethoscope,
      color: 'text-purple-600'
    },
    {
      id: 'expenses',
      name: 'Expenses Dashboard',
      description: 'Financial Management',
      path: '/expenses',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'salaries',
      name: 'Salaries Dashboard',
      description: 'HR Management',
      path: '/salaries',
      icon: UserCog,
      color: 'text-orange-600'
    },
    {
      id: 'general',
      name: 'General Hospital',
      description: 'Executive Overview',
      path: '/general',
      icon: Building2,
      color: 'text-slate-600'
    }
  ];

  const currentDashboard = dashboards.find(d => location.pathname.startsWith(d.path)) || dashboards[1];

  return (
    <header className="professional-header">
      <div className="flex items-center justify-between px-6 py-4 h-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10">
            <HospitalLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
            <p className="text-sm text-green-600 font-medium">{currentDashboard.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="text-sm font-medium text-gray-900">Administrator</span>
          </div>

          {/* Dashboard Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 px-3 py-2">
                <currentDashboard.icon className={`h-4 w-4 ${currentDashboard.color}`} />
                <span className="hidden sm:inline text-sm font-medium">Switch Dashboard</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {dashboards.map((dashboard) => (
                <DropdownMenuItem key={dashboard.id} asChild>
                  <Link to={dashboard.path} className="flex items-center gap-3 p-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <dashboard.icon className={`h-4 w-4 ${dashboard.color}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{dashboard.name}</span>
                      <span className="text-xs text-gray-500">{dashboard.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ExpensesHeader;
