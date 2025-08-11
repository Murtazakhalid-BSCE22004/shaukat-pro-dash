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
  const dashboardIcon = isSalaries ? UserCog : DollarSign;
    const iconColor = isSalaries ? 'text-blue-600' : 'text-green-600';

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

  const navigation = [
    {
      name: 'Overview',
      href: isSalaries ? '/salaries/overview' : '/expenses/overview',
      icon: BarChart3,
      current: (isSalaries && (location.pathname === '/salaries' || location.pathname === '/salaries/overview')) ||
               (isExpenses && (location.pathname === '/expenses' || location.pathname === '/expenses/overview'))
    },
    {
      name: isSalaries ? 'All Employees' : 'All Expenses',
      href: isSalaries ? '/salaries/employees' : '/expenses/overview?tab=expenses',
      icon: isSalaries ? Users : FileText,
      current: (isSalaries && location.pathname === '/salaries/employees') ||
               (isExpenses && location.pathname === '/expenses/overview' && currentTab === 'expenses')
    },
    {
      name: 'Reports',
      href: isSalaries ? '/salaries/reports' : '/expenses/overview?tab=reports',
      icon: TrendingUp,
      current: (isSalaries && location.pathname === '/salaries/reports') ||
               (isExpenses && location.pathname === '/expenses/overview' && currentTab === 'reports')
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
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center space-x-2">
              <dashboardIcon className={cn("h-8 w-8", iconColor)} />
              <span className="text-xl font-bold text-gray-900">{dashboardTitle}</span>
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
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    item.current ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          

          
          <div className="border-t p-4">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              Back to Main
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-2">
              <dashboardIcon className={cn("h-8 w-8", iconColor)} />
              <span className="text-xl font-bold text-gray-900">{dashboardTitle}</span>
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
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    item.current ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          

          
          <div className="border-t p-4">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              Back to Main
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {location.pathname === '/expenses/analytics' || location.pathname === '/salaries/analytics' ? 'Analytics Dashboard' : 
                 navigation.find(item => item.current)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Welcome,</span>
                <span className="text-sm font-medium text-gray-900">Administrator</span>
              </div>
              
              {/* Dashboard Navigation Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <dashboardIcon className={cn("h-4 w-4", iconColor)} />
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
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExpensesLayout;
