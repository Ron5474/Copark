import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: true,
        slowMo: 20,
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    page = await browser.newPage();
    await page.setBypassCSP(true);

    // Login first
    await page.goto('http://localhost:3002/admin/login');
    await typeText('#email', 'jxiong0822@outlook.com');
    await typeText('#password', 'password1');
    await click('button[type="submit"]');
    await page.waitForNavigation();

    await click('text=Manage Lots');
});

afterEach(async () => {
    await browser.close();
});

const click = async (selector: string) => {
    const element = await page.waitForSelector(selector);
    if (element) {
        await element.click();
        await element.dispose();
    } else {
        throw new Error(`Element with selector "${selector}" not found`);
    }
};

const typeText = async (selector: string, text: string) => {
    const input = await page.waitForSelector(selector);
    await input?.type(text);
    input?.dispose();
};

test('renders Manage Lots and fetches lots', async () => {
    await page.waitForSelector('text=Daily Lots');
    await page.waitForSelector('text=Quarterly Lots');
    await page.waitForSelector('text=Yearly Lots');
});

test('opens add dialog and creates new lot', async () => {
    await click('text=Add New Lot');
    await typeText('[aria-label="Lot ID Input"] input', '102');
    await typeText('[aria-label="Daily Price Input"] input', '5');
    await typeText('[aria-label="Quarterly Price Input"] input', '200');
    await typeText('[aria-label="Quarterly Expire Date Create Input"] input', '2024-12-31');
    await typeText('[aria-label="Yearly Price Input"] input', '500');
    await typeText('[aria-label="Yearly Expire Date Create Input"] input', '2024-12-31');
    await click('text=Create');
    await page.waitForSelector('text=102');
}, 20000);

test('opens edit dialog and updates lot', async () => {
    await page.waitForSelector('text=Edit');
    const editButtons = await page.$$('text=Edit');
    await editButtons[0]?.click();
    const priceInput = await page.waitForSelector('[aria-label="Price"] input');
    await priceInput?.click({ clickCount: 3 });
    await priceInput?.type('6');
    await click('text=Update');
    await new Promise(res => setTimeout(res, 500)); // Wait for update to reflect
});

test('handles dialog cancellation', async () => {
    await click('text=Add New Lot');
    await click('text=Cancel');
    await page.waitForSelector('text=Create New Lot', { hidden: true });

    // Edit dialog cancel
    const editButtons = await page.$$('text=Edit');
    await editButtons[0]?.click();
    await click('text=Cancel');
    await page.waitForSelector('text=Edit Lot Price', { hidden: true });
});
