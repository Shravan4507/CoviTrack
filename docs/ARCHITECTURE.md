# CoviTrack System Architecture

## 1. Architectural Overview

CoviTrack is structured around a decoupled multi-tier architecture consisting of:
1. **Client Tier**: Single Page Application (SPA) built with React 18, Vite, TypeScript, and Plain CSS.
2. **Backend Application Tier**: Express.js REST API in TypeScript utilizing layered architectural separation (Routes, Controllers, Services, Repositories).
3. **Database Tier**: Relational MySQL database (`covitrack` for production/development; `covitrack_test` for automated QA).
4. **Automation QA Tier**: Java 17, Selenium WebDriver 4, TestNG, and Maven using the Page Object Model (POM).

```
                      +---------------------------------------+
                      |       Client Application Tier         |
                      |   React 18 + Vite + TypeScript        |
                      |   D-DIN Typography + Plain CSS        |
                      +---------------------------------------+
                                          |
                                HTTP / Cookie / REST JSON
                                          v
                      +---------------------------------------+
                      |         Backend API Layer             |
                      | Express.js + Middleware + Validators   |
                      | Auth (JWT/HttpOnly) + Rate Limiter    |
                      +---------------------------------------+
                        |                 |                 |
                   Controllers        Services         PDFKit
                        |                 |                 |
                   Repositories       Repositories          v
                        |                 |          storage/reports/
                        +--------+--------+          (*.pdf records)
                                 |
                          mysql2 / Pool
                                 v
                      +---------------------------------------+
                      |         Relational Storage            |
                      |       Local MySQL 8.x / MariaDB       |
                      |  covitrack  |  covitrack_test (QA)    |
                      +---------------------------------------+
                                 ^
                                 |  JDBC (DB Verification)
                      +---------------------------------------+
                      |        Automated QA Tier              |
                      | Selenium WebDriver 4 + TestNG (Java)  |
                      | Page Object Model + Failure Captures  |
                      +---------------------------------------+
```

---

## 2. Layered Backend Design

- **Routes (`src/routes`)**: Define REST HTTP endpoints, bind route middleware (`authenticateToken`, `requireRole`, `authRateLimiter`).
- **Middleware (`src/middleware`)**: Verify HTTP-only session cookies or Bearer tokens, enforce role authorization, capture centralized unhandled errors.
- **Controllers (`src/controllers`)**: Parse incoming HTTP request parameters, invoke service logic, and structure uniform JSON HTTP responses.
- **Services (`src/services`)**: Enforce business rules, orchestrate database transactions (`withTransaction`), generate cryptographic hashes, manage capacity checks, and invoke PDF generation.
- **Repositories (`src/repositories`)**: Encapsulate parameterized SQL queries using `mysql2/promise` connection pools.
- **Database (`src/database`)**: Connection pooling, migration runner, and initial SQL relational schema.

---

## 3. Database Schema Design

| Table Name | Primary Purpose | Key Constraints |
|---|---|---|
| `users` | Core user identity & authentication | `email` UNIQUE, `mobile_number` UNIQUE, `role` ENUM |
| `patient_profiles` | Extended patient demographic data | `user_id` FK (CASCADE), `patient_id_number` UNIQUE |
| `appointment_slots` | Center operating windows & capacities | `created_by` FK (RESTRICT), `max_capacity` INT |
| `appointments` | Patient bookings for testing slots | `slot_id` FK, `patient_id` FK, `booking_reference` UNIQUE |
| `diagnostic_reports` | Official clinical test results & PDF paths | `appointment_id` UNIQUE FK, `report_reference` UNIQUE |
| `audit_logs` | Immutable audit trail for administrative actions | `user_id` FK (SET NULL), timestamped actions |

---

## 4. UI/UX Strict Monochromatic Design Language

The frontend complies strictly with the project styling directives:
- **Base Background**: `#000000` (Pure Black).
- **Surfaces & Cards**: `#0A0A0A` and `#111111` with monochromatic `#222222` and `#333333` borders.
- **Typography**: `D-DIN` font family with high-contrast `#FFFFFF` primary and `#A0A0A0` secondary colors.
- **Strict Geometry**: Border radius is strictly `4px` across buttons, cards, badges, inputs, and modals.
- **No Hover Effects**: Zero hover scaling, zero background transitions on mouseover.
- **No Shadows**: `box-shadow: none !important` universally enforced.
- **Semantic Restraint**: Red (`#EF4444`) restricted to errors and positive viral detection; Amber (`#F59E0B`) for warnings and inconclusive tests.

