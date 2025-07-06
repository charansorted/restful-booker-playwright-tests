import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { BookingPage } from '../pages/booking.page';

test.describe('Booking Flow @critical', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('Complete booking successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    const bookingPage = new BookingPage(page);
    
    // Select first available room
    await homePage.bookRoom(0);
    
    // Fill booking details
    await bookingPage.fillBookingForm({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@test.com',
      phone: '+447700900123'
    });
    
    // Select dates (5 days from now, 2 nights)
    await bookingPage.selectDates(5, 2);
    
    // Submit booking
    await bookingPage.submitBooking();
    
    // Verify success
    await expect(bookingPage.successMessage).toBeVisible({ timeout: 10000 });
  });

  test('Validate required fields', async ({ page }) => {
    const homePage = new HomePage(page);
    const bookingPage = new BookingPage(page);
    
    await homePage.bookRoom(0);
    
    // Try to submit without filling form
    await bookingPage.submitBooking();
    
    // Check validation
    await expect(bookingPage.errorMessages).toBeVisible();
  });
});