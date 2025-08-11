# Shaukat International Hospital - Dashboard Structure

## Overview

This project now includes three main dashboards for different aspects of hospital management:

1. **Doctors & Patient Management Dashboard** - For medical staff operations
2. **Expenses & Salaries Dashboard** - For financial and administrative management
3. **General Hospital Dashboard** - For executive-level overview (placeholder for future development)

## New Landing Page

The default route (`/`) now shows a landing page with three options, allowing users to choose the appropriate dashboard based on their role.

## Dashboard Details

### 1. Doctors & Patient Management Dashboard
- **Route**: `/professional` or legacy routes (`/dashboard`, `/doctors`, etc.)
- **Purpose**: Daily patient care operations, doctor management, appointment tracking
- **Features**:
  - Doctor management and scheduling
  - Patient registration and visits
  - Appointment tracking
  - Daily revenue summaries
  - OPD, Lab, and procedure fee management

### 2. Expenses & Salaries Dashboard
- **Route**: `/expenses`
- **Purpose**: Financial management, employee salary tracking, operational cost monitoring
- **Features**:
  - Expense tracking and approval workflow
  - Employee salary management
  - Department-wise cost analysis
  - Monthly expense reports
  - Budget monitoring and forecasting
- **Layout**: Dedicated sidebar navigation with tabs for different sections

### 3. General Hospital Dashboard
- **Route**: `/general`
- **Purpose**: Executive-level hospital overview (currently a placeholder)
- **Status**: Coming Soon - Shows features that will be available
- **Future Features**:
  - Hospital-wide analytics
  - Advanced reporting tools
  - Performance metrics
  - Strategic insights
  - Custom dashboards

## Database Changes

### New Tables Added

#### Employees Table
- Employee information (name, position, department, salary, hire date)
- Contact details and status tracking
- Department-based grouping

#### Expenses Table
- Expense categories and descriptions
- Amount tracking and approval workflow
- Receipt management and status tracking

#### Salary Payments Table
- Monthly salary payment tracking
- Payment status and method tracking
- Employee payment history

### Migration File
- `007_create_expenses_employees_tables.sql` - Contains all new table definitions
- Includes sample data for testing
- Proper RLS policies and indexes

## New Services

### supabaseEmployeesService.ts
- Employee CRUD operations
- Department-based queries
- Salary cost calculations

### supabaseExpensesService.ts
- Expense management
- Category and status filtering
- Date range queries
- Financial calculations

## Routing Structure

```
/                           → Landing Page (Choose Dashboard)
├── /professional          → Doctors & Patient Management
│   ├── /dashboard        → Main dashboard
│   ├── /doctors          → Doctor management
│   ├── /patients         → Patient management
│   ├── /appointments     → Appointment tracking
│   ├── /visits/new       → New visit recording
│   ├── /summary          → Daily summary
│   └── /revenue          → Revenue dashboard
├── /expenses             → Expenses & Salaries Dashboard
│   ├── /                 → Overview
│   ├── /expenses         → Expense management
│   ├── /employees        → Employee management
│   ├── /reports          → Financial reports
│   └── /settings         → Dashboard settings
├── /general              → General Hospital Dashboard (Coming Soon)
└── Legacy routes         → Backward compatibility maintained
```

## Usage Instructions

### For Medical Staff
1. Navigate to the landing page
2. Select "Doctors & Patient Management"
3. Use the professional dashboard for daily operations

### For Administrators
1. Navigate to the landing page
2. Select "Expenses & Salaries Dashboard"
3. Manage finances and personnel through the dedicated interface

### For Management
1. Navigate to the landing page
2. Select "General Hospital Dashboard"
3. Access executive-level insights (when available)

## Technical Implementation

### Components
- `LandingPage.tsx` - Main selection interface
- `ExpensesDashboard.tsx` - Financial management interface
- `ExpensesLayout.tsx` - Dedicated layout for expenses dashboard
- `GeneralHospitalDashboard.tsx` - Placeholder for future dashboard

### Services
- `supabaseEmployeesService.ts` - Employee data management
- `supabaseExpensesService.ts` - Expense data management

### Types
- `Employee` interface for employee data
- `Expense` interface for expense tracking
- `SalaryPayment` interface for salary management

## Future Development

### General Hospital Dashboard
- Will integrate data from all other dashboards
- Provide executive-level reporting
- Include advanced analytics and visualization
- Support custom dashboard configurations

### Additional Features
- User role-based access control
- Advanced reporting and export capabilities
- Real-time notifications and alerts
- Mobile-responsive interfaces

## Getting Started

1. Run the new migration: `007_create_expenses_employees_tables.sql`
2. Start the application
3. Navigate to the root URL to see the new landing page
4. Choose the appropriate dashboard for your role

## Notes

- All existing functionality is preserved through legacy routes
- The new structure is backward compatible
- Sample data is included for testing
- RLS policies ensure data security
- Responsive design works on all devices
