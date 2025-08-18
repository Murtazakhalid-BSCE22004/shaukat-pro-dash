import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import PasswordProtection from "./components/PasswordProtection";
import { ProfessionalLayout } from "./components/layout/ProfessionalLayout";
import ExpensesLayout from "./components/layout/ExpensesLayout";
import LandingPage from "./pages/LandingPage";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import NotFound from "./pages/NotFound";
import Doctors from "./pages/Doctors";
import NewVisit from "./pages/NewVisit";
import DailySummary from "./pages/DailySummary";
import Reports from "./pages/Reports";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import RevenueDashboard from "./pages/RevenueDashboard";
import ExpensesDashboard from "./pages/ExpensesDashboard";
import AllExpenses from "./pages/AllExpenses";
import ExpensesReports from "./pages/ExpensesReports";
import SalariesDashboard from "./pages/SalariesDashboard";
import AllEmployees from "./pages/AllEmployees";
import ManageEmployees from "./pages/ManageEmployees";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ExpenseAnalytics from "./pages/ExpenseAnalytics";
import GeneralHospitalDashboard from "./pages/GeneralHospitalDashboard";
import BillingPage from "./pages/Billing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <PasswordProtection>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Landing page - default route */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Redirect from /professional to /professional/dashboard */}
              <Route path="/professional" element={<ProfessionalLayout />}>
                <Route index element={<ProfessionalDashboard />} />
                <Route path="dashboard" element={<ProfessionalDashboard />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="patients" element={<Patients />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="visits/new" element={<NewVisit />} />
                <Route path="summary" element={<DailySummary />} />
                <Route path="revenue" element={<RevenueDashboard />} />
                <Route path="records" element={<DailySummary />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<ProfessionalDashboard />} />
                <Route path="*" element={<ProfessionalDashboard />} />
              </Route>
              
              {/* Expenses Dashboard Routes */}
              <Route path="/expenses" element={<ExpensesLayout />}>
                <Route index element={<ExpensesDashboard />} />
                <Route path="overview" element={<ExpensesDashboard />} />
                <Route path="expenses" element={<AllExpenses />} />
                <Route path="reports" element={<ExpensesReports />} />
                <Route path="analytics" element={<ExpenseAnalytics />} />
              </Route>
              
              {/* Salaries Dashboard Routes */}
              <Route path="/salaries" element={<ExpensesLayout />}>
                <Route index element={<SalariesDashboard />} />
                <Route path="overview" element={<SalariesDashboard />} />
                <Route path="employees" element={<AllEmployees />} />
                <Route path="manage" element={<ManageEmployees />} />
                <Route path="reports" element={<SalariesDashboard />} />
              </Route>
              
              {/* General Hospital Dashboard Route */}
              <Route path="/general" element={<GeneralHospitalDashboard />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PasswordProtection>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
