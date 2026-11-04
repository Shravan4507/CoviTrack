import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputPath = 'Z:\\04-10-2026\\CoviTrack_Viva_Preparation_Guide.pdf';

const doc = new PDFDocument({
  size: 'A4',
  margin: 36,
  bufferPages: true,
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const primaryColor = '#0F172A';
const accentColor = '#2563EB';
const darkGray = '#334155';
const lightGray = '#64748B';
const boxBg = '#F8FAFC';
const boxBorder = '#E2E8F0';

function drawHeader(title: string, subtitle: string) {
  doc.rect(36, 36, 523, 4).fill(accentColor);
  doc.moveDown(0.8);
  doc.fontSize(16).fillColor(primaryColor).text(title, { align: 'center', bold: true } as any);
  if (subtitle) {
    doc.fontSize(10).fillColor(lightGray).text(subtitle, { align: 'center' });
  }
  doc.moveDown(0.5);
  doc.strokeColor(boxBorder).lineWidth(1).moveTo(36, doc.y).lineTo(559, doc.y).stroke();
  doc.moveDown(0.8);
}

function drawSectionTitle(title: string) {
  doc.fontSize(12).fillColor(accentColor).text(title, { bold: true } as any);
  doc.moveDown(0.3);
}

function drawQuestionBox(qNum: string, question: string, answer: string, keywords: string) {
  const startY = doc.y;
  doc.rect(36, startY, 523, 1).fill('#CBD5E1');
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor(primaryColor).text(`${qNum}. ${question}`, { bold: true } as any);
  doc.moveDown(0.2);

  doc.fontSize(9).fillColor(darkGray).text(answer, { lineGap: 2 });
  doc.moveDown(0.2);

  doc.fontSize(8).fillColor(accentColor).text(`Key Buzzwords to Say: ${keywords}`, { italic: true } as any);
  doc.moveDown(0.6);
}

// ==========================================
// PAGE 1: 30-Second Elevator Pitch & Architecture
// ==========================================
drawHeader('COVITRACK: STQA MINI-PROJECT VIVA GUIDE', 'Software Testing & Quality Assurance | Comprehensive Examiner Q&A Cheat Sheet');

drawSectionTitle('1. The 30-Second Explanation (Say this if asked to introduce your project)');
doc.rect(36, doc.y, 523, 75).fillAndStroke(boxBg, boxBorder);
doc.fontSize(9.5).fillColor(primaryColor)
  .text(
    '“Sir/Ma’am, CoviTrack is an end-to-end COVID-19 Clinical Management System paired with an automated QA testing robot.\n\n' +
    'The Web App handles patient registration, slot booking with capacity checks, staff confirmation, and printable PDF reports. ' +
    'The Selenium + TestNG QA Robot automatically opens Google Chrome, types patient details, attempts invalid inputs (like 9-digit phones), ' +
    'verifies database state, and prints a final QA Report Card PDF proving that all 47 test cases passed without human intervention.”',
    46, doc.y + 8, { width: 503, lineGap: 3 }
  );

doc.y += 85;

drawSectionTitle('2. System Architecture & Tech Stack (Know these 4 blocks)');
const techBoxY = doc.y;
doc.rect(36, techBoxY, 255, 105).fillAndStroke(boxBg, boxBorder);
doc.rect(304, techBoxY, 255, 105).fillAndStroke(boxBg, boxBorder);

doc.fontSize(10).fillColor(accentColor).text('Component A: Web Application', 46, techBoxY + 8, { bold: true } as any);
doc.fontSize(8.5).fillColor(darkGray)
  .text('• Frontend: React 18 + Vite + Plain CSS (Monochromatic)', 46, techBoxY + 24)
  .text('• Backend: Node.js + Express.js REST API', 46, techBoxY + 38)
  .text('• Database: Local MySQL (Port 3306 / 3307 isolated)', 46, techBoxY + 52)
  .text('• Concurrency: Row-level locking & ACID transactions', 46, techBoxY + 66)
  .text('• PDF Generator: PDFKit clinical laboratory certificates', 46, techBoxY + 80);

doc.fontSize(10).fillColor(accentColor).text('Component B: Automated QA Framework', 314, techBoxY + 8, { bold: true } as any);
doc.fontSize(8.5).fillColor(darkGray)
  .text('• Language: Java 17 (OpenJDK LTS)', 314, techBoxY + 24)
  .text('• Browser Engine: Selenium WebDriver 4.20 (Chrome)', 314, techBoxY + 38)
  .text('• Test Runner: TestNG 7.9.0 with priority ordering', 314, techBoxY + 52)
  .text('• Architecture: Page Object Model (POM)', 314, techBoxY + 66)
  .text('• Build & Reports: Apache Maven + Surefire + Custom PDF', 314, techBoxY + 80);

doc.y = techBoxY + 120;

drawSectionTitle('3. The Dual-Layer Regular Expression Guard (Defense-in-Depth)');
doc.fontSize(8.5).fillColor(darkGray).text(
  'Academic Requirement: Strict input validation using Regular Expressions must be implemented at both Client and Server levels.',
  { lineGap: 2 }
);
doc.moveDown(0.5);

const regexTableY = doc.y;
doc.rect(36, regexTableY, 523, 18).fill(primaryColor);
doc.fontSize(8).fillColor('#FFFFFF')
  .text('Field', 46, regexTableY + 5)
  .text('Regular Expression Pattern', 130, regexTableY + 5)
  .text('Strict Rule Enforced', 340, regexTableY + 5);

let curRowY = regexTableY + 18;
const regexList = [
  ['Full Name', '^[A-Za-z\\s]{3,50}$', '3 to 50 alphabetical letters and spaces only. Rejects digits & symbols.'],
  ['Mobile Number', '^[0-9]{10}$', 'Strictly 10 numeric digits. Rejects letters, symbols, and country codes.'],
  ['Email Address', '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'Standard RFC format with valid domain and top-level domain.'],
  ['Date of Birth', '^\\d{4}-\\d{2}-\\d{2}$ or ^\\d{2}-\\d{2}-\\d{4}$', 'Valid calendar date format with logic check ensuring date is in past.'],
  ['Password', 'Min 8 chars, 1 letter + 1 digit', 'Prevents weak passwords; hashed using bcrypt with salt rounds.'],
];

regexList.forEach((row, i) => {
  doc.rect(36, curRowY, 523, 22).fillAndStroke(i % 2 === 0 ? '#FFFFFF' : boxBg, boxBorder);
  doc.fontSize(8).fillColor(primaryColor).text(row[0], 46, curRowY + 6, { bold: true } as any);
  doc.fontSize(7.5).fillColor(accentColor).text(row[1], 130, curRowY + 6);
  doc.fontSize(7.5).fillColor(darkGray).text(row[2], 340, curRowY + 6);
  curRowY += 22;
});

// ==========================================
// PAGE 2: Core Testing Techniques (STQA Concepts)
// ==========================================
doc.addPage();
drawHeader('STQA CORE TESTING TECHNIQUES & CONCEPTS', 'Black-Box Testing, Page Object Model, and Synchronization');

drawQuestionBox(
  'Q1',
  'What is the Page Object Model (POM), and why did you use it?',
  'Page Object Model is a design pattern where each web page has its own corresponding Java class (e.g. RegisterPage.java). ' +
  'The page class stores all locators (By.id) and actions (enterName, clickSubmit). The test class contains only assertions. ' +
  'If a button ID changes tomorrow, we change it in ONE place without touching test cases, reducing code duplication and maintenance costs.',
  'Separation of Concerns, Locator Reusability, Maintainability, Anti-Duplication.'
);

drawQuestionBox(
  'Q2',
  'Explain Boundary Value Analysis (BVA) using your project fields.',
  'Boundary Value Analysis tests values at the boundaries of input domains where most defects occur.\n' +
  '• Mobile Number (Must be exactly 10 digits): We test 9 digits (Invalid, Just below), 10 digits (Valid, On boundary), and 11 digits (Invalid, Just above).\n' +
  '• Full Name (3 to 50 characters): We test 2 chars (Invalid), 3 chars (Valid lower boundary), 50 chars (Valid upper boundary), and 51 chars (Invalid).',
  'Boundary Edges, Just Below, On Boundary, Just Above, Off-by-one prevention.'
);

drawQuestionBox(
  'Q3',
  'Explain Equivalence Partitioning (EP) using your project fields.',
  'Equivalence Partitioning divides input data into valid and invalid classes where all values in a class behave identically.\n' +
  '• Mobile Field:\n' +
  '  - Valid Class: Any 10-digit number starting with 6, 7, 8, or 9 (e.g., 9822001122).\n' +
  '  - Invalid Class 1: Strings with letters/special characters (e.g., 9822abc!!).\n' +
  '  - Invalid Class 2: Negative numbers or numbers shorter than 10 digits.\n' +
  'Testing one representative from each class gives full coverage without testing millions of combinations.',
  'Valid Equivalence Class, Invalid Equivalence Class, Representative Sampling.'
);

drawQuestionBox(
  'Q4',
  'Why is Thread.sleep() bad, and how do you handle synchronization in Selenium?',
  'Thread.sleep() pauses execution blindly for a fixed duration, making tests either unnecessarily slow or flaky if network lags.\n' +
  'Instead, we use Explicit Waits (WebDriverWait) with ExpectedConditions. It dynamically polls the DOM every 500ms up to 10 seconds. ' +
  'The second the element appears or URL transitions, execution resumes immediately. Examples: visibilityOfElementLocated, elementToBeClickable.',
  'Explicit Wait, WebDriverWait, ExpectedConditions, Dynamic Polling, Flakiness Prevention.'
);

drawQuestionBox(
  'Q5',
  'What is the difference between Positive and Negative Testing in CoviTrack?',
  '• Positive Testing: Verifies the system works when given correct input (e.g., submitting valid details generates a PT-YYYY-XXXXX ID; valid credentials log in).\n' +
  '• Negative Testing: Intentionally feeding bad inputs (e.g., missing required fields, invalid regex patterns, wrong passwords, booking full slots) ' +
  'to verify the system safely catches the errors, displays user-friendly red alerts, and does NOT crash or corrupt the MySQL database.',
  'Happy Path, Error Handling, Graceful Degradation, Validation Alerts.'
);

// ==========================================
// PAGE 3: Top Viva Q&A (Execution, Concurrency & Defect Lifecycle)
// ==========================================
doc.addPage();
drawHeader('HIGH-YIELD VIVA QUESTIONS & ANSWERS', 'TestNG Lifecycle, Concurrency, and Defect Reporting');

drawQuestionBox(
  'Q6',
  'What are TestNG Listeners, and how did you use them in CoviTrack?',
  'We implemented TestExecutionListener which implements ITestListener. It acts as an event hook:\n' +
  '• onTestFailure(): Automatically captures a full-screen browser screenshot saved to test-results/screenshots/ and logs the failure stack trace.\n' +
  '• onTestSuccess(): Logs execution time and marks the test as PASSED.\n' +
  '• onFinish(): Triggers the executive QA PDF report generator.',
  'ITestListener, onTestFailure, Automated Screenshot Capture, Audit Trail.'
);

drawQuestionBox(
  'Q7',
  'How does CoviTrack prevent double-booking or overbooking of test slots?',
  'Through ACID database transactions with row-level locks (SELECT ... FOR UPDATE). When a patient books a slot, ' +
  'the backend locks the slot row, checks if current_bookings < max_capacity, increments current_bookings, and commits. ' +
  'If another user tries to book the same slot simultaneously, they are queued; once capacity hits 30/30, the second transaction safely rolls back with a 409 Conflict.',
  'Row-Level Locking, ACID Transactions, SELECT FOR UPDATE, Race Condition Prevention.'
);

drawQuestionBox(
  'Q8',
  'How do you guarantee Test Independence and Idempotency?',
  'Automated tests must never depend on each other or on existing database data. We achieve this by:\n' +
  '1. TestDataGenerator creates unique synthetic emails using timestamps (alex.patient.179372@covitrack.local), preventing duplicate key crashes.\n' +
  '2. @BeforeMethod navigates to clean URLs and resets state.\n' +
  '3. Isolated testing database (covitrack_test) ensures testing never alters production records.',
  'Idempotency, Synthetic Data, Timestamped Keys, Clean State.'
);

drawQuestionBox(
  'Q9',
  'What happens when an automated test fails? How is the report truthful?',
  'Maven Surefire captures the failure in test-results/selenium/testng-results.xml. Our report script parses this file at runtime. ' +
  'If failures exist, the PDF report is marked FAILED in BOLD RED, lists the exact failed test method, and quotes the error message. ' +
  'The report is dynamic and reflect real execution metrics—never hardcoded.',
  'Truthful Reporting, Surefire XML Parsing, Root Cause Logging, Dynamic PDF.'
);

drawQuestionBox(
  'Q10',
  'What is the difference between Headed and Headless browser testing?',
  '• Headed Mode (Live Demo): Chrome opens visibly on screen with deliberate human delays so examiners and stakeholders can watch the bot fill forms, click buttons, and book appointments.\n' +
  '• Headless Mode (CI/CD Regression): Chrome runs in background memory without rendering visual pixels. It runs 3x faster, uses less RAM, and is ideal for automated builds.',
  'Headed vs Headless, Visual Demonstration, CI/CD Pipeline, Execution Speed.'
);

// ==========================================
// PAGE 4: Trap Questions & Examiner Secrets
// ==========================================
doc.addPage();
drawHeader('EXAMINER TRAP QUESTIONS & DEFENSE STRATEGY', 'Tricky Questions Professors Ask to Test Deep Understanding');

drawQuestionBox(
  'Trap 1',
  '“Why did you write the Web App in TypeScript, but your Automation in Java?”',
  '“Sir/Ma’am, in professional enterprise QA, the automation framework is decoupled from the application technology stack. ' +
  'Selenium WebDriver with Java and TestNG is the global industry gold standard for QA Automation. By using Java/TestNG for automation ' +
  'and React/Node for the app, we simulated a real-world software engineering ecosystem where QA engineers test applications black-box via HTTP and browser DOM without relying on internal language bindings.”',
  'Decoupled Architecture, Industry Standard, Black-Box Verification.'
);

drawQuestionBox(
  'Trap 2',
  '“What if the host computer does not have MySQL installed?”',
  '“Our start.bat and run-demo.bat scripts feature self-healing zero-install portability. If port 3306 is not open or requires a password, ' +
  'our launcher script automatically downloads a portable MariaDB engine into bin/mysql, initializes the database cluster, runs migrations, ' +
  'and boots it on isolated port 3307 with zero manual setup required by the user.”',
  'Zero-Install, Portable Database, Port Fallback, Self-Healing Scripts.'
);

drawQuestionBox(
  'Trap 3',
  '“Why did you choose MySQL instead of MongoDB (NoSQL)?”',
  '“A clinical testing system requires strict referential integrity and ACID compliance. A diagnostic report MUST strictly reference a valid appointment, ' +
  'which MUST reference a registered patient and slot. Foreign keys, unique constraints, and row-level transactional locks in MySQL prevent orphan records and double-booking, which NoSQL databases cannot guarantee without complex application-level locking.”',
  'Referential Integrity, Foreign Keys, ACID Guarantees, Relational Normalization.'
);

drawSectionTitle('5. Quick 5-Step Viva Demonstration Checklist');
const checkY = doc.y;
doc.rect(36, checkY, 523, 75).fillAndStroke(boxBg, boxBorder);
doc.fontSize(8.5).fillColor(darkGray)
  .text('1. Double-click run-demo.bat in front of the examiner.', 46, checkY + 8)
  .text('2. Explain as Chrome opens: “Notice Chrome opens maximized. The script types with deliberate delays so you can observe the POM model in action.”', 46, checkY + 22)
  .text('3. Point out Registration: “Notice it enters valid name and 10-digit mobile, triggering our client-side Regex validator.”', 46, checkY + 36)
  .text('4. Point out Staff Login & Report: “Now it signs in as staff, verifies the appointment, and signs an official RT-PCR diagnostic report.”', 46, checkY + 50)
  .text('5. When PDF opens: “The servers automatically shut down, and our script parsed the TestNG results to generate this truthful QA Report PDF.”', 46, checkY + 64);

doc.end();

stream.on('finish', () => {
  console.log(`[Success] Complete Viva Preparation Guide PDF generated: ${outputPath}`);
});
