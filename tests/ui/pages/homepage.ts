import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';

export class HomePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Navigation Locators - Exact from codegen
    get adminLink(): Locator {
        return this.page.getByRole('link', { name: 'Admin', exact: true });
    }

    get restfulBookerLink(): Locator {
        return this.page.getByRole('link', { name: 'Restful Booker Platform Demo' });
    }

    get roomsNavLink(): Locator {
        return this.page.locator('#navbarNav').getByRole('link', { name: 'Rooms' });
    }

    get checkAvailabilityButton(): Locator {
        return this.page.getByRole('button', { name: 'Check Availability' });
    }

    get letMeHackButton(): Locator {
        return this.page.locator('button:has-text("Let me hack!")');
    }

    // Methods
    async navigate(): Promise<void> {
        await this.navigateToHomePage();
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto('/');
        await this.waitForLoadState();
        await this.handleIntroModal();
    }

    async handleIntroModal(): Promise<void> {
        try {
            if (await this.letMeHackButton.isVisible({ timeout: 2000 })) {
                await this.letMeHackButton.click();
                await this.page.waitForTimeout(1000);
            }
        } catch {
           
        }
    }

    async clickAdminLink(): Promise<void> {
        await this.adminLink.click();
    }

    async navigateToRooms(): Promise<void> {
        await this.roomsNavLink.click();
        await this.waitForLoadState();
    }

    async bookRoomByPrice(price: string): Promise<void> {
        
        await this.page.locator('div').filter({ hasText: new RegExp(`^£${price} per nightBook now$`) }).getByRole('link').click();
    }

    async bookRoomByExactPriceText(priceText: string): Promise<void> {
        // For exact match like "£888 per nightBook now"
        await this.page.locator('div').filter({ hasText: new RegExp(`^${priceText}$`) }).getByRole('link').click();
    }

    getRoomDivByPrice(price: string): Locator {
        return this.page.locator('div').filter({ hasText: new RegExp(`^£${price} per nightBook now$`) });
    }

    async clickBookNowForPrice(price: string): Promise<void> {
        const roomDiv = this.getRoomDivByPrice(price);
        await roomDiv.getByRole('link').click();
    }

    async bookFirstAvailableRoom(): Promise<void> {
        
        if (await this.checkAvailabilityButton.isVisible({ timeout: 2000 })) {
            await this.checkAvailabilityButton.click();
            await this.page.waitForTimeout(1000);
        }
        
       
        const bookNowLink = this.page.getByRole('link', { name: 'Book now', exact: true }).first();
        await bookNowLink.click();
    }

    async getRoomInfo(roomIndex: number = 0): Promise<{ roomType: string; price: string } | null> {
        
        const roomDivs = await this.page.locator('div').filter({ hasText: /£\d+ per night/ }).all();
        
        if (roomDivs[roomIndex]) {
            const roomText = await roomDivs[roomIndex].textContent() || '';
            const priceMatch = roomText.match(/£(\d+) per night/);
            const price = priceMatch ? priceMatch[0] : '';
            
            return { roomType: 'Room', price };
        }
        return null;
    }

    async getAllRoomPrices(): Promise<string[]> {
        const roomDivs = await this.page.locator('div').filter({ hasText: /£\d+ per night/ }).all();
        const prices: string[] = [];
        
        for (const div of roomDivs) {
            const text = await div.textContent() || '';
            const priceMatch = text.match(/£(\d+)/);
            if (priceMatch) {
                prices.push(priceMatch[1]);
            }
        }
        
        return prices;
    }

    async bookRoomByName(roomName: string): Promise<void> {
        
        await this.bookFirstAvailableRoom();
    }
}