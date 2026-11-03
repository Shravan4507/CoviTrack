# Contributing to CoviTrack

Thank you for your interest in contributing to **CoviTrack**! We welcome contributions to both the clinical web application and the automated QA testing framework.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Development Workflow

### 1. Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x LTS
- **Java Development Kit (JDK)**: OpenJDK / Eclipse Adoptium 17+
- **Google Chrome**: Latest stable version
- **MySQL / MariaDB**: Version 8.0+ / 10.6+ (or use the built-in zero-install runner on Windows)

### 2. Fork and Clone
```bash
git clone https://github.com/Shravan4507/CoviTrack.git
cd CoviTrack
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Database Setup & Migrations
```bash
npm run db:migrate
npm run seed:admin
npm run seed:slots
```

### 5. Start Development Servers
```bash
npm run dev
```
- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://127.0.0.1:5000/api`

---

## Automated QA Testing Standards

When modifying forms, validation patterns, or workflow logic:
1. Ensure all Regular Expression specifications are strictly maintained in both `client/src/validators/regex.ts` and `server/src/validators/regex.validators.ts`.
2. Add or update corresponding Page Object models in `automation/src/test/java/com/covitrack/pages/`.
3. Verify the complete TestNG test suite:
   ```bash
   npm run test:automation
   ```
4. Verify that live browser demonstration passes:
   ```bash
   cd automation
   mvn test -Dtest=LiveDemoTest -Dheadless=false
   ```

---

## Commit Guidelines

We use conventional commit messages:
- `feat:` New user-facing feature or API endpoint
- `fix:` Bug fix or regex correction
- `test:` Adding or updating TestNG / Selenium tests
- `docs:` Documentation updates
- `refactor:` Code refactoring without behavioral changes
- `chore:` Dependency or build system updates

---

## Pull Request Process

1. Create a feature branch (`git checkout -b feat/your-feature-name`).
2. Verify all builds pass (`npm run build`).
3. Verify all automated tests pass (`npm run test:automation`).
4. Submit your pull request with a descriptive summary of changes and testing evidence.
