import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(url: string = '/'): Promise<void> {
        if (url.startsWith('http')) {
            await this.page.goto(url);
        } else {
            await this.page.goto(url);
        }
    }

    async click(selector: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await this.page.click(selector);
    }

    async fill(selector: string, text: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await this.page.fill(selector, text);
    }

    async clear(selector: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        await this.page.fill(selector, '');
    }

    async getText(selector: string): Promise<string | null> {
        return await this.page.textContent(selector);
    }

    async waitForSelector(selector: string, options: any = {}): Promise<void> {
        await this.page.waitForSelector(selector, options);
    }

    async isVisible(selector: string): Promise<boolean> {
        try {
            return await this.page.isVisible(selector);
        } catch {
            return false;
        }
    }

    async selectOption(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, value);
    }

    async waitForLoadState(state: "load" | "domcontentloaded" | "networkidle" = 'networkidle'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    async waitForTimeout(timeout: number): Promise<void> {
        await this.page.waitForTimeout(timeout);
    }

    async scrollIntoView(selector: string): Promise<void> {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

    async check(selector: string): Promise<void> {
        await this.page.check(selector);
    }

    async uncheck(selector: string): Promise<void> {
        await this.page.uncheck(selector);
    }

    async isChecked(selector: string): Promise<boolean> {
        return await this.page.isChecked(selector);
    }

    async screenshot(options?: any): Promise<Buffer> {
        return await this.page.screenshot(options);
    }

    async waitForURL(urlPattern: string | RegExp, options?: any): Promise<void> {
        await this.page.waitForURL(urlPattern, options);
    }
}