# Software Requirements Specification (SRS)
## CoviTrack COVID-19 Information & Testing Management System

### 1. Introduction
#### 1.1 Purpose
This document provides the Software Requirements Specification (SRS) for the CoviTrack COVID-19 Information & Testing Management System.

#### 1.2 Scope
CoviTrack automates patient registration, appointment scheduling, specimen processing, and diagnostic report distribution for local clinical testing facilities. It includes an automated QA test suite using Selenium WebDriver and TestNG.

---

### 2. User Roles and Personas

1. **Patient**:
   - Registers for an account with mandatory demographic and contact fields.
   - Views testing slot availability.
   - Books diagnostic appointments (RT-PCR, Rapid Antigen, Antibody).
   - Views personal appointment history and cancels eligible bookings.
   - Views personal diagnostic reports and downloads official printable PDF documents.
2. **Authorized Staff Member**:
   - Creates and manages operating appointment slots with defined maximum capacities.
   - Confirms incoming patient bookings.
   - Manages appointment statuses ('booked' -> 'confirmed' -> 'completed', or 'cancelled').
   - Inspects registered patient directory and medical testing histories.
   - Enters clinical test findings ('positive', 'negative', 'inconclusive') and issues signed diagnostic reports.
3. **Administrator**:
   - Oversees system operations and inspects live relational database statistics.
   - Provisions new staff accounts with secure credentials.
   - Activates, deactivates, or suspends user accounts.
   - Audits chronological administrative and security logs.

---

### 3. Functional Requirements

#### FR-01: Patient Registration
- The system shall require Full Name, Email Address, 10-digit Mobile Number, Date of Birth, Address, and matching Password fields.
- The system shall reject duplicate emails and mobile numbers.
- The system shall automatically generate a unique Patient ID formatted as `PT-YYYY-XXXXX`.
- The system shall securely hash passwords using bcrypt before database insertion.

#### FR-02: Authentication & Session Management
- The system shall authenticate users using email and password.
- Successful authentication shall issue a secure, HTTP-only cookie containing a signed JWT token.
- The system shall strictly prevent unauthorized cross-role route and API access.

#### FR-03: Slot Scheduling & Capacity Control
- Staff and Administrators shall define testing slots with start time, end time, and maximum capacity.
- The system shall reject slot creation where start time is in the past or end time precedes start time.
- The system shall enforce transactional row locking (`SELECT FOR UPDATE`) to prevent concurrent overbooking past slot capacity.

#### FR-04: Appointment Booking & Lifecycle
- Patients shall book testing slots for RT-PCR, Rapid Antigen, or Antibody assays.
- The system shall issue a unique Booking Reference formatted as `COVI-BK-XXXXXX`.
- The system shall increment slot booking counts upon booking and decrement counts upon cancellation.
- Completed appointments shall not be cancellable.

#### FR-05: Diagnostic Reporting & PDF Generation
- Staff shall create diagnostic reports for confirmed/completed appointments.
- The system shall support test results: `positive`, `negative`, and `inconclusive`.
- The system shall automatically generate and locally store a printable PDF diagnostic report (`COVI-REP-XXXXXX.pdf`).
- Patients shall only access their own reports; cross-patient report inspection shall return HTTP 403 Forbidden.

#### FR-06: Administrative Monitoring & Audit Trail
- The system shall display aggregated database counts (patients, staff, appointments, reports).
- The system shall log security actions (user logins, registrations, appointments, reports, user status changes) into `audit_logs` without storing sensitive secrets.

---

### 4. Non-Functional Requirements

- **Security**: Passwords hashed with bcrypt; parameterized SQL queries against SQL injection; rate limiting on authentication routes; HTTP-only cookie session persistence.
- **Performance**: Route-level code splitting via React lazy loading; database indexing on foreign keys and lookup columns; database transactions with automatic rollback on errors.
- **Accessibility**: Semantic HTML5 tags; visible 2px keyboard focus states; support for `prefers-reduced-motion`.
- **Portability**: Runs locally on Windows 11 with Node.js 18+, OpenJDK 17+, and local MySQL (3306).

