import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ReservationPage } from '../pages/reservation.page';

test.describe('Smoke Tests @smoke', () => {
  test('Homepage loads with all key elements', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    // Verify navigation
    await expect(homePage.navBar).toBeVisible();
    await expect(homePage.navBrand).toContainText('Shady Meadows B&B');
    
    // Verify hero section
    await expect(homePage.welcomeHeading).toBeVisible();
    await expect(homePage.heroBookNowButton).toBeVisible();
    
    // Verify booking section
    await expect(homePage.bookingSection).toBeVisible();
    await expect(homePage.checkAvailabilityButton).toBeVisible();
    
    // Verify rooms section
    await expect(homePage.roomsSection).toBeVisible();
    const roomCount = await homePage.getRoomCount();
    expect(roomCount).toBeGreaterThanOrEqual(3); // At least 3 rooms
    
    // Verify at least some rooms are displayed (don't check specific names since they vary)
    const roomTitles = await homePage.roomCards.locator('.card-title').allTextContents();
    expect(roomTitles.length).toBeGreaterThan(0);
    console.log('Available rooms:', roomTitles);
    
    // Verify contact section
    await expect(homePage.contactSection).toBeVisible();
    await expect(homePage.contactForm).toBeVisible();
  });

  test('Can navigate to room reservation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    // Get the first available room instead of looking for "Single"
    const firstRoomTitle = await homePage.roomCards.first().locator('.card-title').textContent();
    console.log('Booking room:', firstRoomTitle);
    
    // Click on first room booking button
    await homePage.bookRoomByIndex(0);
    
    // Should navigate to reservation page
    await expect(page).toHaveURL(/\/reservation\/\d+/);
    
    const reservationPage = new ReservationPage(page);
    
    // Verify reservation page elements
    await expect(reservationPage.roomTitle).toBeVisible();
    await expect(reservationPage.calendar).toBeVisible();
    await expect(reservationPage.priceSummary).toBeVisible();
    await expect(reservationPage.reserveNowButton).toBeVisible();
    
    // Verify room price is displayed
    const price = await reservationPage.getRoomPrice();
    expect(price).toContain('£');
  });

  test('Contact form is functional', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    
    await page.evaluate(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    
    await homePage.contactForm.waitFor({ state: 'visible' });
    
    // Fill contact form
    await homePage.fillContactForm({
      name: 'Test User',
      email: 'test@example.com',
      phone: '01234567890',
      subject: 'Test Inquiry',
      message: 'This is a test message'
    });
    
    // Verify form is filled
    await expect(homePage.contactNameInput).toHaveValue('Test User');
    await expect(homePage.contactEmailInput).toHaveValue('test@example.com');
    await expect(homePage.contactSubmitButton).toBeEnabled();
  });
});