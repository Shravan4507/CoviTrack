package com.covitrack.tests.demo;

import com.covitrack.base.BaseTest;
import com.covitrack.config.TestConfig;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.List;

/**
 * CoviTrack Live Interactive Demonstration Suite
 * Executes a full visible browser demonstration with deliberate human-paced delays
 * showcasing Patient Registration, Slot Booking, Staff Confirmation, and Diagnostic Reporting.
 * Uses strictly neutral, realistic synthetic testing data.
 */
public class LiveDemoTest extends BaseTest {

    private void humanDelay(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ignored) {
        }
    }

    private void setReactInputValue(WebElement inputElement, String value) {
        // Sets input value via native prototype setter and dispatches input & change events for React
        ((JavascriptExecutor) driver).executeScript(
                "var input = arguments[0];" +
                "var val = arguments[1];" +
                "var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') || " +
                "             Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');" +
                "if (setter && setter.set) { setter.set.call(input, val); } else { input.value = val; }" +
                "input.dispatchEvent(new Event('input', { bubbles: true }));" +
                "input.dispatchEvent(new Event('change', { bubbles: true }));",
                inputElement, value
        );
    }

    @Override
    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--remote-allow-origins=*");

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        wait = new WebDriverWait(driver, Duration.ofSeconds(TestConfig.EXPLICIT_WAIT_SECONDS));
    }

    @Test(description = "Complete Live End-to-End Workflow Demonstration with Visual Delays")
    public void testLiveDemoWorkflow() {
        System.out.println("===============================================================");
        System.out.println("  STARTING COVITRACK LIVE DEMONSTRATION WORKFLOW ");
        System.out.println("===============================================================");

        // STEP 1: Overview Landing Page
        System.out.println("[Demo Stage 1/8] Opening CoviTrack Public Portal...");
        navigateTo("/");
        humanDelay(2000);

        // STEP 2: Patient Registration with Deliberate Typing Pacing & Neutral Data
        System.out.println("[Demo Stage 2/8] Navigating to Patient Registration...");
        navigateTo("/register");
        humanDelay(1500);

        // Strictly neutral synthetic test credentials
        long timestamp = System.currentTimeMillis();
        String patientName = "Alex Taylor";
        String patientEmail = "alex.patient." + timestamp + "@covitrack.local";
        // Guaranteed strictly 10 numeric digits starting with 98
        long random8Digits = 10000000L + (long) (Math.random() * 89999999L);
        String patientMobile = "98" + random8Digits;
        String patientDob = "1995-05-20";
        String patientAddress = "742 Evergreen Terrace, Suite 100, West District";
        String patientPassword = "PatientPass123!";

        System.out.println("Filling Patient Information:");
        System.out.println(" - Name:    " + patientName);
        System.out.println(" - Email:   " + patientEmail);
        System.out.println(" - Mobile:  " + patientMobile + " (Strict 10 digits)");
        System.out.println(" - DOB:     " + patientDob);

        WebElement nameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("input-register-fullname")));
        nameInput.sendKeys(patientName);
        humanDelay(500);

        WebElement emailInput = driver.findElement(By.id("input-register-email"));
        emailInput.sendKeys(patientEmail);
        humanDelay(500);

        WebElement mobileInput = driver.findElement(By.id("input-register-mobile"));
        mobileInput.sendKeys(patientMobile);
        humanDelay(500);

        WebElement dobInput = driver.findElement(By.id("input-register-dob"));
        dobInput.sendKeys(patientDob);
        setReactInputValue(dobInput, patientDob);
        humanDelay(500);

        WebElement addrInput = driver.findElement(By.id("input-register-address"));
        addrInput.sendKeys(patientAddress);
        humanDelay(500);

        WebElement passInput = driver.findElement(By.id("input-register-password"));
        passInput.sendKeys(patientPassword);
        humanDelay(500);

        WebElement confirmPassInput = driver.findElement(By.id("input-register-confirm-password"));
        confirmPassInput.sendKeys(patientPassword);
        humanDelay(1000);

        System.out.println("Submitting Patient Registration form...");
        driver.findElement(By.id("btn-register-submit")).click();

        // Resilient check: wait for success card or capture error alert
        try {
            WebElement successCard = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("register-success-card")));
            Assert.assertTrue(successCard.isDisplayed(), "Registration success screen should be visible");
            String patientId = driver.findElement(By.id("display-patient-id")).getText();
            System.out.println("SUCCESS: Generated Unique Patient ID: " + patientId);
        } catch (Exception e) {
            // Check if page showed error alert
            List<WebElement> errorAlerts = driver.findElements(By.id("register-error-alert"));
            if (!errorAlerts.isEmpty()) {
                System.err.println("REGISTRATION FORM ERROR ALERT: " + errorAlerts.get(0).getText());
            }
            List<WebElement> fieldErrors = driver.findElements(By.className("form-error"));
            for (WebElement fe : fieldErrors) {
                if (fe.isDisplayed()) {
                    System.err.println(" - Field Error: " + fe.getText());
                }
            }
            throw e;
        }
        humanDelay(2000);

        // STEP 3: Patient Login
        System.out.println("[Demo Stage 3/8] Signing in with new Patient credentials...");
        navigateTo("/login");
        humanDelay(1200);

        WebElement loginEmailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("input-login-email")));
        loginEmailInput.sendKeys(patientEmail);
        humanDelay(500);

        driver.findElement(By.id("input-login-password")).sendKeys(patientPassword);
        humanDelay(800);

        driver.findElement(By.id("btn-login-submit")).click();

        wait.until(ExpectedConditions.urlContains("/patient/dashboard"));
        System.out.println("SUCCESS: Patient authenticated. Patient Dashboard active.");
        humanDelay(2000);

        // STEP 4: Capacity-Constrained Slot Booking
        System.out.println("[Demo Stage 4/8] Booking a COVID-19 Testing Slot...");
        navigateTo("/patient/book-appointment");
        humanDelay(1500);

        wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(By.id("form-book-appointment")),
                ExpectedConditions.visibilityOfElementLocated(By.id("empty-slots-state"))
        ));

        var slotRadios = driver.findElements(By.cssSelector("input[name='appointmentSlot']"));
        if (!slotRadios.isEmpty()) {
            slotRadios.get(0).click();
            humanDelay(1000);
            driver.findElement(By.id("btn-confirm-booking")).click();

            WebElement confirmCard = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("booking-confirmation-card")));
            Assert.assertTrue(confirmCard.isDisplayed());
            String bookingRef = driver.findElement(By.id("confirmation-booking-ref")).getText();
            System.out.println("SUCCESS: Testing Appointment Booked! Reference: " + bookingRef);
            humanDelay(2000);
        } else {
            System.out.println("Notice: No open slots currently in pool; proceeding with workflow.");
        }

        // STEP 5: View Patient Appointments
        System.out.println("[Demo Stage 5/8] Inspecting Patient Appointment Records...");
        navigateTo("/patient/appointments");
        humanDelay(2500);

        // STEP 6: Patient Logout
        System.out.println("[Demo Stage 6/8] Logging out Patient session...");
        WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-logout")));
        logoutBtn.click();
        humanDelay(1500);

        // STEP 7: Staff Login & Appointment Confirmation
        System.out.println("[Demo Stage 7/8] Logging in as Authorized Testing Center Staff...");
        navigateTo("/login");
        humanDelay(1000);

        WebElement staffEmail = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("input-login-email")));
        staffEmail.sendKeys("admin@covitrack.local");
        humanDelay(500);

        driver.findElement(By.id("input-login-password")).sendKeys("AdminPass123!");
        humanDelay(800);

        driver.findElement(By.id("btn-login-submit")).click();

        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/admin/dashboard"),
                ExpectedConditions.urlContains("/staff/dashboard")
        ));
        humanDelay(1500);

        // Navigate to Appointments Queue
        System.out.println("Accessing Staff Testing Appointments Queue...");
        navigateTo("/staff/appointments");
        humanDelay(2000);

        // Confirm appointment if pending
        var confirmBtns = driver.findElements(By.cssSelector("button[id^='btn-confirm-appt-']"));
        if (!confirmBtns.isEmpty()) {
            System.out.println("Confirming patient appointment as Staff...");
            confirmBtns.get(0).click();
            humanDelay(2000);
        }

        // STEP 8: Create Diagnostic Report
        System.out.println("[Demo Stage 8/8] Issuing Laboratory Diagnostic Report...");
        navigateTo("/staff/create-report");
        humanDelay(1500);

        var apptSelectEl = driver.findElements(By.id("select-appointment-id"));
        if (!apptSelectEl.isEmpty() && apptSelectEl.get(0).isDisplayed()) {
            Select apptSelect = new Select(apptSelectEl.get(0));
            if (apptSelect.getOptions().size() > 1) {
                apptSelect.selectByIndex(1);
                humanDelay(800);

                Select resultSelect = new Select(driver.findElement(By.id("select-test-result")));
                resultSelect.selectByValue("negative");
                humanDelay(800);

                WebElement notesInput = driver.findElement(By.id("input-report-notes"));
                notesInput.sendKeys(
                        "Clinical Real-Time RT-PCR Assay: Specimen verified. Target SARS-CoV-2 RNA not detected. Test Result Negative."
                );
                humanDelay(1200);

                driver.findElement(By.id("btn-submit-report")).click();

                WebElement reportSuccess = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("report-success-card")));
                Assert.assertTrue(reportSuccess.isDisplayed());
                String reportRef = driver.findElement(By.id("created-report-reference")).getText();
                System.out.println("SUCCESS: Diagnostic Report Signed and Generated: " + reportRef);
                humanDelay(3000);
            } else {
                System.out.println("No eligible appointments awaiting report generation; workflow verified.");
            }
        }

        System.out.println("===============================================================");
        System.out.println("  COVITRACK LIVE DEMONSTRATION WORKFLOW COMPLETED SUCCESSFULLY ");
        System.out.println("===============================================================");
    }
}
