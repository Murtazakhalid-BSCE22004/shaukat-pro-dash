import React from 'react';
import { Menu, ArrowLeft, ChevronDown, Stethoscope, DollarSign, UserCog, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProfessionalHeaderProps {
  onMenuClick?: () => void;
}

const dashboardOptions = [
  { 
    name: 'Professional Dashboard', 
    href: '/professional', 
    icon: Stethoscope, 
    color: 'text-blue-600',
    description: 'Doctors & Patient Management'
  },
  { 
    name: 'Expenses Dashboard', 
    href: '/expenses', 
    icon: DollarSign, 
    color: 'text-green-600',
    description: 'Financial Management'
  },
  { 
    name: 'Salaries Dashboard', 
    href: '/salaries', 
    icon: UserCog, 
    color: 'text-blue-600',
    description: 'Employee Salary Management'
  },
  { 
    name: 'General Hospital', 
    href: '/general', 
    icon: Building2, 
    color: 'text-purple-600',
    description: 'Executive Overview'
  },
];

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80 p-0">
              <div className="flex flex-col h-full py-4">
                <div className="px-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png"
                      alt="Shaukat International Hospital logo"
                      className="h-8 w-auto"
                    />
                    <div className="flex flex-col leading-tight">
                      <h1 className="text-lg font-bold text-gray-900">Shaukat International Hospital</h1>
                      <span className="text-xs text-[hsl(var(--brand))] font-medium">Healthcare System</span>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-col space-y-1 px-2">
                  <NavLink
                    to="/professional/dashboard"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/professional/doctors"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Doctors
                  </NavLink>
                  <NavLink
                    to="/professional/patients"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Patients
                  </NavLink>
                  <NavLink
                    to="/professional/appointments"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Appointments
                  </NavLink>
                  <NavLink
                    to="/professional/analytics"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Analytics
                  </NavLink>
                  <NavLink
                    to="/professional/reports"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Reports
                  </NavLink>
                  <NavLink
                    to="/professional/summary"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Today Report
                  </NavLink>
                  <NavLink
                    to="/professional/billing"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Billing
                  </NavLink>
                  <NavLink
                    to="/professional/revenue"
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    Revenue
                  </NavLink>
              </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="hidden lg:flex items-center space-x-3">
            <img
              src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png"
              alt="Shaukat International Hospital logo"
              className="h-6 sm:h-8 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
              <span className="text-xs text-[hsl(var(--brand))] font-medium">Healthcare Management System</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline text-sm">Switch Dashboard</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {dashboardOptions.map((option) => (
                <DropdownMenuItem key={option.name} asChild>
                  <Link to={option.href} className="flex items-center gap-3 p-3">
                    <div className={cn("p-2 rounded-lg", option.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                      <option.icon className={cn("h-4 w-4", option.color)} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{option.name}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
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
