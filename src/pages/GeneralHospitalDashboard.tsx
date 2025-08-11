import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowLeft,
  Construction,
  Stethoscope,
  DollarSign,
  UserCog,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GeneralHospitalDashboard: React.FC = () => {
  const dashboardNavigation = [
    { name: 'Professional Dashboard', href: '/professional', icon: Stethoscope, color: 'text-blue-600', description: 'Doctors & Patient Management' },
    { name: 'Expenses Dashboard', href: '/expenses', icon: DollarSign, color: 'text-green-600', description: 'Financial Management' },
    { name: 'Salaries Dashboard', href: '/salaries', icon: UserCog, color: 'text-blue-600', description: 'Employee Salary Management' },
  ];

  return (
    <>
      <Helmet>
        <title>General Hospital Dashboard | Shaukat International Hospital</title>
        <meta name="description" content="Comprehensive hospital overview dashboard - Coming Soon" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">General Hospital Dashboard</h1>
                  <p className="text-gray-600">Comprehensive Hospital Overview</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Main
                </Button>
              </Link>
              
              {/* Dashboard Navigation Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="hidden sm:inline">Switch Dashboard</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {dashboardNavigation.map((option) => (
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
            
            {/* Dashboard Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Navigation to Other Dashboards
              </h3>
              <div className="flex flex-wrap gap-3">
                {dashboardNavigation.map((item) => (
                  <Link key={item.name} to={item.href}>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Coming Soon Icon */}
            <div className="mb-8">
              <div className="p-8 bg-purple-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Construction className="h-16 w-16 text-purple-600" />
              </div>
            </div>

            {/* Main Message */}
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Coming Soon
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The General Hospital Dashboard is currently under development. This comprehensive dashboard 
              will provide hospital-wide analytics, advanced reporting tools, and strategic insights for 
              executive management.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Advanced Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Comprehensive data analysis across all hospital departments with interactive charts 
                    and real-time metrics.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    KPI tracking, trend analysis, and performance benchmarking across all hospital operations.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Strategic Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Executive-level reporting with actionable insights for strategic decision-making.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    Custom Dashboards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Personalized dashboard views tailored to different user roles and responsibilities.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Alternatives */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Available Now
              </h3>
              <p className="text-gray-600 mb-6">
                While this dashboard is being developed, you can use our other specialized dashboards:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/professional">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Doctors & Patient Management
                  </Button>
                </Link>
                <Link to="/expenses">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Expenses & Salaries
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Need More Information?
              </h4>
              <p className="text-gray-600">
                Contact the IT department for updates on the development progress and feature requests.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2024 Shaukat International Hospital. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              General Hospital Dashboard - Development in Progress
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default GeneralHospitalDashboard;
