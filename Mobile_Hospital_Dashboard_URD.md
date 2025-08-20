# User Requirement Document (URD)
## Shaukat International Hospital - Mobile Dashboard Application

### Document Information
- **Project:** Shaukat International Hospital Mobile Dashboard
- **Version:** 1.0
- **Date:** December 2024
- **Type:** User Requirement Document

---

## 1. Executive Summary

### 1.1 Project Overview
The Shaukat International Hospital Mobile Dashboard is a read-only mobile application providing hospital owners and executives with real-time access to comprehensive hospital analytics. The app consolidates information from four primary dashboard systems into a unified mobile interface.

### 1.2 Purpose
Enable hospital management to monitor KPIs, financial metrics, and operational statistics on-the-go through an intuitive mobile interface, supporting data-driven decision making from anywhere.

### 1.3 Scope
- **In Scope:** Read-only dashboard views, real-time data visualization, offline caching, push notifications
- **Out of Scope:** Data creation, modification, deletion operations, user management

---

## 2. Business Requirements

### 2.1 Business Objectives
- Provide 24/7 access to hospital performance metrics
- Enable remote monitoring of hospital operations
- Support executive decision-making with real-time insights
- Reduce dependency on desktop systems
- Improve response time to critical operational changes

### 2.2 Key Stakeholders
- **Primary Users:** Hospital Owners, CEO, CFO, Medical Director
- **Secondary Users:** Department Heads, Operations Manager
- **Technical Users:** IT Administrator, Database Administrator

---

## 3. Functional Requirements

### 3.1 Dashboard Integration
The mobile app integrates and displays data from four existing dashboard systems:

#### 3.1.1 Professional Dashboard
**Key Metrics:**
- Total patients registered
- Today's patient visits
- Active doctors count
- Daily revenue from consultations
- Appointment statistics
- Doctor performance metrics

**Visual Components:**
- Patient visit trends (line chart)
- Revenue breakdown by service (pie chart)
- Doctor performance rankings (bar chart)
- Real-time patient flow (gauges)

#### 3.1.2 Expenses Dashboard
**Key Metrics:**
- Total monthly expenses
- Daily expense breakdown
- Expense categories analysis
- Budget vs actual spending
- Cost per patient metrics

**Visual Components:**
- Monthly expense trends (area chart)
- Category-wise spending (donut chart)
- Budget utilization (progress bars)
- Recent transactions (list view)

#### 3.1.3 Salaries Dashboard
**Key Metrics:**
- Total active employees
- Monthly salary expenses
- Department-wise employee distribution
- Attendance rates
- Employee performance metrics

**Visual Components:**
- Department employee distribution (bar chart)
- Salary expense trends (line chart)
- Attendance analytics (heatmap)

#### 3.1.4 General Hospital Dashboard
**Key Metrics:**
- Overall hospital performance
- Net profit/loss
- Operational efficiency ratios
- Resource utilization rates
- Comparative analytics

**Visual Components:**
- Executive KPI dashboard
- Consolidated financial view
- Performance scorecards
- Trend analysis charts

### 3.2 Core Mobile Features

#### 3.2.1 Authentication & Security
- **Biometric Authentication:** Fingerprint, Face ID support
- **Multi-Factor Authentication:** SMS/Email OTP
- **Session Management:** Auto-logout after inactivity
- **Role-Based Access:** Different views for different user roles
- **Encryption:** End-to-end data encryption

#### 3.2.2 Data Visualization
- **Interactive Charts:** Touch-enabled zoom and pan
- **Real-time Updates:** Live data refresh indicators
- **Customizable Views:** User-configurable dashboard layouts
- **Export Capabilities:** PDF/Excel export for reports
- **Offline Mode:** Cached data access when offline

#### 3.2.3 Notification System
- **Critical Alerts:** Low cash flow, high expenses, staff shortages
- **Daily Summaries:** End-of-day performance reports
- **Custom Alerts:** User-defined threshold notifications
- **Push Notifications:** Real-time alert delivery

### 3.3 Navigation Structure
```
Main Navigation:
├── Executive Dashboard
├── Professional Dashboard
│   ├── Patients
│   ├── Doctors
│   └── Revenue
├── Financial Dashboard
│   ├── Expenses
│   ├── Revenue
│   └── Profit/Loss
├── HR Dashboard
│   ├── Employees
│   ├── Salaries
│   └── Departments
└── Reports
    ├── Daily Reports
    ├── Weekly Reports
    └── Custom Reports
```

---

## 4. Technical Requirements

### 4.1 Platform Support
- **iOS:** iOS 14.0 and above
- **Android:** Android 8.0 (API level 26) and above
- **Framework:** React Native or Flutter
- **Backend:** RESTful API with GraphQL support

### 4.2 Performance Requirements
- **Load Time:** Initial app load < 3 seconds
- **Data Refresh:** < 2 seconds for dashboard updates
- **Offline Mode:** 7 days of cached data
- **Memory Usage:** < 150MB RAM usage

### 4.3 Security Requirements
- **API Security:** OAuth 2.0 + JWT tokens
- **Data Encryption:** AES-256 encryption
- **Certificate Pinning:** SSL/TLS certificate validation
- **Audit Logging:** Complete access audit trail

---

## 5. Environment Variables Configuration

### 5.1 Development Environment
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://dev-api.shaukat-hospital.local
REACT_APP_API_VERSION=v1
REACT_APP_API_TIMEOUT=30000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shaukat_hospital_dev
DB_USER=dev_user
DB_PASSWORD=dev_password_123

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://dev.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
JWT_SECRET=dev_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12

# Mobile App Configuration
REACT_APP_APP_NAME="Shaukat Hospital (Dev)"
REACT_APP_APP_VERSION=1.0.0-dev
REACT_APP_ENVIRONMENT=development

# Push Notifications
FCM_SERVER_KEY=dev_fcm_server_key
APNS_KEY_ID=dev_apns_key_id

# Security
ENCRYPTION_KEY=dev_encryption_key_32_chars
RATE_LIMIT_WINDOW=15min
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_OFFLINE_MODE=true
ENABLE_BIOMETRIC_AUTH=true
ENABLE_DARK_MODE=true
ENABLE_EXPORT_FEATURES=true

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
MAX_LOG_FILE_SIZE=10MB
```

### 5.2 Staging Environment
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://staging-api.shaukat-hospital.com
REACT_APP_API_TIMEOUT=20000

# Database Configuration
DB_HOST=staging-db.shaukat-hospital.com
DB_NAME=shaukat_hospital_staging
DB_PASSWORD=staging_secure_password_2024
DB_SSL_MODE=require

# Authentication
JWT_SECRET=staging_jwt_secret_key_2024_secure
JWT_EXPIRES_IN=12h

# Mobile App Configuration
REACT_APP_APP_NAME="Shaukat Hospital (Staging)"
REACT_APP_APP_VERSION=1.0.0-staging
REACT_APP_ENVIRONMENT=staging

# Security
ENCRYPTION_KEY=staging_encryption_key_32_chars_secure
RATE_LIMIT_WINDOW=10min
RATE_LIMIT_MAX_REQUESTS=150

# Logging
LOG_LEVEL=info
MAX_LOG_FILE_SIZE=20MB
```

### 5.3 Production Environment
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.shaukat-hospital.com
REACT_APP_API_TIMEOUT=15000

# Database Configuration
DB_HOST=prod-db-cluster.shaukat-hospital.com
DB_NAME=shaukat_hospital_production
DB_PASSWORD=${DB_PASSWORD_FROM_VAULT}
DB_SSL_MODE=require
DB_POOL_SIZE=20

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://prod.supabase.co
REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_FROM_VAULT}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY_FROM_VAULT}

# Authentication
JWT_SECRET=${JWT_SECRET_FROM_VAULT}
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=14

# Mobile App Configuration
REACT_APP_APP_NAME="Shaukat International Hospital"
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Push Notifications
FCM_SERVER_KEY=${FCM_SERVER_KEY_FROM_VAULT}
APNS_KEY_ID=${APNS_KEY_ID_FROM_VAULT}

# Security
ENCRYPTION_KEY=${ENCRYPTION_KEY_FROM_VAULT}
RATE_LIMIT_WINDOW=5min
RATE_LIMIT_MAX_REQUESTS=200

# Monitoring
HEALTH_CHECK_INTERVAL=30s
ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_FROM_VAULT}

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=6h
BACKUP_RETENTION_DAYS=30
```

---

## 6. Data Models & APIs

### 6.1 Core Data Entities

#### Patient Data
```typescript
interface Patient {
  id: string;
  patient_name: string;
  contact_number: string;
  doctor_name: string;
  opd_fee: number;
  lab_fee: number;
  ultrasound_fee: number;
  ecg_fee: number;
  ot_fee: number;
  created_at: string;
}
```

#### Doctor Data
```typescript
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  contact_number: string;
  email: string;
  is_active: boolean;
}
```

#### Expense Data
```typescript
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  paid_by: string;
  received_by: string;
}
```

#### Employee Data
```typescript
interface Employee {
  id: string;
  name: string;
  department: string;
  salary: number;
  hire_date: string;
  is_active: boolean;
}
```

### 6.2 API Endpoints
```
GET /api/v1/dashboard/executive
GET /api/v1/dashboard/professional
GET /api/v1/dashboard/financial
GET /api/v1/dashboard/hr
GET /api/v1/analytics/kpis
GET /api/v1/analytics/trends/{period}
WebSocket: /ws/dashboard-updates
```

---

## 7. User Stories

### 7.1 Hospital Owner/CEO
**As a hospital owner, I want to:**
- View overall hospital performance metrics on mobile
- Receive alerts for critical financial thresholds
- Monitor daily revenue and patient flow remotely
- Access executive summary reports anytime

**Acceptance Criteria:**
- Dashboard loads within 3 seconds
- Push notifications work reliably
- Offline access for last 24 hours of data

### 7.2 Chief Financial Officer (CFO)
**As a CFO, I want to:**
- Monitor daily financial performance
- Track expense trends and budget utilization
- Generate financial reports for meetings
- Set up custom financial alerts

**Acceptance Criteria:**
- Financial charts load instantly
- Export functionality works for all reports
- Custom alert thresholds configurable

### 7.3 Medical Director
**As a Medical Director, I want to:**
- Monitor doctor performance and patient load
- Track department efficiency metrics
- Access real-time operational data

**Acceptance Criteria:**
- Doctor rankings update in real-time
- Department metrics are comprehensive
- Mobile interface is intuitive

---

## 8. Implementation Phases

### 8.1 Phase 1: Foundation (Weeks 1-4)
**Deliverables:**
- Project setup and environment configuration
- Basic authentication and security
- Core API development
- Mobile app framework setup

**Key Features:**
- User authentication with biometric support
- Basic dashboard structure
- API integration with existing systems

### 8.2 Phase 2: Core Dashboards (Weeks 5-8)
**Deliverables:**
- Executive dashboard implementation
- Professional dashboard mobile views
- Financial dashboard with charts
- HR dashboard with analytics

**Key Features:**
- Interactive charts and visualizations
- Real-time data synchronization
- Push notification system

### 8.3 Phase 3: Advanced Features (Weeks 9-12)
**Deliverables:**
- Advanced analytics and reporting
- Custom alert configuration
- Performance optimization

**Key Features:**
- Predictive analytics
- Custom dashboard layouts
- Advanced filtering and search

### 8.4 Phase 4: Testing & Deployment (Weeks 13-16)
**Deliverables:**
- Comprehensive testing
- Security testing
- App store deployment

**Key Features:**
- Production deployment
- User training and documentation
- Monitoring setup

---

## 9. Success Criteria

### 9.1 Technical Metrics
- **App Performance:** Load time < 3 seconds
- **Reliability:** 99.9% uptime
- **User Adoption:** 90% active users within 3 months
- **Data Accuracy:** 99.5% consistency with source systems

### 9.2 Business Metrics
- **Decision Speed:** 50% reduction in decision time
- **Mobile Usage:** 70% of data access via mobile
- **Alert Response:** 80% improvement in response time
- **User Satisfaction:** 90% satisfaction score

---

## 10. Risk Assessment

### 10.1 Technical Risks
| Risk | Impact | Mitigation |
|------|---------|------------|
| Data sync failures | High | Robust retry mechanisms |
| Performance issues | Medium | Continuous monitoring |
| Security vulnerabilities | High | Regular audits |

### 10.2 Business Risks
| Risk | Impact | Mitigation |
|------|---------|------------|
| User adoption resistance | High | Training and change management |
| Budget overruns | Medium | Agile development |
| Timeline delays | Medium | Buffer time planning |

---

## 11. Technology Stack
- **Frontend:** React Native / Flutter
- **Backend:** Node.js with Express
- **Database:** PostgreSQL with Supabase
- **Cache:** Redis
- **Push Notifications:** Firebase Cloud Messaging
- **Security:** OAuth 2.0, JWT, AES-256 encryption

---

## 12. Conclusion

The Shaukat International Hospital Mobile Dashboard will provide executives with unprecedented access to critical operational data through a secure, intuitive mobile interface. By consolidating information from four dashboard systems, the app enables data-driven decision making from anywhere, improving operational efficiency and responsiveness.

The comprehensive environment configuration ensures smooth deployment across all environments, while the phased implementation minimizes risk and ensures quality delivery.

---

**Document End**
