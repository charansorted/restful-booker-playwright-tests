import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ReservationPage } from '../pages/reservation.page';

test.describe('Room Booking Flow @critical', () => {
  test('Complete booking for Single room', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    // Navigate and select Single room
    await homePage.navigate();
    await homePage.bookRoomByName('Single');
    
    // Should be on reservation page with calendar
    await expect(page).toHaveURL(/\/reservation\/1/);
    await expect(reservationPage.roomTitle).toContainText('Single');
    
    // Select dates if needed (they might be pre-selected from URL params)
    // await reservationPage.selectDateRange('10', '12');
    
    // Click Reserve Now to proceed to booking form
    await reservationPage.clickReserveNow();
    
    // Wait for booking form to appear (might be in modal or new page)
    await reservationPage.waitForBookingForm();
    
    // Fill booking form
    await reservationPage.fillBookingForm({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@test.com',
      phone: '07700900123'
    });
    
    // Submit booking
    await reservationPage.submitBooking();
    
    // Verify confirmation
    await reservationPage.waitForConfirmation();
    const confirmationText = await reservationPage.getConfirmationText();
    expect(confirmationText).toContain('successfully');
  });

  test('Verify room prices and fees', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    await homePage.navigate();
    
    // Check Single room
    await homePage.bookRoomByName('Single');
    await expect(reservationPage.roomPrice).toContainText('£100');
    
    // Check price breakdown
    await expect(reservationPage.cleaningFee).toContainText('£25');
    await expect(reservationPage.serviceFee).toContainText('£15');
    
    // Go back and check Double room
    await homePage.navigate();
    await homePage.bookRoomByName('Double');
    await expect(reservationPage.roomPrice).toContainText('£150');
    
    // Go back and check Suite
    await homePage.navigate();
    await homePage.bookRoomByName('Suite');
    await expect(reservationPage.roomPrice).toContainText('£225');
  });

  test('Verify calendar functionality', async ({ page }) => {
    const homePage = new HomePage(page);
    const reservationPage = new ReservationPage(page);
    
    await homePage.navigate();
    await homePage.bookRoomByName('Double');
    
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
