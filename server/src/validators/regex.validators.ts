/**
 * CoviTrack Regular Expression Validators
 * Enforces strict input validation specifications as mandated by academic QA requirements.
 */

export const FULL_NAME_REGEX = /^[A-Za-z\s]{3,50}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const MOBILE_NUMBER_REGEX = /^[0-9]{10}$/;
export const SYNTHETIC_GOV_ID_REGEX = /^[0-9]{12}$/;
export const DATE_FORMAT_REGEX = /^\d{2}-\d{2}-\d{4}$/;
export const ISO_DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates Full Name: 3 to 50 alphabetical characters and spaces only.
 */
export const isValidFullName = (name: unknown): boolean => {
  if (typeof name !== 'string') return false;
  return FULL_NAME_REGEX.test(name.trim());
};

/**
 * Validates Email Address: standard email format.
 */
export const isValidEmail = (email: unknown): boolean => {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 150) return false;
  return EMAIL_REGEX.test(trimmed);
};

/**
 * Validates Mobile Number: exactly 10 digits, numeric only.
 */
export const isValidMobileNumber = (mobile: unknown): boolean => {
  if (typeof mobile !== 'string') return false;
  return MOBILE_NUMBER_REGEX.test(mobile.trim());
};

/**
 * Validates Synthetic Government Identifier: exactly 12 digits, numeric only.
 * Used exclusively for academic test verification without persisting real personal IDs.
 */
export const isValidSyntheticGovId = (id: unknown): boolean => {
  if (typeof id !== 'string') return false;
  return SYNTHETIC_GOV_ID_REGEX.test(id.trim());
};

/**
 * Validates Calendar Date in DD-MM-YYYY format and checks for valid Gregorian calendar date.
 */
export const isValidDateFormat = (dateStr: unknown): boolean => {
  if (typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (!DATE_FORMAT_REGEX.test(trimmed)) return false;

  const [dayStr, monthStr, yearStr] = trimmed.split('-');
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

/**
 * Validates ISO Calendar Date in YYYY-MM-DD format (used in HTML date inputs and DB storage).
 */
export const isValidIsoDate = (dateStr: unknown): boolean => {
  if (typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (!ISO_DATE_FORMAT_REGEX.test(trimmed)) return false;

  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

/**
 * Validates Password Strength: minimum 8 characters, at least 1 letter and 1 number.
 */
export const isValidPassword = (password: unknown): boolean => {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 100) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
};

/**
 * Helper to convert DD-MM-YYYY to YYYY-MM-DD for database persistence.
 */
export const formatDdmmyyyyToIso = (dateStr: string): string => {
  if (isValidDateFormat(dateStr)) {
    const [day, month, year] = dateStr.trim().split('-');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

/**
 * Helper to convert YYYY-MM-DD to DD-MM-YYYY for display.
 */
export const formatIsoToDdmmyyyy = (isoStr: string): string => {
  if (isValidIsoDate(isoStr)) {
    const [year, month, day] = isoStr.trim().split('-');
    return `${day}-${month}-${year}`;
  }
  return isoStr;
};

