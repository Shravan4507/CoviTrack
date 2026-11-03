package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ManageAppointmentsPage extends BasePage {

    private final By searchInput = By.id("input-search-appointments");
    private final By searchBtn = By.id("btn-search-appointments");
    private final By statusFilter = By.id("select-status-filter");
    private final By appointmentsTable = By.id("table-staff-appointments");

    public ManageAppointmentsPage(WebDriver driver) {
        super(driver);
    }

    public void search(String query) {
        type(searchInput, query);
        click(searchBtn);
    }

    public boolean isTableDisplayed() {
        return isDisplayed(appointmentsTable);
    }

    public void confirmFirstBookedAppointment() {
        By confirmBtn = By.cssSelector("button[id^='btn-confirm-appt-']");
        click(confirmBtn);
    }
}

