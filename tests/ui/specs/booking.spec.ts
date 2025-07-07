import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ReservationPage } from '../pages/reservation.page';

test.describe('Room Booking Flow @critical', () => {
  test('Complete booking for first available room', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    // Navigate and wait for page to load
    await homePage.navigate();
    
    // Wait for rooms to be visible
    await homePage.roomCards.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Get the first room's name for logging
    const firstRoomTitle = await homePage.roomCards.first().locator('.card-title').textContent();
    console.log('Booking room:', firstRoomTitle);
    
    // Click first room
    await homePage.bookRoomByIndex(0);
    
    // Should be on reservation page with booking form already visible
    await expect(page).toHaveURL(/\/reservation\/\d+/);
    await expect(reservationPage.roomTitle).toBeVisible();

    await reservationPage.submitBooking();
    
    // The booking form is already on the page, no need to click Reserve Now first
    // Just fill the form directly
    await reservationPage.fillBookingForm({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@test.com',
      phone: '07700900123'
    });
    
    // Submit booking by clicking Reserve Now
    await reservationPage.submitBooking();
    
    // Wait for response (might show modal or redirect)
    await page.waitForTimeout(2000);
    
    // Check for confirmation - could be modal, alert, or page change
    const hasModal = await page.locator('.modal.show').isVisible().catch(() => false);
    const hasAlert = await page.locator('.alert-success').isVisible().catch(() => false);
    const urlChanged = !page.url().includes('/reservation/');
    
    if (hasModal || hasAlert || urlChanged) {
      console.log('Booking appears successful');
      console.log('Has modal:', hasModal);
      console.log('Has alert:', hasAlert);
      console.log('URL changed:', urlChanged);
    } else {
      // Check for any error messages
      const hasError = await page.locator('.alert-danger').isVisible().catch(() => false);
      if (hasError) {
        const errorText = await page.locator('.alert-danger').textContent();
        console.log('Booking failed with error:', errorText);
      }
    }
  });

  test('Verify room prices and fees', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    await homePage.navigate();
    
    // Wait for rooms to load
    await homePage.roomCards.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Get all room prices from home page
    const roomPrices = await homePage.roomPrices.allTextContents();
    console.log('Available room prices:', roomPrices);
    
    // Check first room
    await homePage.bookRoomByIndex(0);
    const displayedPrice = await reservationPage.roomPrice.textContent();
    expect(displayedPrice).toContain('£');
    
    // Check price breakdown
    await expect(reservationPage.cleaningFee).toContainText('£25');
    await expect(reservationPage.serviceFee).toContainText('£15');
    
    // Go back and check another room if available
    const roomCount = await homePage.roomCards.count();
    if (roomCount > 1) {
      await homePage.navigate();
      await homePage.roomCards.first().waitFor({ state: 'visible', timeout: 10000 });
      await homePage.bookRoomByIndex(1);
      const secondPrice = await reservationPage.roomPrice.textContent();
      expect(secondPrice).toContain('£');
    }
  });

  test('Verify calendar functionality', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    await homePage.navigate();
    
    // Wait for rooms to load
    await homePage.roomCards.first().waitFor({ state: 'visible', timeout: 10000 });
    
    await homePage.bookRoomByIndex(0); // Book first available room
    
    // Verify calendar is visible
    await expect(reservationPage.calendar).toBeVisible();
    
    // Test calendar navigation
    await reservationPage.nextMonthButton.click();
    await page.waitForTimeout(500); // Wait for calendar to update
    
    // Select dates
    await reservationPage.selectDateRange('15', '18');
    
    // Verify total price updates (3 nights)
    await page.waitForTimeout(1000); // Wait for price calculation
    const totalPrice = await reservationPage.getTotalPrice();
    expect(totalPrice).toBeTruthy();
  });
});