import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  DollarSign, 
  Building2, 
  Users, 
  FileText, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HospitalLogo from '@/components/ui/HospitalLogo';

const LandingPage: React.FC = () => {
  const dashboardOptions = [
    {
      id: 'professional',
      title: 'Doctors & Patient Management',
      description: 'Manage doctors, record patient visits, track appointments, and view daily summaries',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Doctor management and scheduling',
        'Patient registration and visits',
        'Appointment tracking',
        'Daily revenue summaries',
        'OPD, Lab, and procedure fees'
      ],
      route: '/professional',
      buttonText: 'Access Professional',
      buttonVariant: 'default' as const
    },
    {
      id: 'expenses',
      title: 'Expenses Dashboard',
      description: 'Track and manage daily hospital expenses, operational costs, and financial records',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Daily hospital expense tracking',
        'Expense categorization and reporting',
        'Receipt and documentation management',
        'Financial analysis and insights',
        'Export and reporting tools'
      ],
      route: '/expenses',
      buttonText: 'Access Expenses',
      buttonVariant: 'default' as const
    },
    {
      id: 'salaries',
      title: 'Salaries Dashboard',
      description: 'Manage employee salaries, advance payments, and monthly salary deductions',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Employee salary management',
        'Staff advance payment tracking',
        'Monthly salary deduction processing',
        'Department-wise salary reports',
        'Advance vs salary reconciliation'
      ],
      route: '/salaries',
      buttonText: 'Access Salaries',
      buttonVariant: 'default' as const
    },
    {
      id: 'general',
      title: 'General Hospital Dashboard',
      description: 'Comprehensive hospital overview with advanced analytics and reporting',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Hospital-wide analytics',
        'Advanced reporting tools',
        'Performance metrics',
        'Strategic insights',
        'Custom dashboards'
      ],
      route: '/general',
      buttonText: 'Access General',
      buttonVariant: 'default' as const
    }
  ];

  return (
    <>
      <Helmet>
        <title>Shaukat International Hospital | Dashboard Selection</title>
        <meta name="description" content="Choose your dashboard: Doctors & Patient Management, Expenses & Salaries, or General Hospital Dashboard" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                 <div className="p-2 bg-white rounded-lg shadow-sm">
                   <HospitalLogo size="md" />
                 </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Shaukat International Hospital</h1>
                  <p className="text-gray-600">Healthcare Management System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome to</p>
                <p className="font-semibold text-gray-900">Hospital Administration</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the appropriate dashboard based on your role and responsibilities. 
              Each dashboard provides specialized tools and insights for different aspects of hospital management.
            </p>
          </div>

          {/* Dashboard Options - Professional Layout */}
          <div className="space-y-8 mb-16">
            {/* Primary Dashboards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Professional Dashboard */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                  <CardHeader className="relative pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                        <Stethoscope className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Primary</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                      Doctors & Patient Management
                    </CardTitle>
                    <p className="text-gray-700 leading-relaxed">
                      Comprehensive medical operations management for doctors, patients, and daily healthcare activities.
                    </p>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Doctor Management</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Patient Visits</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Appointments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Revenue Tracking</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to="/professional" className="block">
                      <Button 
                        variant="default" 
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-lg transition-all duration-300 border-0"
                      >
                        Access Professional Dashboard
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>

              {/* General Hospital Dashboard */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                  <CardHeader className="relative pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Executive</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                      General Hospital Dashboard
                    </CardTitle>
                    <p className="text-gray-700 leading-relaxed">
                      Executive-level analytics and comprehensive hospital overview with strategic insights.
                    </p>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Analytics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Reporting</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Performance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Insights</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to="/general" className="block">
                      <Button 
                        variant="default" 
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-lg transition-all duration-300 border-0"
                      >
                        Access General Dashboard
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </div>

                         {/* Financial Management Section */}
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
               <div className="border-b border-gray-200 px-8 py-6">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-gray-100 rounded-lg">
                     <DollarSign className="h-6 w-6 text-gray-600" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-900">Financial Management</h3>
                     <p className="text-sm text-gray-600">Comprehensive financial control and administrative tools</p>
                   </div>
                 </div>
               </div>
               
               <div className="p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Expenses Dashboard */}
                   <div className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
                     <div className="flex items-center space-x-4 mb-4">
                       <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                         <DollarSign className="h-6 w-6 text-white" />
                       </div>
                       <div>
                         <h4 className="text-lg font-bold text-gray-900">Expenses Dashboard</h4>
                         <p className="text-sm text-gray-600">Operational cost management</p>
                       </div>
                     </div>
                     
                     <div className="space-y-3 mb-6">
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Daily expense tracking and categorization</span>
                       </div>
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Receipt and documentation management</span>
                       </div>
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Financial analysis and reporting tools</span>
                       </div>
                     </div>
                     
                     <Link to="/expenses" className="block">
                       <Button 
                         variant="default" 
                         className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-md transition-all duration-300 border-0"
                       >
                         Access Expenses Dashboard
                         <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Button>
                     </Link>
                   </div>

                   {/* Salaries Dashboard */}
                   <div className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300">
                     <div className="flex items-center space-x-4 mb-4">
                       <div className="p-3 bg-purple-600 rounded-xl shadow-sm">
                         <Users className="h-6 w-6 text-white" />
                       </div>
                       <div>
                         <h4 className="text-lg font-bold text-gray-900">Salaries Dashboard</h4>
                         <p className="text-sm text-gray-600">Employee payroll management</p>
                       </div>
                     </div>
                     
                     <div className="space-y-3 mb-6">
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Employee salary and advance tracking</span>
                       </div>
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Monthly salary deduction processing</span>
                       </div>
                       <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span className="text-sm text-gray-700">Department-wise salary reports</span>
                       </div>
                     </div>
                     
                     <Link to="/salaries" className="block">
                       <Button 
                         variant="default" 
                         className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-md transition-all duration-300 border-0"
                       >
                         Access Salaries Dashboard
                         <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Button>
                     </Link>
                   </div>
                 </div>
               </div>
             </div>
          </div>

                     {/* Quick Access Guide */}
           <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-gray-900 mb-2">
                 Quick Access Guide
               </h3>
               <p className="text-gray-600 max-w-2xl mx-auto">
                 Choose the dashboard that best matches your role and responsibilities
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2 bg-blue-100 rounded-lg">
                     <Stethoscope className="h-5 w-5 text-blue-600" />
                   </div>
                   <h4 className="font-semibold text-gray-900">Medical Staff</h4>
                 </div>
                 <p className="text-sm text-gray-600 mb-3">
                   Access the <strong>Professional Dashboard</strong> for patient care, doctor management, and daily medical operations.
                 </p>
                 <Link to="/professional">
                   <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                     Go to Professional →
                   </Button>
                 </Link>
               </div>
               
               <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2 bg-green-100 rounded-lg">
                     <DollarSign className="h-5 w-5 text-green-600" />
                   </div>
                   <h4 className="font-semibold text-gray-900">Administrators</h4>
                 </div>
                 <p className="text-sm text-gray-600 mb-3">
                   Use the <strong>Expenses Dashboard</strong> to manage operational costs, track expenses, and maintain financial records.
                 </p>
                 <Link to="/expenses">
                   <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 p-0 h-auto">
                     Go to Expenses →
                   </Button>
                 </Link>
               </div>
               
               <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2 bg-emerald-100 rounded-lg">
                     <Users className="h-5 w-5 text-emerald-600" />
                   </div>
                   <h4 className="font-semibold text-gray-900">HR & Payroll</h4>
                 </div>
                 <p className="text-sm text-gray-600 mb-3">
                   Access the <strong>Salaries Dashboard</strong> for employee management, salary advances, and payroll processing.
                 </p>
                 <Link to="/salaries">
                   <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 p-0 h-auto">
                     Go to Salaries →
                   </Button>
                 </Link>
               </div>
               
               <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2 bg-purple-100 rounded-lg">
                     <Building2 className="h-5 w-5 text-purple-600" />
                   </div>
                   <h4 className="font-semibold text-gray-900">Management</h4>
                 </div>
                 <p className="text-sm text-gray-600 mb-3">
                   Use the <strong>General Dashboard</strong> for executive insights, analytics, and strategic decision-making.
                 </p>
                 <Link to="/general">
                   <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                     Go to General →
                   </Button>
                 </Link>
               </div>
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
              Secure healthcare management system for professional use
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
