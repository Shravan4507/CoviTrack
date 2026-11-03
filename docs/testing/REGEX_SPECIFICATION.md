# Regular Expression Validation Specifications

This document defines the baseline Regular Expression validation rules implemented in both frontend (`client/src/validators/regex.ts`) and backend (`server/src/validators/regex.validators.ts`).

---

## 1. Full Legal Name Pattern

- **Regex**: `^[A-Za-z\s]{3,50}$`
- **Specification**:
  - Minimum length: 3 characters.
  - Maximum length: 50 characters.
  - Character set: English alphabetical characters (uppercase and lowercase) and whitespace.
  - Disallowed: Numeric digits, punctuation, and special symbols.

### Test Matrix
| Input Value | Expected Result | Classification |
|---|---|---|
| `Aarav Sharma` | Valid | Positive |
| `Dr Jane Smith` | Valid | Positive |
| `Al` | Invalid (Length < 3) | Negative (Boundary) |
| `John Doe 123` | Invalid (Contains digits) | Negative |
| `John@Doe` | Invalid (Special symbol) | Negative |

---

## 2. Email Address Pattern

- **Regex**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Specification**:
  - Valid username prefix containing alphanumeric characters, dots, underscores, percentage, plus, or hyphens.
  - Exactly one `@` symbol.
  - Valid domain name followed by top-level domain with at least 2 alphabetical characters.
  - Total length cap: 150 characters.

### Test Matrix
| Input Value | Expected Result | Classification |
|---|---|---|
| `patient.care@covitrack.local` | Valid | Positive |
| `user123@hospital.org` | Valid | Positive |
| `plainaddress` | Invalid (Missing @ and domain) | Negative |
| `user@.com` | Invalid (Missing domain label) | Negative |

---

## 3. Mobile Number Pattern

- **Regex**: `^[0-9]{10}$`
- **Specification**:
  - Length: Exactly 10 numeric digits.
  - Disallowed: Letters, hyphens, spaces, country codes (+91), or punctuation.

### Test Matrix
| Input Value | Expected Result | Classification |
|---|---|---|
| `9876543210` | Valid | Positive |
| `987654321` | Invalid (9 digits) | Negative (Boundary) |
| `98765432109` | Invalid (11 digits) | Negative (Boundary) |
| `987654321a` | Invalid (Alphabetic character) | Negative |
| `+919876543210` | Invalid (Prefix symbols) | Negative |

---

## 4. Synthetic Government Identifier Pattern

- **Regex**: `^[0-9]{12}$`
- **Specification**:
  - Length: Exactly 12 numeric digits.
  - Purpose: Purely synthetic verification for QA academic regex testing.
  - Policy: Real personal national identity numbers are never persisted or collected.

### Test Matrix
| Input Value | Expected Result | Classification |
|---|---|---|
| `123456789012` | Valid | Positive |
| `12345678901` | Invalid (11 digits) | Negative (Boundary) |
| `1234567890123` | Invalid (13 digits) | Negative (Boundary) |

---

## 5. Calendar Date Pattern (DD-MM-YYYY)

- **Regex**: `^\d{2}-\d{2}-\d{4}$`
- **Specification**:
  - Two-digit day, hyphen, two-digit month, hyphen, four-digit year.
  - In addition to regex pattern matching, Gregorian calendar validation is strictly enforced.
  - Rejects impossible calendar dates (e.g. 31st February, 29th Feb on non-leap years, 32nd January).

### Test Matrix
| Input Value | Expected Result | Classification |
|---|---|---|
| `15-08-1995` | Valid | Positive |
| `29-02-2024` | Valid (2024 Leap Year) | Positive (Boundary) |
| `29-02-2023` | Invalid (2023 Not a Leap Year) | Negative (Gregorian logic) |
| `31-02-2024` | Invalid (February has <= 29 days) | Negative (Gregorian logic) |
| `15/08/1995` | Invalid (Slash separator) | Negative |

