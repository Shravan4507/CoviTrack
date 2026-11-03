package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class PatientDashboardPage extends BasePage {

    private final By patientIdBadge = By.id("patient-id-badge");
    private final By patientDisplayName = By.id("patient-display-name");
    private final By bookNewTestBtn = By.id("btn-book-new-test");
    private final By statUpcoming = By.id("stat-upcoming-tests");
    private final By statCompleted = By.id("stat-completed-tests");
    private final By statReports = By.id("stat-total-reports");
    private final By navLogout = By.id("btn-logout");

    public PatientDashboardPage(WebDriver driver) {
        super(driver);
    }

    public boolean isDashboardLoaded() {
        return isDisplayed(patientDisplayName);
    }

    public String getPatientId() {
        return isDisplayed(patientIdBadge) ? getText(patientIdBadge) : "";
    }

    public void clickBookNewTest() {
        click(bookNewTestBtn);
    }

    public void clickLogout() {
        click(navLogout);
    }
}

