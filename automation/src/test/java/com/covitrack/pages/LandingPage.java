package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LandingPage extends BasePage {

    private final By brandLogo = By.id("header-brand-logo");
    private final By heroRegisterBtn = By.id("hero-btn-register");
    private final By heroLoginBtn = By.id("hero-btn-login");
    private final By navLoginLink = By.id("nav-login");
    private final By navRegisterLink = By.id("nav-register");

    public LandingPage(WebDriver driver) {
        super(driver);
    }

    public boolean isBrandLogoDisplayed() {
        return isDisplayed(brandLogo);
    }

    public void clickRegister() {
        click(heroRegisterBtn);
    }

    public void clickLogin() {
        click(heroLoginBtn);
    }
}

