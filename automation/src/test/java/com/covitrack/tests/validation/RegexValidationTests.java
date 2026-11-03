package com.covitrack.tests.validation;

import com.covitrack.base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.regex.Pattern;

/**
 * Phase 5 & Phase 9.2: Regular Expression and Academic Validation Specification Tests
 * Scenarios 36 to 47
 */
public class RegexValidationTests extends BaseTest {

    private static final Pattern FULL_NAME_PATTERN = Pattern.compile("^[A-Za-z\\s]{3,50}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^[0-9]{10}$");
    private static final Pattern SYNTHETIC_ID_PATTERN = Pattern.compile("^[0-9]{12}$");
    private static final Pattern DATE_PATTERN = Pattern.compile("^\\d{2}-\\d{2}-\\d{4}$");

    private boolean isValidGregorianDate(String dateStr) {
        if (!DATE_PATTERN.matcher(dateStr).matches()) {
            return false;
        }
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
        sdf.setLenient(false);
        try {
            sdf.parse(dateStr);
            return true;
        } catch (ParseException e) {
            return false;
        }
    }

    // Scenario 36: Valid Full Name
    @Test(priority = 1, description = "Scenario 36: Valid Full Name containing alphabetical characters and spaces")
    public void testValidFullName() {
        Assert.assertTrue(FULL_NAME_PATTERN.matcher("Aarav Sharma").matches());
        Assert.assertTrue(FULL_NAME_PATTERN.matcher("John Doe").matches());
        Assert.assertTrue(FULL_NAME_PATTERN.matcher("Dr Jane Smith").matches());
    }

    // Scenario 37: Invalid Full Name
    @Test(priority = 2, description = "Scenario 37: Invalid Full Name containing digits, special characters or too short")
    public void testInvalidFullName() {
        Assert.assertFalse(FULL_NAME_PATTERN.matcher("Al").matches(), "Should reject names < 3 characters");
        Assert.assertFalse(FULL_NAME_PATTERN.matcher("John123").matches(), "Should reject digits");
        Assert.assertFalse(FULL_NAME_PATTERN.matcher("John@Doe").matches(), "Should reject special characters");
        Assert.assertFalse(FULL_NAME_PATTERN.matcher("This Name Is Way Too Long To Be Accepted By The Regex Which Caps At Fifty Characters Exact").matches(), "Should reject names > 50 characters");
    }

    // Scenario 38: Valid Email Format
    @Test(priority = 3, description = "Scenario 38: Valid Email Format according to RFC specifications")
    public void testValidEmailFormat() {
        Assert.assertTrue(EMAIL_PATTERN.matcher("patient.care@covitrack.local").matches());
        Assert.assertTrue(EMAIL_PATTERN.matcher("user123@hospital.org").matches());
        Assert.assertTrue(EMAIL_PATTERN.matcher("test.user+tag@domain.co.in").matches());
    }

    // Scenario 39: Invalid Email Format
    @Test(priority = 4, description = "Scenario 39: Invalid Email Format missing @, domain or tld")
    public void testInvalidEmailFormat() {
        Assert.assertFalse(EMAIL_PATTERN.matcher("plainaddress").matches());
        Assert.assertFalse(EMAIL_PATTERN.matcher("@missingusername.com").matches());
        Assert.assertFalse(EMAIL_PATTERN.matcher("user@.com").matches());
        Assert.assertFalse(EMAIL_PATTERN.matcher("user@domain").matches());
    }

    // Scenario 40: Valid Ten-Digit Mobile Number
    @Test(priority = 5, description = "Scenario 40: Valid Ten-Digit Mobile Number")
    public void testValidMobileNumber() {
        Assert.assertTrue(MOBILE_PATTERN.matcher("9876543210").matches());
        Assert.assertTrue(MOBILE_PATTERN.matcher("8765432109").matches());
    }

    // Scenario 41: Mobile Number Shorter Than Ten Digits
    @Test(priority = 6, description = "Scenario 41: Mobile Number Shorter Than Ten Digits")
    public void testMobileNumberShorterThanTenDigits() {
        Assert.assertFalse(MOBILE_PATTERN.matcher("987654321").matches(), "Should reject 9 digits");
        Assert.assertFalse(MOBILE_PATTERN.matcher("12345").matches(), "Should reject 5 digits");
    }

    // Scenario 42: Mobile Number Containing Alphabetic Characters
    @Test(priority = 7, description = "Scenario 42: Mobile Number Containing Alphabetic Characters or Special Symbols")
    public void testMobileNumberWithAlphabeticCharacters() {
        Assert.assertFalse(MOBILE_PATTERN.matcher("987654321a").matches(), "Should reject alphabets");
        Assert.assertFalse(MOBILE_PATTERN.matcher("9876-54321").matches(), "Should reject hyphens");
        Assert.assertFalse(MOBILE_PATTERN.matcher("+9198765432").matches(), "Should reject plus prefix in strict 10-digit field");
    }

    // Scenario 43: Valid Twelve-Digit Synthetic Identifier
    @Test(priority = 8, description = "Scenario 43: Valid Twelve-Digit Synthetic Identifier (Academic Test)")
    public void testValidTwelveDigitSyntheticId() {
        Assert.assertTrue(SYNTHETIC_ID_PATTERN.matcher("123456789012").matches());
        Assert.assertTrue(SYNTHETIC_ID_PATTERN.matcher("987654321098").matches());
    }

    // Scenario 44: Invalid Identifier Length
    @Test(priority = 9, description = "Scenario 44: Invalid Identifier Length (< 12 or > 12 digits)")
    public void testInvalidIdentifierLength() {
        Assert.assertFalse(SYNTHETIC_ID_PATTERN.matcher("12345678901").matches(), "Should reject 11 digits");
        Assert.assertFalse(SYNTHETIC_ID_PATTERN.matcher("1234567890123").matches(), "Should reject 13 digits");
        Assert.assertFalse(SYNTHETIC_ID_PATTERN.matcher("12345678901A").matches(), "Should reject alphabetic character in ID");
    }

    // Scenario 45: Valid Date Format DD-MM-YYYY
    @Test(priority = 10, description = "Scenario 45: Valid Date Format DD-MM-YYYY with Gregorian validity")
    public void testValidDateFormat() {
        Assert.assertTrue(isValidGregorianDate("15-08-1995"));
        Assert.assertTrue(isValidGregorianDate("29-02-2024"), "2024 is a leap year, 29th Feb should be valid");
        Assert.assertTrue(isValidGregorianDate("31-12-2000"));
    }

    // Scenario 46: Invalid Date Format
    @Test(priority = 11, description = "Scenario 46: Invalid Date Format (wrong separators or invalid format)")
    public void testInvalidDateFormat() {
        Assert.assertFalse(isValidGregorianDate("15/08/1995"), "Should reject slash separators");
        Assert.assertFalse(isValidGregorianDate("1995-08-15"), "Should reject ISO format in DD-MM-YYYY parser");
        Assert.assertFalse(isValidGregorianDate("15-8-1995"), "Should reject single digit month");
    }

    // Scenario 47: Impossible Calendar Date
    @Test(priority = 12, description = "Scenario 47: Impossible Calendar Date (31st Feb, 32nd Jan, etc.)")
    public void testImpossibleCalendarDate() {
        Assert.assertFalse(isValidGregorianDate("31-02-2024"), "February never has 31 days");
        Assert.assertFalse(isValidGregorianDate("29-02-2023"), "2023 is not a leap year, 29th Feb is impossible");
        Assert.assertFalse(isValidGregorianDate("32-01-2024"), "January only has 31 days");
        Assert.assertFalse(isValidGregorianDate("15-13-2024"), "Month 13 is impossible");
    }
}

