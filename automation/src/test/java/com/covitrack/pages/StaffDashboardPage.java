package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class StaffDashboardPage extends BasePage {

    private final By statBooked = By.id("stat-staff-booked");
    private final By statConfirmed = By.id("stat-staff-confirmed");
    private final By statCompleted = By.id("stat-staff-completed");
    private final By quickSlotsBtn = By.id("btn-quick-slots");
    private final By quickReportBtn = By.id("btn-quick-report");

    public StaffDashboardPage(WebDriver driver) {
        super(driver);
    }

    public boolean isDashboardLoaded() {
        return isDisplayed(By.id("staff-metrics-grid"));
    }

    public void navigateToManageSlots() {
        click(quickSlotsBtn);
    }

    public void navigateToCreateReport() {
        click(quickReportBtn);
    }
}

