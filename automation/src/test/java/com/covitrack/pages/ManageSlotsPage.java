package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ManageSlotsPage extends BasePage {

    private final By startTimeInput = By.id("input-slot-start");
    private final By endTimeInput = By.id("input-slot-end");
    private final By capacityInput = By.id("input-slot-capacity");
    private final By createSlotBtn = By.id("btn-create-slot");
    private final By successAlert = By.id("slots-success-alert");
    private final By errorAlert = By.id("slots-error-alert");

    public ManageSlotsPage(WebDriver driver) {
        super(driver);
    }

    public void createSlot(String startIso, String endIso, int capacity) {
        type(startTimeInput, startIso);
        type(endTimeInput, endIso);
        type(capacityInput, String.valueOf(capacity));
        click(createSlotBtn);
    }

    public boolean isSuccessAlertDisplayed() {
        return isDisplayed(successAlert);
    }

    public boolean isErrorAlertDisplayed() {
        return isDisplayed(errorAlert);
    }
}

