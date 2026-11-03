package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class RegisterPage extends BasePage {

    private final By fullNameInput = By.id("input-register-fullname");
    private final By emailInput = By.id("input-register-email");
    private final By mobileInput = By.id("input-register-mobile");
    private final By dobInput = By.id("input-register-dob");
    private final By addressInput = By.id("input-register-address");
    private final By passwordInput = By.id("input-register-password");
    private final By confirmPasswordInput = By.id("input-register-confirm-password");
    private final By submitButton = By.id("btn-register-submit");

    private final By errorAlert = By.id("register-error-alert");
    private final By successCard = By.id("register-success-card");
    private final By patientIdDisplay = By.id("display-patient-id");
    private final By gotoLoginBtn = By.id("btn-goto-login");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void enterFullName(String name) {
        type(fullNameInput, name);
    }

    public void enterEmail(String email) {
        type(emailInput, email);
    }

    public void enterMobile(String mobile) {
        type(mobileInput, mobile);
    }

    public void enterDob(String dob) {
        type(dobInput, dob);
    }

    public void enterAddress(String address) {
        type(addressInput, address);
    }

    public void enterPassword(String password) {
        type(passwordInput, password);
    }

    public void enterConfirmPassword(String confirmPassword) {
        type(confirmPasswordInput, confirmPassword);
    }

    public void clickSubmit() {
        click(submitButton);
    }

    public void register(String fullName, String email, String mobile, String dob, String address, String password, String confirmPassword) {
        enterFullName(fullName);
        enterEmail(email);
        enterMobile(mobile);
        enterDob(dob);
        enterAddress(address);
        enterPassword(password);
        enterConfirmPassword(confirmPassword);
        clickSubmit();
    }

    public boolean isErrorAlertDisplayed() {
        return isDisplayed(errorAlert);
    }

    public String getErrorMessage() {
        return isDisplayed(errorAlert) ? getText(errorAlert) : "";
    }

    public boolean isRegistrationSuccessful() {
        return isDisplayed(successCard);
    }

    public String getGeneratedPatientId() {
        return isDisplayed(patientIdDisplay) ? getText(patientIdDisplay) : "";
    }

    public void clickProceedToLogin() {
        click(gotoLoginBtn);
    }
}

