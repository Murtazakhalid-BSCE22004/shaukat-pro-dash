import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Stethoscope,
  DollarSign,
  Users,
  Building2,
  User
} from 'lucide-react';
import HospitalLogo from '@/components/ui/HospitalLogo';

const ProfessionalHeader: React.FC = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

const dashboardOptions = [
  { 
      id: 'professional',
      title: 'Professional Dashboard',
      description: 'Doctors & Patient Management',
    icon: Stethoscope, 
      path: '/professional'
  },
  { 
      id: 'expenses',
      title: 'Expenses Dashboard',
      description: 'Financial Management',
    icon: DollarSign, 
      path: '/expenses'
    },
    {
      id: 'salaries',
      title: 'Salaries Dashboard',
      description: 'HR Management',
      icon: Users,
      path: '/salaries'
    },
    {
      id: 'general',
      title: 'General Hospital',
      description: 'Executive Overview',
    icon: Building2, 
      path: '/general'
    }
  ];

  // Determine current dashboard based on location
  const getCurrentDashboard = () => {
    if (location.pathname.startsWith('/professional')) return dashboardOptions[0];
    if (location.pathname.startsWith('/expenses')) return dashboardOptions[1];
    if (location.pathname.startsWith('/salaries')) return dashboardOptions[2];
    if (location.pathname.startsWith('/general')) return dashboardOptions[3];
    return dashboardOptions[0]; // Default to professional
  };

  const currentDashboard = getCurrentDashboard();

  return (
    <header className="professional-header">
      <div className="flex items-center justify-between px-6 py-4 h-full">
        {/* Hospital Logo and Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10">
            <HospitalLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
            <p className="text-sm text-purple-600 font-medium">{currentDashboard.description}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Welcome Message */}
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-600">Welcome,</p>
            <p className="text-sm font-semibold text-gray-900">Administrator</p>
          </div>

          {/* Dashboard Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
            >
              <currentDashboard.icon className="w-4 h-4 text-purple-600" />
              <span>Switch Dashboard</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                                    {dashboardOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isCurrent = option.id === currentDashboard.id;
                    return (
                      <Link
                        key={option.id}
                        to={option.path}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isCurrent 
                            ? 'bg-purple-50 border-l-4 border-purple-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            isCurrent ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                    </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${
                            isCurrent ? 'text-purple-900' : 'text-gray-900'
                          }`}>
                            {option.title}
                          </p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                        {isCurrent && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 p-2">
                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">All Dashboards</p>
                      <p className="text-xs text-gray-500">Return to dashboard selection</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default ProfessionalHeader;