# CoviTrack - COVID-19 Information & Testing Management System

## 1. Project Overview

**CoviTrack** is a local, full-stack COVID-19 information and testing center management system developed as an academic engineering mini-project alongside a comprehensive Selenium WebDriver + TestNG automated testing framework.

The project addresses the real-world operational challenges faced by regional diagnostic centers during epidemic response:
- High volume patient registration with strict demographic and identification validation.
- Capacity-constrained appointment scheduling with transactional concurrency controls.
- Sample intake, specimen tracking, and status transitions through clinical laboratory workflows.
- Secure issuance of verifiable COVID-19 diagnostic reports with local printable PDF generation.
- Role-Based Access Control (RBAC) across three distinct actors: Patient, Authorized Staff, and System Administrator.
- Automated browser testing and regression validation executing against an isolated test environment.

---

## 2. Problem Definition

During high-demand health situations, manual tracking of testing appointments and results causes:
1. Overcrowding at testing centers due to unconstrained appointment booking.
2. Inconsistent patient record collection and invalid mobile numbers or identity formats.
3. Delayed delivery of diagnostic results to patients.
4. Security and authorization vulnerabilities where unauthorized parties can inspect third-party medical findings.
5. Inability to verify regression integrity and input handling due to a lack of automated QA testing.

---

## 3. Project Objectives

- **Full-Stack Web Development**: Functional React 18, Vite, TypeScript, and Express.js REST API.
- **Strict Monochromatic Architectural Design**: Dark monochromatic UI (#000000 black background, white text, 4px border radius, no shadows, no hover transitions) using plain CSS and D-DIN typography.
- **Relational Integrity**: Complete MySQL database architecture with transactional isolation, foreign keys, and indexes. Zero mock or fake application records.
- **Strict Input Validation**: Reusable Regular Expression validation on frontend and backend for Full Name, Email, Mobile Number, Synthetic ID, and Gregorian Dates.
- **Page Object Model (POM) Automation**: Selenium WebDriver 4, TestNG, Java 17, and Maven covering 47+ automated test scenarios with failure screenshot capture and logs.

