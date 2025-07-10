import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';

interface BookingDetails {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
}

export class ReservationPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Form Input Locators - Using role-based selectors from codegen
    get firstnameInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Firstname' });
    }

    get lastnameInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Lastname' });
    }

    get emailInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Email' });
    }

    get phoneInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Phone' });
    }

    // Button Locators
    get reserveNowButton(): Locator {
        return this.page.getByRole('button', { name: 'Reserve Now' });
    }

    get bookNowButton(): Locator {
        return this.page.getByRole('button', { name: 'Book Now' });
    }

    // Confirmation Elements
    get bookingConfirmation(): Locator {
        return this.page.getByText('Booking Confirmed');
    }

    get bookingConfirmationMessage(): Locator {
        return this.page.getByText('Booking ConfirmedYour booking');
    }

    get returnHomeLink(): Locator {
        return this.page.getByRole('link', { name: 'Return home' });
    }

    // Calendar Locators - Based on codegen
    get calendar(): Locator {
        return this.page.locator('.rbc-calendar');
    }

    get calendarCells(): Locator {
        return this.page.locator('.rbc-row-bg > div');
    }

    get specificCalendarCell(): Locator {
        return this.page.locator('.rbc-row-bg > div:nth-child(3)').first();
    }

    get nextMonthButton(): Locator {
        return this.page.locator('button[aria-label="Next"]');
    }

    get prevMonthButton(): Locator {
        return this.page.locator('button[aria-label="Previous"]');
    }

    // Additional elements for validation tests
    get roomTitle(): Locator {
        return this.page.locator('h1, h2, h3').filter({ hasText: /room|suite/i }).first();
    }

    get roomPrice(): Locator {
        return this.page.locator('text=/£\\d+/').first();
    }

    get cleaningFee(): Locator {
        return this.page.locator('text=/cleaning.*£\\d+/i').first();
    }

    get serviceFee(): Locator {
        return this.page.locator('text=/service.*£\\d+/i').first();
    }

    get totalPriceElement(): Locator {
        return this.page.locator('.total-price, text=/total.*£\\d+/i').first();
    }

    // Modal/Dialog Elements
    get bookingModal(): Locator {
        return this.page.locator('.ReactModal__Content, .modal-content');
    }

    get closeModalButton(): Locator {
        return this.page.locator('button.close, button:has-text("Close"), .modal-close');
    }

    // Methods
    async fillBookingForm(bookingDetails: BookingDetails): Promise<void> {
        // Click and fill firstname
        await this.firstnameInput.click();
        await this.firstnameInput.fill(bookingDetails.firstname);
        
        // Click and fill lastname
        await this.lastnameInput.click();
        await this.lastnameInput.fill(bookingDetails.lastname);
        
        // Click and fill email
        await this.emailInput.click();
        await this.emailInput.fill(bookingDetails.email);
        
        // Click and fill phone
        await this.phoneInput.click();
        await this.phoneInput.fill(bookingDetails.phone);
    }

    async selectDates(checkIn?: string, checkOut?: string): Promise<void> {
        // Based on codegen pattern - clicking the same cell twice
        try {
            // Use the specific calendar cell pattern from codegen
            await this.specificCalendarCell.click();
            await this.page.waitForTimeout(500);
            await this.specificCalendarCell.click();
        } catch {
            // Fallback: click any two available dates
            const availableCells = await this.calendarCells.all();
            if (availableCells.length >= 2) {
                await availableCells[2].click(); // Start from 3rd cell (index 2)
                await this.page.waitForTimeout(500);
                await availableCells[3].click(); // Click 4th cell (index 3)
            }
        }
    }

    async clickReserveNow(): Promise<void> {
        // Based on codegen - sometimes needs multiple clicks
        await this.reserveNowButton.click();
        
        // Check if button is still visible and click again if needed
        if (await this.reserveNowButton.isVisible({ timeout: 1000 })) {
            await this.reserveNowButton.click();
        }
    }

    async submitBooking(): Promise<void> {
        // Use Reserve Now button for submission
        await this.clickReserveNow();
        await this.waitForLoadState();
    }

    async isBookingSuccessful(): Promise<boolean> {
        try {
            // Wait for booking confirmation text
            await this.bookingConfirmation.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            // Also check for confirmation message
            try {
                await this.bookingConfirmationMessage.waitFor({ state: 'visible', timeout: 1000 });
                return true;
            } catch {
                return false;
            }
        }
    }

    async returnHome(): Promise<void> {
        await this.returnHomeLink.click();
        await this.waitForLoadState();
    }

    // Additional methods for compatibility
    async waitForBookingForm(): Promise<void> {
        await this.firstnameInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async waitForConfirmation(): Promise<void> {
        await this.bookingConfirmation.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getConfirmationText(): Promise<string> {
        try {
            return await this.bookingConfirmationMessage.textContent() || '';
        } catch {
            return await this.bookingConfirmation.textContent() || '';
        }
    }

    async selectDateRange(startDay: string, endDay: string): Promise<void> {
        // For compatibility with validation tests
        await this.selectDates(startDay, endDay);
    }

    async getTotalPrice(): Promise<string> {
        try {
            return await this.totalPriceElement.textContent() || '';
        } catch {
            return '';
        }
    }

    async closeBookingModal(): Promise<void> {
        if (await this.closeModalButton.isVisible()) {
            await this.closeModalButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    // Calendar navigation methods
    async navigateToNextMonth(): Promise<void> {
        if (await this.nextMonthButton.isVisible()) {
            await this.nextMonthButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    async navigateToPreviousMonth(): Promise<void> {
        if (await this.prevMonthButton.isVisible()) {
            await this.prevMonthButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    // Verify form is filled correctly
    async verifyFormData(bookingDetails: BookingDetails): Promise<boolean> {
        const firstname = await this.firstnameInput.inputValue();
        const lastname = await this.lastnameInput.inputValue();
        const email = await this.emailInput.inputValue();
        const phone = await this.phoneInput.inputValue();
        
        return firstname === bookingDetails.firstname &&
               lastname === bookingDetails.lastname &&
               email === bookingDetails.email &&
               phone === bookingDetails.phone;
    }

    // Get confirmation details
    async getBookingConfirmationDetails(): Promise<{message: string, hasReturnLink: boolean}> {
        const message = await this.getConfirmationText();
        const hasReturnLink = await this.returnHomeLink.isVisible();
        
        return {
            message,
            hasReturnLink
        };
    }
}