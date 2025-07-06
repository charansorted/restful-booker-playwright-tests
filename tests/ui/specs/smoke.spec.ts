import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { BookingPage } from '../pages/booking.page';

test.describe('Smoke Tests @smoke', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    // Verify key elements are visible
    await expect(homePage.hotelLogo).toBeVisible();
    await expect(homePage.bookButtons.first()).toBeVisible();
    
    const roomCount = await homePage.getRoomCount();
    expect(roomCount).toBeGreaterThan(0);
  });

  test('Can open booking form', async ({ page }) => {
    const homePage = new HomePage(page);
    const bookingPage = new BookingPage(page);
    
    await homePage.navigate();
    await homePage.bookRoom(2);
    
    await bookingPage.selectDates(3, 4);

    await bookingPage.confirmReservation();

    // Verify booking form is displayed
    await expect(bookingPage.firstnameInput).toBeVisible();
    await expect(bookingPage.reserveNowButton).toBeVisible();
  });
});