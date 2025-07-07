import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';

export class ReservationPage extends BasePage {
  // Room details
  readonly roomTitle: Locator;
  readonly roomDescription: Locator;
  readonly roomFeatures: Locator;
  readonly roomPrice: Locator;
  
  // Calendar
  readonly calendar: Locator;
  readonly calendarDates: Locator;
  readonly selectedDates: Locator;
  readonly monthLabel: Locator;
  readonly nextMonthButton: Locator;
  readonly prevMonthButton: Locator;
  readonly todayButton: Locator;
  
  // Price summary
  readonly priceSummary: Locator;
  readonly totalPrice: Locator;
  readonly nightsPrice: Locator;
  readonly cleaningFee: Locator;
  readonly serviceFee: Locator;
  
  // Booking button
  readonly reserveNowButton: Locator;
  
  // Booking form (appears after clicking Reserve Now)
  readonly bookingModal: Locator;
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly bookButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmationModal: Locator;
  readonly confirmationMessage: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    
    // Room details
    this.roomTitle = page.locator('h1.fw-bold');
    this.roomDescription = page.locator('h2:has-text("Room Description") + p');
    this.roomFeatures = page.locator('.amenity-icon').locator('..');
    this.roomPrice = page.locator('.fs-2.fw-bold.text-primary');
    
    // Calendar
    this.calendar = page.locator('.rbc-calendar');
    this.calendarDates = page.locator('.rbc-date-cell button');
    this.selectedDates = page.locator('.rbc-event:has-text("Selected")');
    this.monthLabel = page.locator('.rbc-toolbar-label');
    this.nextMonthButton = page.locator('.rbc-btn-group button:has-text("Next")');
    this.prevMonthButton = page.locator('.rbc-btn-group button:has-text("Back")');
    this.todayButton = page.locator('.rbc-btn-group button:has-text("Today")');
    
    // Price summary
    this.priceSummary = page.locator('.card.bg-light:has(h3:has-text("Price Summary"))');
    this.totalPrice = page.locator('.fw-bold:has-text("Total")').locator('..').locator('span').last();
    this.nightsPrice = page.locator('span:has-text("nights")').locator('..').locator('span').last();
    this.cleaningFee = page.locator('span:has-text("Cleaning fee")').locator('..').locator('span').last();
    this.serviceFee = page.locator('span:has-text("Service fee")').locator('..').locator('span').last();
    
    // Main booking button
    this.reserveNowButton = page.locator('#doReservation, button:has-text("Reserve Now")').first();
    
    // Booking form elements (already on the page, not in modal)
    this.bookingModal = page.locator('.modal.show, [role="dialog"]');
    this.firstnameInput = page.locator('input[name="firstname"], input.room-firstname');
    this.lastnameInput = page.locator('input[name="lastname"], input.room-lastname');
    this.emailInput = page.locator('input[name="email"], input.room-email');
    this.phoneInput = page.locator('input[name="phone"], input.room-phone');
    this.bookButton = page.locator('button:has-text("Reserve Now")').first(); // Same as reserveNowButton
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.confirmationModal = page.locator('.modal.show, [role="dialog"]');
    this.confirmationMessage = page.locator('.modal-body p:has-text("successfully"), .alert-success');
    this.errorAlert = page.locator('.alert-danger');
  }

  async selectDate(day: string) {
    await this.calendarDates.filter({ hasText: day }).click();
  }

  async selectDateRange(startDay: string, endDay: string) {
    await this.selectDate(startDay);
    await this.selectDate(endDay);
  }

  async clickReserveNow() {
    await this.reserveNowButton.click();
  }

  async getRoomPrice(): Promise<string> {
    return await this.roomPrice.textContent() || '';
  }

  async getTotalPrice(): Promise<string> {
    return await this.totalPrice.textContent() || '';
  }

  async waitForBookingForm() {
    // Wait for either modal or form to appear
    try {
      // First check if a modal appears
      await this.page.waitForSelector('.modal.show', { timeout: 5000 });
      console.log('Booking form appeared in modal');
    } catch {
      // If no modal, check if we navigated to a new page with form
      try {
        await this.page.waitForSelector('input[name="firstname"]', { timeout: 5000 });
        console.log('Booking form appeared on page');
      } catch {
        // Log current URL and page content for debugging
        console.log('Current URL:', this.page.url());
        console.log('Page title:', await this.page.title());
        
        // Take a screenshot for debugging
        await this.page.screenshot({ path: 'booking-form-debug.png' });
        
        throw new Error('Booking form not found after clicking Reserve Now');
      }
    }
  }

  async fillBookingForm(data: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  }) {
    // Wait a bit for form to be ready
    await this.page.waitForTimeout(1000);
    
    // Try to fill the form fields
    await this.firstnameInput.fill(data.firstname);
    await this.lastnameInput.fill(data.lastname);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
  }

  async submitBooking() {
    // The Reserve Now button is the submit button for the booking form
    await this.reserveNowButton.click();
  }

  async waitForConfirmation() {
    await this.confirmationModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getConfirmationText(): Promise<string> {
    return await this.confirmationMessage.textContent() || '';
  }

  async getErrorText(): Promise<string> {
    return await this.errorAlert.textContent() || '';
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }
}
