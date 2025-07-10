import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homepage';
import { AdminPage } from '../pages/adminpage';
import { ReservationPage } from '../pages/reservationpage';

test.describe('Hotel Booking System - End to End Tests', () => {
    let homePage: HomePage;
    let adminPage: AdminPage;
    let reservationPage: ReservationPage;

    test.beforeEach(async ({ page }) => {
       
        homePage = new HomePage(page);
        adminPage = new AdminPage(page);
        reservationPage = new ReservationPage(page);
        
        // Clean rooms before each test
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.getByRole('link', { name: 'Admin', exact: true }).click();
        await page.waitForTimeout(1000);
        
        await page.getByRole('textbox', { name: 'Username' }).fill('admin');
        await page.getByRole('textbox', { name: 'Password' }).fill('password');
        await page.getByRole('button', { name: 'Login' }).click();
        
        // Wait for admin panel to load
        await page.waitForTimeout(2000);
        
        await adminPage.deleteAllRooms();
        
        await page.getByRole('button', { name: 'Logout' }).click();
        await page.waitForTimeout(1000);
    });
    
    test.afterEach(async ({ page }) => {
       
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.getByRole('link', { name: 'Admin', exact: true }).click();
        await page.waitForTimeout(1000);
        
        // Check if already logged in
        const logoutButton = page.getByRole('button', { name: 'Logout' });
        if (!(await logoutButton.isVisible({ timeout: 2000 }))) {
            await page.getByRole('textbox', { name: 'Username' }).fill('admin');
            await page.getByRole('textbox', { name: 'Password' }).fill('password');
            await page.getByRole('button', { name: 'Login' }).click();
            await page.waitForTimeout(2000);
        }
        
        await adminPage.deleteAllRooms();
        
        if (await logoutButton.isVisible({ timeout: 2000 })) {
            await page.getByRole('button', { name: 'Logout' }).click();
        }
        await page.waitForTimeout(1000);
    });

    test('@smoke Complete flow: Create Suite room and book it', async ({ page }) => {
        // Step 1: Navigate to home page
        await page.goto('/');
        
        // Step 2: Go to admin and login
        await adminPage.adminLink.click();
        await adminPage.login('admin', 'password');
        
        // Step 3: Create a Suite room with all amenities using helper method
        await adminPage.createFullRoom('Auto', '888');
        
        // Step 4: Navigate back to front page
        await adminPage.navigateToFrontPage();
        
        // Step 5: Book the created room (£888)
        await homePage.bookRoomByPrice('888');
        
        // Step 6: Click Reserve Now
        await reservationPage.clickReserveNow();
        
        // Step 7: Fill booking form
        await reservationPage.fillBookingForm({
            firstname: 'Auto',
            lastname: 'Tester',
            email: 'tester@gmail.com',
            phone: '07923128761'
        });
        
        // Step 8: Complete reservation
        await reservationPage.submitBooking();
        
        // Step 9: Verify booking confirmation
        await expect(reservationPage.bookingConfirmation).toBeVisible();
        
        // Step 10: Return home
        await reservationPage.returnHome();
        
        // Step 11: Go back to admin
        await adminPage.adminLink.click();
        
        // Step 12: Delete the created room
        await adminPage.deleteAllRoomsWithVerification();

        // Step 13: Logout
        await adminPage.logout();
    });

   
});