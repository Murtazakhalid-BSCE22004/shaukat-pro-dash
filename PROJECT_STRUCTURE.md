# Shaukat International Hospital - Complete Project Structure

## 🏥 Project Overview

This is a comprehensive hospital management system built for **Shaukat International Hospital** using modern web technologies. The system provides three main dashboard interfaces for different hospital management aspects:

1. **Professional Dashboard** - Doctor and patient management
2. **Expenses Dashboard** - Financial and operational cost tracking  
3. **Salaries Dashboard** - Employee salary and payroll management
4. **General Dashboard** - Executive-level analytics (Coming Soon)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Charts**: Recharts, Chart.js, Tremor React
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query)
- **Local Storage**: Dexie (IndexedDB wrapper)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for receipts/documents)

### Development & Deployment
- **Package Manager**: npm/bun
- **Linting**: ESLint 9
- **Deployment**: Netlify/Vercel
- **Version Control**: Git

---

## 📁 Project Structure

```
shaukat-pro-dash/
├── 📁 public/                          # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   ├── _redirects                      # Netlify redirects
│   └── lovable-uploads/                # Uploaded images
│
├── 📁 src/                             # Source code
│   ├── 📁 components/                  # React components
│   │   ├── 📁 ui/                     # Reusable UI components
│   │   ├── 📁 layout/                 # Layout components
│   │   ├── 📁 charts/                 # Chart components
│   │   └── app-sidebar.tsx            # Main sidebar
│   │
│   ├── 📁 pages/                      # Page components
│   │   ├── LandingPage.tsx            # Main landing page
│   │   ├── ProfessionalDashboard.tsx  # Doctor/patient management
│   │   ├── ExpensesDashboard.tsx      # Expense tracking
│   │   ├── SalariesDashboard.tsx      # Salary management
│   │   ├── AnalyticsDashboard.tsx     # Analytics and reporting
│   │   └── GeneralHospitalDashboard.tsx # Executive dashboard
│   │
│   ├── 📁 services/                   # API services
│   │   ├── supabaseDoctorsService.ts  # Doctor data operations
│   │   ├── supabasePatientsService.ts # Patient data operations
│   │   ├── supabaseVisitsService.ts   # Visit records
│   │   ├── supabaseEmployeesService.ts # Employee management
│   │   ├── supabaseExpensesService.ts # Expense tracking
│   │   └── supabaseBudgetService.ts   # Budget management
│   │
│   ├── 📁 integrations/               # External integrations
│   │   └── supabase/                  # Supabase configuration
│   │       ├── client.ts              # Supabase client setup
│   │       └── types.ts               # Generated types
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   ├── 📁 utils/                      # Utility functions
│   ├── 📁 lib/                        # Shared libraries
│   ├── 📁 config/                     # Configuration files
│   ├── 📁 styles/                     # CSS and theme files
│   └── types.ts                       # TypeScript type definitions
│
├── 📁 supabase/                       # Database management
│   ├── config.toml                    # Supabase configuration
│   └── migrations/                    # Database migrations
│       ├── 001_create_doctors_table.sql
│       ├── 002_create_patients_table.sql
│       ├── 003_create_visits_table.sql
│       ├── 007_create_expenses_employees_tables.sql
│       └── 012_create_budget_table.sql
│
└── 📁 Configuration Files
    ├── package.json                   # Dependencies and scripts
    ├── vite.config.ts                # Vite configuration
    ├── tailwind.config.ts            # Tailwind CSS config
    ├── tsconfig.json                 # TypeScript configuration
    └── components.json               # shadcn/ui configuration
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **doctors** table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- phone (VARCHAR)
- specialization (VARCHAR)
- license_number (VARCHAR, Unique)
- department (VARCHAR)
- consultation_fee (DECIMAL)
- experience_years (INTEGER)
- qualification (VARCHAR)
- address (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 2. **patients** table
```sql
- id (UUID, Primary Key)
- patient_name (VARCHAR)
- contact_number (VARCHAR)
- doctor_name (VARCHAR)
- opd_fee, lab_fee, ultrasound_fee, ecg_fee (DECIMAL)
- created_at, updated_at (TIMESTAMP)
```

#### 3. **visits** table
```sql
- id (UUID, Primary Key)
- patient_name (VARCHAR)
- contact (VARCHAR)
- doctor_id (UUID, Foreign Key → doctors.id)
- visit_date (DATE)
- opd_fee, lab_fee, ot_fee, ultrasound_fee, ecg_fee (DECIMAL)
- created_at, updated_at (TIMESTAMP)
```

#### 4. **employees** table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- position (VARCHAR)
- department (VARCHAR)
- salary (DECIMAL)
- hire_date (DATE)
- is_active (BOOLEAN)
- contact_number, email (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

#### 5. **expenses** table
```sql
- id (UUID, Primary Key)
- category (VARCHAR)
- description (TEXT)
- amount (DECIMAL)
- expense_date (DATE)
- approved_by (VARCHAR)
- status (ENUM: pending, approved, rejected)
- receipt_url (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 6. **salary_payments** table
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key → employees.id)
- amount (DECIMAL)
- payment_date (DATE)
- month (VARCHAR)
- year (INTEGER)
- status (ENUM: pending, paid, cancelled)
- payment_method (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

#### 7. **budgets** table
```sql
- id (UUID, Primary Key)
- category (VARCHAR)
- amount (DECIMAL)
- month, year (INTEGER)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(category, month, year)
```

---

## 🚀 Application Architecture

### 1. **Landing Page** (`/`)
Central hub where users choose their dashboard based on role:
- **Professional Dashboard** - Medical staff
- **Expenses Dashboard** - Financial staff
- **Salaries Dashboard** - HR/Admin staff
- **General Dashboard** - Management (Coming Soon)

### 2. **Professional Dashboard** (`/professional`)
**Purpose**: Doctor and patient management
**Features**:
- Doctor registration and management
- Patient visit recording
- Appointment scheduling
- Daily revenue tracking
- Fee management (OPD, Lab, OT, Ultrasound, ECG)
- Analytics and reporting

**Key Pages**:
- `/professional/dashboard` - Main overview
- `/professional/doctors` - Doctor management
- `/professional/patients` - Patient records
- `/professional/visits/new` - Record new visits
- `/professional/summary` - Daily summaries
- `/professional/revenue` - Revenue analytics

### 3. **Expenses Dashboard** (`/expenses`)
**Purpose**: Financial operations and expense tracking
**Features**:
- Daily expense recording
- Category-based expense management
- Receipt upload and management
- Approval workflow
- Budget tracking
- Financial reporting

**Key Pages**:
- `/expenses/` - Overview dashboard
- `/expenses/expenses` - Expense management
- `/expenses/reports` - Financial reports
- `/expenses/analytics` - Expense analytics

### 4. **Salaries Dashboard** (`/salaries`)
**Purpose**: Employee and payroll management
**Features**:
- Employee registration and management
- Salary calculation and tracking
- Monthly payroll processing
- Department-wise cost analysis
- Employee performance tracking

**Key Pages**:
- `/salaries/` - Overview dashboard
- `/salaries/employees` - Employee management
- `/salaries/analytics` - Salary analytics

---

## 🎨 UI Components Architecture

### Core UI Components (`src/components/ui/`)
Built with **shadcn/ui** and **Radix UI**:

- **Form Components**: `input.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`
- **Data Display**: `table.tsx`, `card.tsx`, `badge.tsx`, `avatar.tsx`
- **Navigation**: `navigation-menu.tsx`, `breadcrumb.tsx`, `sidebar.tsx`
- **Feedback**: `toast.tsx`, `alert.tsx`, `progress.tsx`
- **Overlays**: `dialog.tsx`, `popover.tsx`, `tooltip.tsx`
- **Charts**: `chart.tsx`, `simple-chart.tsx`

### Custom Components
- **Layout Components**: Specialized layouts for each dashboard
- **Dialog Components**: CRUD operations for entities
- **Chart Components**: Custom visualizations
- **Specialized Components**: `HospitalLogo.tsx`, `period-selector.tsx`

---

## 📊 Data Flow & State Management

### 1. **API Services Layer**
All database operations are handled through dedicated service files:
- `supabaseDoctorsService.ts` - Doctor CRUD operations
- `supabaseVisitsService.ts` - Visit management
- `supabaseExpensesService.ts` - Expense tracking
- `supabaseEmployeesService.ts` - Employee management

### 2. **State Management**
- **TanStack Query**: Server state management, caching, and synchronization
- **React State**: Component-level state for forms and UI
- **Local Storage**: Dexie for offline capability

### 3. **Type Safety**
Comprehensive TypeScript interfaces in `src/types.ts`:
- `SupabaseDoctor`, `SupabaseVisit`, `SupabasePatient`
- `Employee`, `Expense`, `SalaryPayment`, `Budget`
- Legacy types for backward compatibility

---

## 🔐 Security & Authentication

### Row Level Security (RLS)
All tables have RLS policies for secure data access:
```sql
-- Example policy
CREATE POLICY "Table is viewable by authenticated users" ON public.table_name
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Password Protection
Application-level password protection via `src/config/security.ts`:
- Configurable password and session duration
- Login attempt limiting
- Session management

---

## 📈 Features & Functionality

### Professional Dashboard Features
- **Doctor Management**: Complete doctor profiles with specializations
- **Visit Recording**: Detailed visit logs with multiple fee categories
- **Revenue Tracking**: Real-time revenue calculations and analytics
- **Reporting**: Comprehensive reports and data export

### Expenses Dashboard Features
- **Expense Tracking**: Categorized expense management
- **Approval Workflow**: Multi-stage expense approval process
- **Budget Management**: Monthly budget setting and monitoring
- **Financial Analytics**: Spend analysis and forecasting

### Salaries Dashboard Features
- **Employee Management**: Complete employee profiles and management
- **Payroll Processing**: Monthly salary calculations and payments
- **Department Analytics**: Cost analysis by department
- **Payment Tracking**: Detailed payment history and status

---

## 🎯 Routing Structure

```
/                                    → Landing Page
├── /professional/                   → Professional Dashboard
│   ├── /dashboard                  → Main dashboard
│   ├── /doctors                    → Doctor management
│   ├── /patients                   → Patient management
│   ├── /visits/new                 → New visit recording
│   ├── /summary                    → Daily summary
│   ├── /revenue                    → Revenue dashboard
│   └── /analytics                  → Analytics dashboard
├── /expenses/                       → Expenses Dashboard
│   ├── /                          → Overview
│   ├── /expenses                   → Expense management
│   ├── /reports                    → Financial reports
│   └── /analytics                  → Expense analytics
├── /salaries/                       → Salaries Dashboard
│   ├── /                          → Overview
│   ├── /employees                  → Employee management
│   └── /analytics                  → Salary analytics
└── /general/                        → General Dashboard (Coming Soon)
```

---

## 🔧 Development Workflow

### Getting Started
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Setup
```bash
# Apply migrations
supabase migration up

# Reset database (if needed)
supabase reset
```

### Environment Variables
Create `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** using Tailwind CSS
- **Collapsible sidebars** for mobile navigation
- **Responsive tables** and charts
- **Touch-friendly interfaces** for mobile devices

---

## 🚀 Deployment

### Netlify Deployment
- Automatic deployments from Git
- Environment variable configuration
- Redirect rules in `public/_redirects`

### Build Configuration
- Vite build optimization
- TypeScript compilation
- Asset optimization and bundling

---

## 📋 Future Enhancements

### General Hospital Dashboard
- Hospital-wide analytics integration
- Advanced reporting and visualization
- Performance metrics and KPIs
- Executive-level insights

### Additional Features
- **User Role Management**: Fine-grained access control
- **Real-time Notifications**: Alert system for important events
- **Mobile App**: Native mobile application
- **API Integration**: Third-party service integrations
- **Advanced Analytics**: Machine learning insights

---

## 🔍 Testing & Quality

### Code Quality
- **ESLint**: Code linting and standards
- **TypeScript**: Type safety and error prevention
- **Prettier**: Code formatting consistency

### Performance
- **Code Splitting**: Lazy loading for optimal performance
- **Caching**: Efficient data caching with TanStack Query
- **Optimization**: Image and asset optimization

---

## 📞 Support & Maintenance

### Documentation
- Comprehensive inline code documentation
- Type definitions for all interfaces
- Migration scripts for database changes

### Monitoring
- Error tracking and logging
- Performance monitoring
- Database query optimization

---

## 📄 License & Credits

**Hospital**: Shaukat International Hospital  
**Development**: Built with modern React ecosystem  
**UI Framework**: shadcn/ui and Tailwind CSS  
**Database**: Supabase PostgreSQL  

---

*This documentation provides a comprehensive overview of the Shaukat International Hospital management system. For specific implementation details, refer to the individual component and service files.*
