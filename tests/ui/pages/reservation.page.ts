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
    this.reserveNowButton = page.locator('#doReservation');
    
    // Booking form elements (in modal/next step)
    this.bookingModal = page.locator('.modal.show, [role="dialog"]');
    this.firstnameInput = page.locator('input[name="firstname"], input#firstname');
    this.lastnameInput = page.locator('input[name="lastname"], input#lastname');
    this.emailInput = page.locator('input[name="email"], input#email');
    this.phoneInput = page.locator('input[name="phone"], input#phone');
    this.bookButton = page.locator('button.btn-outline-primary:has-text("Book")');
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
    await this.page.waitForSelector('input[name="firstname"], .modal.show', { timeout: 10000 });
  }

  async fillBookingForm(data: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  }) {
    await this.firstnameInput.fill(data.firstname);
    await this.lastnameInput.fill(data.lastname);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
  }

  async submitBooking() {
    await this.bookButton.click();
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