import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';
import { TEST_CONFIG } from '../../../src/config/test.config';

interface RoomDetails {
    roomNumber: string;
    roomType?: string;
    accessible?: string;
    price: string;
    amenities?: {
        wifi?: boolean;
        tv?: boolean;
        radio?: boolean;
        refreshments?: boolean;
        safe?: boolean;
        views?: boolean;
    };
}

interface RoomInfo {
    roomNumber: string;
    roomType: string;
    accessible: string;
    price: string;
}

export class AdminPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    
    get usernameInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Username' });
    }

    get passwordInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Password' });
    }

    get loginButton(): Locator {
        return this.page.getByRole('button', { name: 'Login' });
    }

    get logoutButton(): Locator {
        return this.page.getByRole('button', { name: 'Logout' });
    }

   
    get roomNameInput(): Locator {
        return this.page.getByTestId('roomName');
    }

    get roomTypeSelect(): Locator {
        return this.page.locator('#type');
    }

    get accessibleSelect(): Locator {
        return this.page.locator('#accessible');
    }

    get roomPriceInput(): Locator {
        return this.page.locator('#roomPrice');
    }

    get createRoomButton(): Locator {
        return this.page.getByRole('button', { name: 'Create' });
    }

   
    get wifiCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'WiFi' });
    }

    get refreshmentsCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'Refreshments' });
    }

    get tvCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'TV' });
    }

    get safeCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'Safe' });
    }

    get radioCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'Radio' });
    }

    get viewsCheckbox(): Locator {
        return this.page.getByRole('checkbox', { name: 'Views' });
    }

   
    get restfulBookerLink(): Locator {
        return this.page.getByRole('link', { name: 'Restful Booker Platform Demo' });
    }

    get adminLink(): Locator {
        return this.page.getByRole('link', { name: 'Admin', exact: true });
    }

    
    async login(username?: string, password?: string): Promise<void> {
        const user = username || TEST_CONFIG.credentials.admin.username;
        const pass = password || TEST_CONFIG.credentials.admin.password;
        
        await this.usernameInput.click();
        await this.usernameInput.fill(user);
        await this.passwordInput.click();
        await this.passwordInput.fill(pass);
        await this.loginButton.click();
    }

    async logout(): Promise<void> {
        await this.logoutButton.click();
    }

    async createRoom(roomDetails: RoomDetails): Promise<void> {
      
        await this.roomNameInput.click();
        await this.roomNameInput.fill(roomDetails.roomNumber);
        
      
        if (roomDetails.roomType) {
            await this.roomTypeSelect.selectOption(roomDetails.roomType);
        }
        
       
        if (roomDetails.accessible) {
            await this.accessibleSelect.selectOption(roomDetails.accessible);
        }
        
       
        await this.roomPriceInput.click();
        await this.roomPriceInput.fill(roomDetails.price);
        
       
        if (roomDetails.amenities) {
            if (roomDetails.amenities.wifi) {
                await this.wifiCheckbox.check();
            }
            if (roomDetails.amenities.refreshments) {
                await this.refreshmentsCheckbox.check();
            }
            if (roomDetails.amenities.tv) {
                await this.tvCheckbox.check();
            }
            if (roomDetails.amenities.safe) {
                await this.safeCheckbox.check();
            }
            if (roomDetails.amenities.radio) {
                await this.radioCheckbox.check();
            }
            if (roomDetails.amenities.views) {
                await this.viewsCheckbox.check();
            }
        }
        
        await this.createRoomButton.click();
    }

    async createFullRoom(roomNumber: string = 'Auto', price: string = '888'): Promise<void> {
        
        await this.roomNameInput.click();
        await this.roomNameInput.fill(roomNumber);
        await this.roomTypeSelect.selectOption('Suite');
        await this.accessibleSelect.selectOption('true');
        await this.roomPriceInput.click();
        await this.roomPriceInput.fill(price);
        await this.wifiCheckbox.check();
        await this.refreshmentsCheckbox.check();
        await this.tvCheckbox.check();
        await this.safeCheckbox.check();
        await this.radioCheckbox.check();
        await this.viewsCheckbox.check();
        await this.createRoomButton.click();
    }

    async navigateToFrontPage(): Promise<void> {
        await this.restfulBookerLink.click();
    }

    async clickRoomById(roomId: string): Promise<void> {
        await this.page.locator(`[id="${roomId}"]`).click();
    }

    async getRoomList(): Promise<RoomInfo[]> {
        await this.page.waitForTimeout(1000);
        
        const rooms: RoomInfo[] = [];
        
       
        const roomElements = await this.page.$$('[id]:has(div)');
        
        for (const element of roomElements) {
            try {
                const id = await element.getAttribute('id');
                if (id && /^\d+$/.test(id)) { 
                    const divs = await element.$$('div');
                    if (divs.length >= 4) {
                        const roomNumber = await divs[0].textContent() || '';
                        const roomType = await divs[1].textContent() || '';
                        const accessible = await divs[2].textContent() || '';
                        const price = await divs[3].textContent() || '';
                        
                        if (roomNumber.trim()) {
                            rooms.push({
                                roomNumber: roomNumber.trim(),
                                roomType: roomType.trim(),
                                accessible: accessible.trim(),
                                price: price.trim()
                            });
                        }
                    }
                }
            } catch (error) {
                console.log('Error parsing room:', error);
            }
        }
        
        return rooms;
    }

    async deleteAllRooms(): Promise<void> {
        let deletedCount = 0;
        
        // Wait for page to be fully loaded
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        while (true) {
            const deleteButton = this.page.locator('span.fa.fa-remove.roomDelete').first();
            
            if (await deleteButton.isVisible({ timeout: 3000 })) {
                await deleteButton.click();
                deletedCount++;
                // Wait longer for deletion to process
                await this.page.waitForTimeout(1500);
            } else {
                console.log(`Deleted ${deletedCount} rooms`);
                break;
            }
        }
    }

    async getRoomCount(): Promise<number> {
        const deleteButtons = await this.page.locator('span.fa.fa-remove.roomDelete').all();
        return deleteButtons.length;
    }

    async deleteAllRoomsWithVerification(): Promise<void> {
        const initialCount = await this.getRoomCount();
        console.log(`Found ${initialCount} rooms to delete`);
        
        if (initialCount === 0) {
            console.log('No rooms to delete');
            return;
        }
        
        // Delete all rooms
        await this.deleteAllRooms();
        
        // Verify all rooms are deleted
        const finalCount = await this.getRoomCount();
        if (finalCount === 0) {
            console.log('All rooms successfully deleted');
        } else {
            console.log(`Warning: ${finalCount} rooms still remain`);
        }

}
}

