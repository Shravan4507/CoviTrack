# CoviTrack

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-00758F.svg)](https://www.mysql.com/)
[![Selenium](https://img.shields.io/badge/Selenium-4.20-43B02A.svg)](https://www.selenium.dev/)
[![TestNG](https://img.shields.io/badge/TestNG-7.9-FF6600.svg)](https://testng.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Complete COVID-19 Information & Testing Management System + Automated Software Quality Assurance (QA) Testing Framework**

CoviTrack is an open-source, full-stack clinical management system engineered for COVID-19 testing centers, paired with a complete **Selenium WebDriver + TestNG** automated test suite. The system delivers end-to-end appointment scheduling, capacity-constrained slot allocation, patient registration with strict Regular Expression validation, and verifiable diagnostic laboratory report generation.

---

## Architecture Overview

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         CoviTrack System Architecture                  │
 └────────────────────────────────────────────────────────────────────────┘

   [ Patient / Staff / Admin ]
               │
               ▼
   ┌───────────────────────┐
   │ React 18 + Vite (SPA) │  Port 5173 (Monochromatic UI, Plain CSS, D-DIN)
   └───────────┬───────────┘
               │ HTTP REST (JSON / Cookies)
               ▼
   ┌───────────────────────┐
   │  Express + TypeScript │  Port 5000 (Auth, Slots, Appointments, Reports)
   └───────────┬───────────┘
               │ mysql2 Connection Pool & Transactions
               ▼
   ┌───────────────────────┐
   │  Local MySQL Database │  Port 3306 (`covitrack` relational schema)
   └───────────────────────┘
               ▲
               │ Direct DB Assertions & Automated Teardown
   ┌───────────┴───────────┐
   │ Automated QA Engine   │  Java 17 + Maven + TestNG 7.9 + Selenium 4.20
   └───────────────────────┘  (POM Architecture, 47 Automated Test Scenarios)
```

---

## Key Features

- **Strict Regular Expression Validation**: Enforces input integrity across client and server (3-50 char alphabetical names, RFC-compliant emails, strict 10-digit mobile numbers, past calendar DOBs).
- **Zero-Install Portability**: When cloned on a clean Windows machine without MySQL, the launcher automatically provisions a zero-install local database engine, writes configuration, builds schema, and seeds default data with zero manual configuration.
- **Role-Based Access Control (RBAC)**: Secure multi-tier authentication for `patient`, `staff`, and `admin` with protected route middleware and bcrypt hashing.
- **Capacity-Controlled Testing Slots**: Transactional booking engine with row-level locks preventing double-booking and slot exhaustion.
- **Verifiable Clinical Diagnostic PDF Reports**: Instant generation and download of cryptographically referenced RT-PCR laboratory diagnostic certificates.
- **One-Click Live Automation & Executive Reporting**: Run visible, human-paced browser test runs that automatically compile and open a verified QA Test Execution PDF report upon completion.

---

## One-Click Quick Start (Windows)

Simply clone the repository and double-click either runner from File Explorer:

| Launcher | Description |
| :--- | :--- |
| **[`start.bat`](start.bat)** | **Run the Full Web Application**: Automatically verifies Node.js, provisions and boots local MySQL, executes schema migrations, seeds default admin/slots, builds frontend/backend, and launches `http://127.0.0.1:5173` in your default browser. |
| **[`run-demo.bat`](run-demo.bat)** | **Run Live Automated QA Demonstration**: Launches Google Chrome maximized with deliberate human-paced typing delays, registers a patient, books an appointment, logs in as staff to confirm, generates a diagnostic report, terminates background services, and **automatically launches the executive QA Report PDF**. |

---

## Manual Setup (Cross-Platform: Linux, macOS, Windows)

If you prefer using the command line:

### 1. Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x LTS ([Download Node.js](https://nodejs.org/))
- **Java Development Kit**: JDK 17+ ([Download Eclipse Adoptium JDK](https://adoptium.net/))
- **Apache Maven**: 3.9+ ([Download Maven](https://maven.apache.org/))
- **Google Chrome**: Latest stable release
- **MySQL / MariaDB**: Running locally on `127.0.0.1:3306`

### 2. Clone and Install
```bash
git clone https://github.com/Shravan4507/CoviTrack.git
cd CoviTrack

# Install root, client, and server dependencies in one command:
npm run install:all
```

### 3. Database Initialization
Verify database credentials in `server/.env` (defaults to host: `127.0.0.1`, port: `3306`, user: `root`, password: `""`), then run:
```bash
# Execute schema migration:
npm run db:migrate

# Seed default administrator:
npm run seed:admin

# Seed active testing center slots:
npm run seed:slots
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Web Application Portal**: `http://127.0.0.1:5173`
- **REST API Backend**: `http://127.0.0.1:5000` (Health Check: `http://127.0.0.1:5000/api/health`)

---

## Default System Credentials

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@covitrack.local` | `AdminPass123!` | System stats, staff management, audit logs |
| **Testing Staff** | `staff@covitrack.local` | `StaffPass123!` | Slot creation, queue management, diagnostic reports |
| **Patient** | Self-registered via `/register` | User-defined | Appointment scheduling, test history, PDF reports |

---

## Automated QA Testing Framework

The automation suite is housed in [`automation/`](automation/) and built upon the **Page Object Model (POM)** pattern.

### Running Automated Tests

```bash
# Run the complete test suite headless via Maven:
npm run test:automation

# Run specific test suites:
cd automation
mvn test -Dtest=RegexValidationTests
mvn test -Dtest=RegistrationTests
mvn test -Dtest=AuthenticationTests
mvn test -Dtest=AppointmentTests
mvn test -Dtest=DiagnosticReportTests

# Run the live visual browser demonstration in headed mode:
mvn test -Dtest=LiveDemoTest -Dheadless=false
```

### Test Suite Coverage Matrix

| Test Suite | Scenarios | Target Scope |
| :--- | :--- | :--- |
| **Regex Validation** | TC-36 – TC-47 | Full Name, RFC Email, 10-Digit Mobile, Synthetic Gov ID, ISO/Standard Dates |
| **Patient Registration** | TC-01 – TC-10 | Mandatory inputs, duplicate prevention, date of birth limits, password criteria |
| **Authentication & RBAC** | TC-11 – TC-17 | Session token creation, invalid credentials, protected route redirection, logout |
| **Slot Scheduling** | TC-18 – TC-25 | Capacity enforcement, concurrent allocation locks, slot status transitions |
| **Patient Directory** | TC-26 – TC-30 | Search by Patient ID, mobile, full name; RBAC security guard verification |
| **Diagnostic Reports** | TC-31 – TC-35 | Result entry, report reference generation, PDF generation, duplicate locks |

### Regular Expression Specifications

| Input Field | Canonical Regex Pattern | Validation Rule |
| :--- | :--- | :--- |
| **Full Legal Name** | `^[A-Za-z\s]{3,50}$` | 3 to 50 alphabetical letters and single spaces. Rejects numbers and symbols. |
| **Email Address** | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | Standard RFC-compliant email structure with valid domain and top-level domain. |
| **Mobile Number** | `^[0-9]{10}$` | Exactly 10 numeric digits. Rejects characters, special symbols, and prefixes. |
| **Synthetic Gov ID** | `^[0-9]{12}$` | Exactly 12 numeric digits for synthetic verification without storing real citizen IDs. |
| **Date Format** | `^\d{2}-\d{2}-\d{4}$` | Strict calendar date in DD-MM-YYYY format with Gregorian boundary checking. |

---

## REST API Endpoints Summary

```text
POST   /api/auth/register            Register new patient account
POST   /api/auth/login               Authenticate user & issue HTTP-only cookie
POST   /api/auth/logout              Invalidate active session
GET    /api/auth/me                  Retrieve authenticated session profile

GET    /api/patient/dashboard        Patient profile, appointment count & stats
GET    /api/patient/appointments     List all appointments for authenticated patient
GET    /api/patient/reports          List diagnostic reports for authenticated patient

GET    /api/appointments/slots       Retrieve active testing slots with available spots
POST   /api/appointments/book        Book a capacity-constrained testing appointment
PATCH  /api/appointments/:id/cancel  Cancel a scheduled appointment

GET    /api/reports                  Retrieve authorized diagnostic reports
POST   /api/reports                  Issue clinical test result (Staff/Admin only)
GET    /api/reports/:id/pdf          Download official printable PDF test certificate

GET    /api/admin/stats              Live aggregate database metrics
GET    /api/admin/users              List registered users with role and status filters
POST   /api/admin/staff              Provision new staff account
GET    /api/admin/audit-logs         Chronological security audit trail
```

---

## Project Structure

```text
CoviTrack/
├── .github/                      # GitHub Issue and Pull Request templates
├── automation/                   # Selenium WebDriver + TestNG Java test framework
│   ├── pom.xml                   # Maven dependencies and test plugins
│   ├── testng.xml                # TestNG execution suite descriptor
│   └── src/test/java/com/covitrack/
│       ├── base/                 # BaseTest setup, teardown, browser drivers
│       ├── config/               # Test configuration properties
│       ├── pages/                # Page Object Model classes
│       ├── tests/                # TestNG test suites (47 test cases)
│       └── utils/                # DB helpers, screenshot capture, data generators
├── client/                       # React 18 + Vite 5 + TypeScript frontend
│   ├── src/components/           # Reusable UI components (forms, modals, tables)
│   ├── src/pages/                # Public, patient, staff, and admin route views
│   ├── src/services/             # Centralized Axios API service layer
│   └── src/styles/               # Plain CSS styles (monochromatic, strict 4px radius)
├── server/                       # Node.js + Express + TypeScript REST API
│   ├── src/controllers/          # Route controller handlers
│   ├── src/database/             # Schema, migrations, connection pool
│   ├── src/middleware/           # Authentication, authorization, error handling
│   ├── src/repositories/         # Database queries and transactions
│   ├── src/routes/               # Express API endpoints
│   ├── src/scripts/              # Migration, admin creation, slot seeding, PDF report
│   └── src/services/             # Business logic (Auth, Appointment, PDF generation)
├── docs/                         # Architecture, SRS, Test Plan, Defect Reports
├── storage/reports/              # Local storage for generated diagnostic report PDFs
├── test-results/                 # TestNG reports, screenshots, execution logs
├── start.bat                     # Double-click one-click application launcher
├── run-demo.bat                  # Double-click visible Selenium demo & PDF launcher
├── CONTRIBUTING.md               # Contribution and pull request guidelines
├── CODE_OF_CONDUCT.md            # Contributor Covenant Code of Conduct
├── LICENSE                       # MIT Open Source License
└── package.json                  # Root orchestration and scripts
```

---

## Contributing

Contributions are warmly welcomed! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## License

This project is licensed under the [MIT License](LICENSE).
