import { Page, Locator } from '@playwright/test';
import { BasePage } from '././basepage';

export class HomePage extends BasePage {
  readonly bookButtons: Locator;
  readonly roomImages: Locator;
  readonly hotelLogo: Locator;
  readonly contactInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.bookButtons = page.locator('a.btn:has-text("Book Now")');
    this.roomImages = page.locator('.room-image, img[alt*="room"]');
    this.hotelLogo = page.locator('.hotel-logo, h1');
    this.contactInfo = page.locator('.contact-info, footer');
  }

  async bookRoom(roomNumber: number = 2) {
    await this.bookButtons.nth(roomNumber).click();
  }

  async getRoomCount(): Promise<number> {
    return await this.bookButtons.count();
  }
}