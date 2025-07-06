import { Page, Locator } from '@playwright/test';
import { BasePage } from '././basepage';

export class BookingPage extends BasePage {
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly bookButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;
  readonly successMessage: Locator;
  readonly datePickerCheckin: Locator;
  readonly datePickerCheckout: Locator;
  readonly reserveNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstnameInput = page.locator('input[name="firstname"]');
    this.lastnameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.reserveNowButton = page.locator('button.btn-primary:has-text("Reserve Now")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.errorMessages = page.locator('.alert-danger');
    this.successMessage = page.locator('.alert-success, .confirmation');
    this.datePickerCheckin = page.locator('[placeholder*="Check-in"]');
    this.datePickerCheckout = page.locator('[placeholder*="Check-out"]');
    this.reserveNowButton = page.locator('#doReservation'); // ← new addition
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

  async selectDates(checkinDays: number, nights: number) {
    const today = new Date();
    const checkin = new Date(today);
    checkin.setDate(today.getDate() + checkinDays);
    const checkout = new Date(checkin);
    checkout.setDate(checkin.getDate() + nights);

    const checkinDay = checkin.getDate().toString().padStart(2, '0');
    const checkoutDay = checkout.getDate().toString().padStart(2, '0');

    await this.page.waitForSelector('.rbc-calendar');
    await this.page.locator(`.rbc-button-link:text-is("${checkinDay}")`).first().click();
    await this.page.locator(`.rbc-button-link:text-is("${checkoutDay}")`).last().click();
  }

  async submitBooking() {
    await this.bookButton.click();
  }

  async confirmReservation() {
    await this.reserveNowButton.click();
  }
}
