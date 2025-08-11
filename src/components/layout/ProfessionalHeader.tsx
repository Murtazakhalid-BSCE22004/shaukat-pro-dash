import React from 'react';
import { Menu, ArrowLeft, ChevronDown, Stethoscope, DollarSign, UserCog, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
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
          {/* Back to Landing Page Button */}
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="flex flex-col space-y-2">
                <a href="/dashboard" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Dashboard</a>
                <a href="/doctors" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Doctors</a>
                <a href="/patients" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Patients</a>
                <a href="/appointments" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Appointments</a>
                <a href="/billing" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Billing</a>
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="hidden lg:flex items-center space-x-3">
            <img
              src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png"
              alt="Shaukat International Hospital logo"
              className="h-8 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
              <span className="text-xs text-[hsl(var(--brand))] font-medium">Healthcare Management System</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Dropdown */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Switch Dashboard</span>
                <ChevronDown className="h-4 w-4" />
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
