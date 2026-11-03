# Software Defect Report Template & Defect Tracking Log

## 1. Defect Report Template

| Field | Description |
|---|---|
| **Defect ID** | Unique defect tracking identifier (e.g. DEF-001) |
| **Title** | Concise summary of the defect |
| **Module / Component** | Target subsystem (Registration, Authentication, Slots, Reports) |
| **Severity** | Critical, High, Medium, Low |
| **Priority** | P1 (Urgent), P2 (High), P3 (Normal), P4 (Low) |
| **Environment** | OS, Browser, Node.js version, Java version, MySQL version |
| **Steps to Reproduce** | Numbered sequence of steps leading to the anomaly |
| **Expected Result** | Specified behavior per requirements |
| **Actual Result** | Observed erroneous behavior |
| **Screenshot / Log** | Reference to captured artifact in `test-results/screenshots/` |
| **Status** | New, Open, In Progress, Resolved, Verified, Closed |

---

## 2. Verified Defect Resolution Log

### DEF-001: Mobile Number Field Permitted Special Characters
- **Module**: Registration
- **Severity**: High | **Priority**: P1
- **Description**: The mobile number input was allowing hyphens and plus symbols.
- **Root Cause**: Regex in client was missing strict `^[0-9]{10}$` anchor.
- **Resolution**: Updated frontend and backend validators with identical strict numeric 10-digit pattern `^[0-9]{10}$`.
- **Status**: Resolved & Verified (Scenario 42 passing).

### DEF-002: Concurrent Slot Booking Exceeded Configured Capacity
- **Module**: Appointment Scheduling
- **Severity**: Critical | **Priority**: P1
- **Description**: Rapid simultaneous bookings could exceed `max_capacity`.
- **Root Cause**: Read-modify-write without row-level lock.
- **Resolution**: Added `SELECT ... FOR UPDATE` row lock inside MySQL database transaction (`withTransaction`) in `SlotRepository.findByIdForUpdate`.
- **Status**: Resolved & Verified (Scenario 22 passing).

### DEF-003: Patient Could Inadvertently Access Another Patient's PDF Report
- **Module**: Diagnostic Reporting
- **Severity**: Critical | **Priority**: P1
- **Description**: Direct ID manipulation in `/api/reports/:id/pdf` permitted unauthorized report viewing.
- **Root Cause**: Controller was not verifying that `report.patientId === req.user.userId` for patient roles.
- **Resolution**: Added strict role and patient ID ownership checks in `ReportService.getReportById` returning HTTP 403 Forbidden.
- **Status**: Resolved & Verified (Scenario 33 passing).

