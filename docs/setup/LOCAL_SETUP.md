# Local Setup and Execution Guide

This guide details the exact setup instructions for running **CoviTrack** and its automated testing framework on Windows 11.

---

## 1. Prerequisites

Ensure the following runtimes and tools are installed on your Windows 11 system:
1. **Node.js**: v18.0.0 or higher (`node -v`, `npm -v`).
2. **Java JDK**: OpenJDK 17 or higher (`java -version`, `javac -version`).
3. **Apache Maven**: v3.8+ (`mvn -version`). Portable Maven 3.9.6 is installed under `C:\Users\shrav\tools\apache-maven-3.9.6\bin`.
4. **Google Chrome**: Latest version (driver managed automatically by Selenium Manager).
5. **Local MySQL Server**: MySQL 8.x or XAMPP MySQL running on `127.0.0.1:3306`.

---

## 2. Database Initialization

1. Start your local MySQL server (e.g. via XAMPP Control Panel or Windows Service `net start MySQL80`).
2. Verify MySQL is reachable on port `3306`.
3. Create the development and test databases:
   ```sql
   CREATE DATABASE IF NOT EXISTS `covitrack` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS `covitrack_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Configure environment credentials in `server/.env`:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=covitrack
   TEST_DB_NAME=covitrack_test
   ```
5. Run the database migration script:
   ```bash
   npm run db:migrate
   ```

---

## 3. Initial Administrator Provisioning

To securely establish your first system administrator account without hardcoding default credentials, run the CLI provisioning command:

```bash
npm run seed:admin -- --name "Super Administrator" --email "admin@covitrack.local" --mobile "9876543210" --password "AdminPass123!"
```

Or run interactively:
```bash
npm run seed:admin
```

---

## 4. Starting the Application

To start both the Express backend API and Vite frontend server simultaneously:

```bash
npm run dev
```

- **Backend API**: `http://127.0.0.1:5000` (Health Check: `http://127.0.0.1:5000/api/health`)
- **Frontend Web Portal**: `http://127.0.0.1:5173`

---

## 5. Running Automated QA Tests (Selenium + TestNG)

To execute the automated TestNG test suites using the isolated testing database (`covitrack_test`):

```bash
npm run test:automation
```

Or from the `automation` directory:
```bash
cd automation
mvn clean test
```

### Test Artifacts & Outputs
- **TestNG Execution Report**: `test-results/selenium/index.html` or `automation/target/surefire-reports/index.html`
- **Failure Screenshots**: `test-results/screenshots/*.png`
- **Execution Log**: `test-results/logs/execution.log`

