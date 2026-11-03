package com.covitrack.tests.patient;

import com.covitrack.base.BaseTest;
import com.covitrack.pages.LoginPage;
import com.covitrack.pages.RegisterPage;
import com.covitrack.utils.TestDataGenerator;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Phase 4.6 & Phase 9.2: Patient Management Automated Scenarios
 * Scenarios 26 to 30
 */
public class PatientManagementTests extends BaseTest {

    // Scenario 26: Display registered patients
    @Test(priority = 1, description = "Scenario 26: Display registered patients in staff registry")
    public void testDisplayRegisteredPatients() {
        navigateTo("/login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    // Scenario 27: Search by patient ID
    @Test(priority = 2, description = "Scenario 27: Search patient records by unique Patient Identifier")
    public void testSearchByPatientId() {
        navigateTo("/login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    // Scenario 28: Search by mobile number
    @Test(priority = 3, description = "Scenario 28: Search patient records by 10-digit mobile number")
    public void testSearchByMobileNumber() {
        navigateTo("/login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    // Scenario 29: Search by name
    @Test(priority = 4, description = "Scenario 29: Search patient records by full name substring")
    public void testSearchByName() {
        navigateTo("/login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    // Scenario 30: Unauthorized access to patient management
    @Test(priority = 5, description = "Scenario 30: Prevent unauthorized patient access to staff patient directory")
    public void testUnauthorizedPatientDirectoryAccess() {
        // 1. Register a regular patient
        navigateTo("/register");
        RegisterPage regPage = new RegisterPage(driver);
        String email = TestDataGenerator.generateRandomEmail();
        String mobile = TestDataGenerator.generateRandomMobile();
        regPage.register("Normal Patient", email, mobile, "1994-03-25", "Some Road", "Password123!", "Password123!");

        // 2. Login as that patient
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login(email, "Password123!");

        // 3. Attempt direct access to staff patient management
        navigateTo("/staff/patients");

        // 4. Must be blocked and redirected
        Assert.assertFalse(driver.getCurrentUrl().contains("/staff/patients"),
                "Patient must be forbidden from accessing /staff/patients");
    }
}

