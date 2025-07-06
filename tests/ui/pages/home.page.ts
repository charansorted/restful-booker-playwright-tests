import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';

export class HomePage extends BasePage {
  // Navigation
  readonly navBar: Locator;
  readonly navBrand: Locator;
  readonly navLinks: Locator;
  readonly adminLink: Locator;
  
  // Hero Section
  readonly heroSection: Locator;
  readonly welcomeHeading: Locator;
  readonly heroDescription: Locator;
  readonly heroBookNowButton: Locator;
  
  // Booking Section
  readonly bookingSection: Locator;
  readonly checkinInput: Locator;
  readonly checkoutInput: Locator;
  readonly checkAvailabilityButton: Locator;
  
  // Rooms Section
  readonly roomsSection: Locator;
  readonly roomCards: Locator;
  readonly roomPrices: Locator;
  readonly bookRoomButtons: Locator;
  
  // Contact Section
  readonly contactSection: Locator;
  readonly contactForm: Locator;
  readonly contactNameInput: Locator;
  readonly contactEmailInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly contactSubjectInput: Locator;
  readonly contactMessageTextarea: Locator;
  readonly contactSubmitButton: Locator;
  
  // Footer
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation
    this.navBar = page.locator('nav.navbar');
    this.navBrand = page.locator('.navbar-brand');
    this.navLinks = page.locator('.navbar-nav .nav-link');
    this.adminLink = page.locator('.nav-link[href="/admin"]');
    
    // Hero Section
    this.heroSection = page.locator('section.hero');
    this.welcomeHeading = page.locator('h1:has-text("Welcome to Shady Meadows")');
    this.heroDescription = page.locator('.hero-content p.lead');
    this.heroBookNowButton = page.locator('.hero-content .btn-primary:has-text("Book Now")');
    
    // Booking Section
    this.bookingSection = page.locator('#booking');
    this.checkinInput = page.locator('#booking input[value*="/"]').first();
    this.checkoutInput = page.locator('#booking input[value*="/"]').nth(1);
    this.checkAvailabilityButton = page.locator('button:has-text("Check Availability")');
    
    // Rooms Section
    this.roomsSection = page.locator('#rooms');
    this.roomCards = page.locator('.card.h-100.shadow-sm');
    this.roomPrices = page.locator('.card .fw-bold.fs-5');
    this.bookRoomButtons = page.locator('.card .btn-primary:has-text("Book now")');
    
    // Contact Section
    this.contactSection = page.locator('#contact');
    this.contactForm = page.locator('#contact form');
    this.contactNameInput = page.locator('[data-testid="ContactName"]');
    this.contactEmailInput = page.locator('[data-testid="ContactEmail"]');
    this.contactPhoneInput = page.locator('[data-testid="ContactPhone"]');
    this.contactSubjectInput = page.locator('[data-testid="ContactSubject"]');
    this.contactMessageTextarea = page.locator('[data-testid="ContactDescription"]');
    this.contactSubmitButton = page.locator('#contact button:has-text("Submit")');
    
    // Footer
    this.footer = page.locator('footer');
  }

  async navigateToRooms() {
    await this.navLinks.filter({ hasText: 'Rooms' }).click();
  }

  async navigateToContact() {
    await this.navLinks.filter({ hasText: 'Contact' }).click();
  }

  async navigateToAdmin() {
    await this.adminLink.click();
  }

  async getRoomCount(): Promise<number> {
    return await this.roomCards.count();
  }

  async getRoomByName(roomName: string): Promise<Locator> {
    return this.roomCards.filter({ hasText: roomName });
  }

  async bookRoomByName(roomName: string) {
    const roomCard = await this.getRoomByName(roomName);
    await roomCard.locator('.btn-primary:has-text("Book now")').click();
  }

  async bookRoomByIndex(index: number) {
    await this.bookRoomButtons.nth(index).click();
  }

  async getRoomPrice(roomName: string): Promise<string> {
    const roomCard = await this.getRoomByName(roomName);
    const priceText = await roomCard.locator('.fw-bold.fs-5').textContent();
    return priceText || '';
  }

  async getRoomFeatures(roomName: string): Promise<string[]> {
    const roomCard = await this.getRoomByName(roomName);
    const features = await roomCard.locator('.badge').allTextContents();
    return features;
  }

  async fillContactForm(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    await this.contactNameInput.fill(data.name);
    await this.contactEmailInput.fill(data.email);
    await this.contactPhoneInput.fill(data.phone);
    await this.contactSubjectInput.fill(data.subject);
    await this.contactMessageTextarea.fill(data.message);
  }

  async submitContactForm() {
    await this.contactSubmitButton.click();
  }

  async checkAvailability(checkinDate?: string, checkoutDate?: string) {
    if (checkinDate) {
      await this.checkinInput.clear();
      await this.checkinInput.fill(checkinDate);
    }
    if (checkoutDate) {
      await this.checkoutInput.clear();
      await this.checkoutInput.fill(checkoutDate);
    }
    await this.checkAvailabilityButton.click();
  }
}