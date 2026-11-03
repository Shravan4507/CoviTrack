package com.covitrack.tests.registration;

import com.covitrack.base.BaseTest;
import com.covitrack.pages.RegisterPage;
import com.covitrack.utils.TestDataGenerator;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Phase 4.2 & Phase 9.2: Patient Registration Automated Scenarios
 * Scenarios 1 to 10
 */
public class RegistrationTests extends BaseTest {

    private RegisterPage registerPage;

    @BeforeMethod
    public void navigateToRegister() {
        navigateTo("/register");
        registerPage = new RegisterPage(driver);
    }

    // Scenario 1: Successful registration with valid information
    @Test(priority = 1, description = "Scenario 1: Successful registration with valid information")
    public void testSuccessfulRegistration() {
        String name = TestDataGenerator.generateRandomName();
        String email = TestDataGenerator.generateRandomEmail();
        String mobile = TestDataGenerator.generateRandomMobile();

        registerPage.register(
                name,
                email,
                mobile,
                "1995-05-15",
                "Flat 402, Green Avenue, Medical District",
                "PatientPass123!",
                "PatientPass123!"
        );

        Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Expected success confirmation card after valid registration");
        String patientId = registerPage.getGeneratedPatientId();
        Assert.assertTrue(patientId.startsWith("PT-"), "Generated Patient ID should match format PT-YYYY-XXXXX, got: " + patientId);
    }

    // Scenario 2: Registration with all mandatory fields empty
    @Test(priority = 2, description = "Scenario 2: Registration with all mandatory fields empty")
    public void testEmptyFieldsRegistration() {
        registerPage.clickSubmit();
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected validation error alert when submitting empty fields");
        Assert.assertFalse(registerPage.isRegistrationSuccessful(), "Registration should not succeed with empty inputs");
    }

    // Scenario 3: Invalid email format
    @Test(priority = 3, description = "Scenario 3: Invalid email format")
    public void testInvalidEmailRegistration() {
        registerPage.register(
                "John Doe",
                "invalid-email-format",
                TestDataGenerator.generateRandomMobile(),
                "1990-01-01",
                "Valid Residential Address Line",
                "ValidPass123!",
                "ValidPass123!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert for invalid email format");
    }

    // Scenario 4: Invalid mobile number
    @Test(priority = 4, description = "Scenario 4: Invalid mobile number (less than 10 digits or non-numeric)")
    public void testInvalidMobileRegistration() {
        registerPage.register(
                "John Doe",
                TestDataGenerator.generateRandomEmail(),
                "12345", // Only 5 digits
                "1990-01-01",
                "Valid Residential Address Line",
                "ValidPass123!",
                "ValidPass123!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert for mobile number < 10 digits");
    }

    // Scenario 5: Invalid full name
    @Test(priority = 5, description = "Scenario 5: Invalid full name (contains digits or symbols)")
    public void testInvalidFullNameRegistration() {
        registerPage.register(
                "John Doe 123!",
                TestDataGenerator.generateRandomEmail(),
                TestDataGenerator.generateRandomMobile(),
                "1990-01-01",
                "Valid Residential Address Line",
                "ValidPass123!",
                "ValidPass123!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert for invalid full name with digits/symbols");
    }

    // Scenario 6: Incorrect date format
    @Test(priority = 6, description = "Scenario 6: Incorrect date format")
    public void testIncorrectDateFormatRegistration() {
        registerPage.register(
                "John Doe",
                TestDataGenerator.generateRandomEmail(),
                TestDataGenerator.generateRandomMobile(),
                "", // empty or invalid format
                "Valid Residential Address Line",
                "ValidPass123!",
                "ValidPass123!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert for invalid date of birth");
    }

    // Scenario 7: Invalid calendar date
    @Test(priority = 7, description = "Scenario 7: Invalid calendar date (future birth date)")
    public void testFutureCalendarDateRegistration() {
        registerPage.register(
                "John Doe",
                TestDataGenerator.generateRandomEmail(),
                TestDataGenerator.generateRandomMobile(),
                "2099-12-31", // Date in the future
                "Valid Residential Address Line",
                "ValidPass123!",
                "ValidPass123!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert for future date of birth");
    }

    // Scenario 8: Password and confirmation mismatch
    @Test(priority = 8, description = "Scenario 8: Password and confirmation mismatch")
    public void testPasswordMismatchRegistration() {
        registerPage.register(
                "John Doe",
                TestDataGenerator.generateRandomEmail(),
                TestDataGenerator.generateRandomMobile(),
                "1992-06-20",
                "Valid Residential Address Line",
                "Password123!",
                "DifferentPassword456!"
        );
        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected error alert when password confirmation does not match");
    }

    // Scenario 9: Duplicate email registration
    @Test(priority = 9, description = "Scenario 9: Duplicate email registration rejection")
    public void testDuplicateEmailRegistration() {
        String name = TestDataGenerator.generateRandomName();
        String duplicateEmail = TestDataGenerator.generateRandomEmail();
        String mobile1 = TestDataGenerator.generateRandomMobile();
        String mobile2 = TestDataGenerator.generateRandomMobile();

        // Register initial user
        registerPage.register(
                name,
                duplicateEmail,
                mobile1,
                "1993-04-12",
                "Address Line 1",
                "Password123!",
                "Password123!"
        );
        Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Initial registration should succeed");

        // Attempt duplicate registration with the exact same email
        navigateTo("/register");
        registerPage = new RegisterPage(driver);
        registerPage.register(
                "Another User",
                duplicateEmail,
                mobile2,
                "1994-08-15",
                "Address Line 2",
                "Password123!",
                "Password123!"
        );

        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected rejection for duplicate email registration");
    }

    // Scenario 10: Duplicate mobile registration
    @Test(priority = 10, description = "Scenario 10: Duplicate mobile registration rejection")
    public void testDuplicateMobileRegistration() {
        String duplicateMobile = TestDataGenerator.generateRandomMobile();
        String email1 = TestDataGenerator.generateRandomEmail();
        String email2 = TestDataGenerator.generateRandomEmail();

        // Register initial user
        registerPage.register(
                "Patient One",
                email1,
                duplicateMobile,
                "1990-10-10",
                "Address Line 1",
                "Password123!",
                "Password123!"
        );
        Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Initial registration should succeed");

        // Attempt duplicate registration with the same mobile
        navigateTo("/register");
        registerPage = new RegisterPage(driver);
        registerPage.register(
                "Patient Two",
                email2,
                duplicateMobile,
                "1991-11-11",
                "Address Line 2",
                "Password123!",
                "Password123!"
        );

        Assert.assertTrue(registerPage.isErrorAlertDisplayed(), "Expected rejection for duplicate mobile registration");
    }
}

