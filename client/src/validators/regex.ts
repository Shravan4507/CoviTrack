export const FULL_NAME_REGEX = /^[A-Za-z\s]{3,50}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const MOBILE_NUMBER_REGEX = /^[0-9]{10}$/;
export const SYNTHETIC_GOV_ID_REGEX = /^[0-9]{12}$/;
export const DATE_FORMAT_REGEX = /^\d{2}-\d{2}-\d{4}$/;
export const ISO_DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isValidFullName = (name: string): boolean => {
  return FULL_NAME_REGEX.test(name.trim());
};

export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  if (trimmed.length > 150) return false;
  return EMAIL_REGEX.test(trimmed);
};

export const isValidMobileNumber = (mobile: string): boolean => {
  return MOBILE_NUMBER_REGEX.test(mobile.trim());
};

export const isValidSyntheticGovId = (id: string): boolean => {
  return SYNTHETIC_GOV_ID_REGEX.test(id.trim());
};

export const isValidDateFormat = (dateStr: string): boolean => {
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

export const isValidIsoDate = (dateStr: string): boolean => {
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

export const isValidPassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 100) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
};

export const formatIsoToDdmmyyyy = (isoStr: string): string => {
  if (isValidIsoDate(isoStr)) {
    const [year, month, day] = isoStr.trim().split('-');
    return `${day}-${month}-${year}`;
  }
  return isoStr;
};

export const formatDdmmyyyyToIso = (dateStr: string): string => {
  if (isValidDateFormat(dateStr)) {
    const [day, month, year] = dateStr.trim().split('-');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

