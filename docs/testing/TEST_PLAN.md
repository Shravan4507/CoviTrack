# Software Test Plan (STP)
## CoviTrack Automated QA Testing Framework

### 1. Introduction & Strategy
The CoviTrack Automated QA framework provides end-to-end regression, functional, positive, and negative testing across all core modules of the application. It employs the **Page Object Model (POM)** pattern using Selenium WebDriver 4, TestNG, Java 17, and Maven.

### 2. Scope of Testing

#### 2.1 In Scope
- **Regex & Input Validation**: Validation of full name, email, 10-digit mobile, 12-digit synthetic identifier, DD-MM-YYYY date formats, and calendar dates.
- **Patient Registration**: Positive user registration, empty mandatory inputs, malformed contact info, password mismatch, duplicate email/mobile rejection.
- **Authentication & RBAC**: Valid login, invalid passwords, non-existent accounts, session logout, protected route access guards, role-based access restrictions.
- **Appointment Scheduling**: Available slot display, capacity limits, concurrent booking locking, patient appointment cancellation, staff confirmation and status progression.
- **Patient Management**: Patient directory listing, query searches by ID, mobile, and name; unauthorized directory access guards.
- **Diagnostic Reports**: Report creation by authorized personnel, clinical findings recording, printable PDF generation, cross-patient access prevention.

#### 2.2 Out of Scope
- External payment gateway integration.
- Remote third-party cloud database access (strictly isolated local MySQL).

---

### 3. Test Environment & Database Isolation

- **Application Development Database**: `covitrack` on `127.0.0.1:3306` (No fabricated test records allowed).
- **Automated QA Database**: `covitrack_test` on `127.0.0.1:3306`.
- **Browser**: Google Chrome via Selenium Manager.
- **Headless Execution**: Configured via `TestConfig.HEADLESS` (default `true` for CI/CD, can be toggled via `-Dheadless=false`).

---

### 4. Test Execution Framework

- **Base Class (`BaseTest`)**: Manages browser lifecycle, explicit waits, and page navigation.
- **Page Objects (`com.covitrack.pages.*`)**: Encapsulates web elements and UI interactions.
- **Listeners (`TestExecutionListener`)**: Automatically captures failure screenshots to `test-results/screenshots/` and writes execution metrics to `test-results/logs/execution.log`.
- **Database Helper (`DbTestHelper`)**: Cleans up synthetic test users between suite runs.

---

### 5. Pass / Fail Criteria
- **Pass**: Expected web element or URL transition is verified; server returns expected HTTP status and response payload; database records reflect valid mutations.
- **Fail**: Unexpected exception, timeout, element not found, assertion failure, or HTTP error response.

