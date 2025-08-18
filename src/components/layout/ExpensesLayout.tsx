import React, { useState } from 'react';
import { Link, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  FileText, 
  BarChart3, 
  Menu,
  X,
  Home,
  TrendingUp,
  PieChart,
  UserCog,
  Stethoscope,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ExpensesLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  
  // Determine if we're in expenses or salaries section
  const isExpenses = location.pathname.startsWith('/expenses');
  const isSalaries = location.pathname.startsWith('/salaries');
  
  const dashboardTitle = isSalaries ? 'Salaries Dashboard' : 'Expenses Dashboard';
  const DashboardIcon = isSalaries ? UserCog : DollarSign;
    const iconColor = isSalaries ? 'text-purple-600' : 'text-green-600';

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
      color: 'text-purple-600',
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

  const navigation = [
    {
      name: 'Overview',
      href: isSalaries ? '/salaries' : '/expenses',
      icon: BarChart3,
      current: (isSalaries && (location.pathname === '/salaries' || location.pathname === '/salaries/overview')) ||
               (isExpenses && (location.pathname === '/expenses' || location.pathname === '/expenses/overview'))
    },
    {
      name: isSalaries ? 'All Employees' : 'All Expenses',
      href: isSalaries ? '/salaries/employees' : '/expenses/expenses',
      icon: isSalaries ? Users : FileText,
      current: (isSalaries && location.pathname === '/salaries/employees') ||
               (isExpenses && location.pathname === '/expenses/expenses')
    },
    ...(isSalaries ? [{
      name: 'Manage Employees',
      href: '/salaries/manage',
      icon: UserCog,
      current: location.pathname === '/salaries/manage'
    }] : []),
    {
      name: 'Reports',
      href: isSalaries ? '/salaries/reports' : '/expenses/reports',
      icon: TrendingUp,
      current: (isSalaries && location.pathname === '/salaries/reports') ||
               (isExpenses && location.pathname === '/expenses/reports')
    },
    {
      name: 'Analytics',
      href: isSalaries ? '/salaries/analytics' : '/expenses/analytics',
      icon: PieChart,
      current: (isSalaries && location.pathname === '/salaries/analytics') ||
               (isExpenses && location.pathname === '/expenses/analytics')
    }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png"
                alt="Shaukat International Hospital logo"
                className="h-6 sm:h-8 w-auto"
              />
              <div className="flex flex-col leading-tight">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
                <span className={cn("text-xs font-medium", iconColor)}>{isSalaries ? 'Employee Management System' : 'Expenses Management System'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Welcome,</span>
              <span className="text-sm font-medium text-gray-900">Administrator</span>
            </div>
            
            {/* Dashboard Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                  <DashboardIcon className={cn("h-4 w-4", iconColor)} />
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

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white pt-[73px]">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-900">{dashboardTitle}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  item.current
                    ? (isSalaries ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    item.current ? (isSalaries ? "text-purple-500" : "text-green-500") : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:top-[73px] lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-900">{isSalaries ? 'Salaries Dashboard' : 'Expenses Dashboard'}</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  item.current
                    ? (isSalaries ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    item.current ? (isSalaries ? "text-purple-500" : "text-green-500") : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Page content */}
        <main className="pt-6 pb-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExpensesLayout;
