import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Clock, Construction } from 'lucide-react';

const BillingPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Billing | Shaukat International Hospital</title>
        <meta name="description" content="Billing and invoicing system for Shaukat International Hospital" />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {/* Back Button */}
            <Link to="/professional">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing System</h1>
              <p className="text-gray-600">Patient billing, invoicing, and payment management</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mb-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center border-b border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <Construction className="h-12 w-12 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                Wait, it has to be made
              </CardTitle>
              <p className="text-gray-600">
                The billing system is currently under development
              </p>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Coming Soon
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    We're working hard to build a comprehensive billing system that will include:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-700">Patient Invoicing</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Payment Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Insurance Claims</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-700">Financial Reports</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">
                    For now, you can use the Revenue Dashboard for financial overview
                  </p>
                  <Link to="/professional/revenue">
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out">
                      Go to Revenue Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default BillingPage;
