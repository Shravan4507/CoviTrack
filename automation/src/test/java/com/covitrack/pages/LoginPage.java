package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    private final By emailInput = By.id("input-login-email");
    private final By passwordInput = By.id("input-login-password");
    private final By submitButton = By.id("btn-login-submit");
    private final By errorAlert = By.id("login-error-alert");
    private final By registerLink = By.id("link-goto-register");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void enterEmail(String email) {
        type(emailInput, email);
    }

    public void enterPassword(String password) {
        type(passwordInput, password);
    }

    public void clickSubmit() {
        click(submitButton);
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickSubmit();
    }

    public boolean isErrorAlertDisplayed() {
        return isDisplayed(errorAlert);
    }

    public String getErrorMessage() {
        return isDisplayed(errorAlert) ? getText(errorAlert) : "";
    }

    public void clickRegisterLink() {
        click(registerLink);
    }
}

