package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class CreateReportPage extends BasePage {

    private final By appointmentSelect = By.id("select-appointment-id");
    private final By testResultSelect = By.id("select-test-result");
    private final By testingDateInput = By.id("input-testing-date");
    private final By notesInput = By.id("input-report-notes");
    private final By submitBtn = By.id("btn-submit-report");
    private final By successCard = By.id("report-success-card");
    private final By reportRefDisplay = By.id("created-report-reference");

    public CreateReportPage(WebDriver driver) {
        super(driver);
    }

    public void selectResult(String result) {
        Select select = new Select(waitForVisible(testResultSelect));
        select.selectByValue(result.toLowerCase());
    }

    public void enterNotes(String notes) {
        type(notesInput, notes);
    }

    public void clickSubmit() {
        click(submitBtn);
    }

    public boolean isReportCreated() {
        return isDisplayed(successCard);
    }

    public String getCreatedReportReference() {
        return isDisplayed(reportRefDisplay) ? getText(reportRefDisplay) : "";
    }
}

