package com.covitrack.tests.authentication;

import com.covitrack.base.BaseTest;
import com.covitrack.pages.LoginPage;
import com.covitrack.pages.PatientDashboardPage;
import com.covitrack.pages.RegisterPage;
import com.covitrack.utils.TestDataGenerator;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Phase 4.3 & Phase 9.2: Authentication & Access Control Automated Scenarios
 * Scenarios 11 to 17
 */
public class AuthenticationTests extends BaseTest {

    private LoginPage loginPage;

    @BeforeMethod
    public void setupLoginPage() {
        navigateTo("/login");
        loginPage = new LoginPage(driver);
    }

    private String[] createRegisteredPatient() {
        navigateTo("/register");
        RegisterPage regPage = new RegisterPage(driver);
        String name = TestDataGenerator.generateRandomName();
        String email = TestDataGenerator.generateRandomEmail();
        String mobile = TestDataGenerator.generateRandomMobile();
        String password = "AuthPass123!";

        regPage.register(name, email, mobile, "1990-01-01", "Testing Road 123", password, password);
        Assert.assertTrue(regPage.isRegistrationSuccessful());
        return new String[]{email, password};
    }

    // Scenario 11: Login using valid credentials
    @Test(priority = 1, description = "Scenario 11: Login using valid credentials")
    public void testValidLogin() {
        String[] creds = createRegisteredPatient();
        navigateTo("/login");
        loginPage = new LoginPage(driver);
        loginPage.login(creds[0], creds[1]);

        PatientDashboardPage dashboard = new PatientDashboardPage(driver);
        Assert.assertTrue(dashboard.isDashboardLoaded(), "Dashboard should load after valid patient login");
    }

    // Scenario 12: Login using an incorrect password
    @Test(priority = 2, description = "Scenario 12: Login using an incorrect password")
    public void testIncorrectPasswordLogin() {
        String[] creds = createRegisteredPatient();
        navigateTo("/login");
        loginPage = new LoginPage(driver);
        loginPage.login(creds[0], "CompletelyWrongPassword999!");

        Assert.assertTrue(loginPage.isErrorAlertDisplayed(), "Expected invalid credential error alert");
    }

    // Scenario 13: Login using an unregistered email
    @Test(priority = 3, description = "Scenario 13: Login using an unregistered email")
    public void testUnregisteredEmailLogin() {
        loginPage.login("nonexistent." + System.currentTimeMillis() + "@covitrack.local", "AnyPassword123!");
        Assert.assertTrue(loginPage.isErrorAlertDisplayed(), "Expected invalid email/password error alert for unregistered email");
    }

    // Scenario 14: Empty login submission
    @Test(priority = 4, description = "Scenario 14: Empty login submission")
    public void testEmptyLoginSubmission() {
        loginPage.clickSubmit();
        Assert.assertTrue(loginPage.isErrorAlertDisplayed(), "Expected error message when submitting empty login form");
    }

    // Scenario 15: Logout
    @Test(priority = 5, description = "Scenario 15: Successful logout clears session")
    public void testLogout() {
        String[] creds = createRegisteredPatient();
        navigateTo("/login");
        loginPage = new LoginPage(driver);
        loginPage.login(creds[0], creds[1]);

        PatientDashboardPage dashboard = new PatientDashboardPage(driver);
        Assert.assertTrue(dashboard.isDashboardLoaded());

        dashboard.clickLogout();
        // After logout, user should be redirected to login page
        loginPage = new LoginPage(driver);
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "User should be redirected to login upon logout");
    }

    // Scenario 16: Accessing protected pages after logout
    @Test(priority = 6, description = "Scenario 16: Accessing protected pages after logout")
    public void testAccessProtectedPageAfterLogout() {
        String[] creds = createRegisteredPatient();
        navigateTo("/login");
        loginPage = new LoginPage(driver);
        loginPage.login(creds[0], creds[1]);

        PatientDashboardPage dashboard = new PatientDashboardPage(driver);
        dashboard.clickLogout();

        // Attempt to navigate directly to protected patient dashboard
        navigateTo("/patient/dashboard");
        // Should be intercepted and redirected to /login
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "Unauthenticated user should be redirected to /login");
    }

    // Scenario 17: Attempting unauthorized role access
    @Test(priority = 7, description = "Scenario 17: Attempting unauthorized role access (Patient accessing Admin endpoint)")
    public void testUnauthorizedRoleAccess() {
        String[] creds = createRegisteredPatient();
        navigateTo("/login");
        loginPage = new LoginPage(driver);
        loginPage.login(creds[0], creds[1]);

        // Attempt direct access to admin dashboard
        navigateTo("/admin/dashboard");

        // Should be prevented from staying on admin dashboard and redirected back to patient dashboard
        Assert.assertFalse(driver.getCurrentUrl().contains("/admin/dashboard"),
                "Patient must not be allowed to access admin dashboard. Current URL: " + driver.getCurrentUrl());
    }
}

