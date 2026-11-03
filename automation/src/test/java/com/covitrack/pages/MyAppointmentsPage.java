package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class MyAppointmentsPage extends BasePage {

    private final By appointmentsTable = By.id("table-patient-appointments");
    private final By emptyState = By.id("empty-patient-appointments");

    public MyAppointmentsPage(WebDriver driver) {
        super(driver);
    }

    public boolean hasAppointments() {
        return isDisplayed(appointmentsTable);
    }

    public boolean isEmptyStateDisplayed() {
        return isDisplayed(emptyState);
    }

    public int getAppointmentRowCount() {
        if (!hasAppointments()) return 0;
        return driver.findElements(By.cssSelector("#table-patient-appointments tbody tr")).size();
    }

    public void cancelFirstAppointment() {
        By cancelBtn = By.cssSelector("button[id^='btn-cancel-appt-']");
        click(cancelBtn);
        // Accept browser confirm alert if displayed
        try {
            driver.switchTo().alert().accept();
        } catch (Exception ignored) {
        }
    }
}

