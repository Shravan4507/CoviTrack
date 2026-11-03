package com.covitrack.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class BookAppointmentPage extends BasePage {

    private final By testTypeSelect = By.id("select-test-type");
    private final By confirmBookingBtn = By.id("btn-confirm-booking");
    private final By bookingErrorAlert = By.id("booking-error-alert");
    private final By confirmationCard = By.id("booking-confirmation-card");
    private final By confirmationBookingRef = By.id("confirmation-booking-ref");
    private final By emptySlotsState = By.id("empty-slots-state");

    public BookAppointmentPage(WebDriver driver) {
        super(driver);
    }

    public boolean isPageLoaded() {
        return isDisplayed(By.id("book-appointment-card"));
    }

    public boolean hasAvailableSlots() {
        return !isDisplayed(emptySlotsState);
    }

    public void selectSlotByIndex(int index) {
        By slotRadio = By.cssSelector("input[name='appointmentSlot']");
        var elements = driver.findElements(slotRadio);
        if (index < elements.size()) {
            elements.get(index).click();
        }
    }

    public void clickConfirmBooking() {
        click(confirmBookingBtn);
    }

    public boolean isBookingSuccessful() {
        return isDisplayed(confirmationCard);
    }

    public String getBookingReference() {
        return isDisplayed(confirmationBookingRef) ? getText(confirmationBookingRef) : "";
    }

    public String getErrorMessage() {
        return isDisplayed(bookingErrorAlert) ? getText(bookingErrorAlert) : "";
    }
}

