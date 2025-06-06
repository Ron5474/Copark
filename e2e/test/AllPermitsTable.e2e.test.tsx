import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  if (!browser) {
    throw new Error('Browser failed to launch');
  }

  page = await browser.newPage();
  await page.setBypassCSP(true);
  
  // Login first
  await page.goto('http://localhost:3002/admin/login');
  await typeText('#email', 'jxiong0822@outlook.com');
  await typeText('#password', 'password1');
  await click('button[type="submit"]');
  await page.waitForNavigation();
  
  // Navigate to permits page
  await click('text=All Permits');
  await page.waitForSelector('text=All Permits (Active Only)', { timeout: 15000 });
}, 20000);

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

test('toggles between active and all permits', async () => {
  // Find and click toggle switch
  const toggle = await page.waitForSelector('input[type="checkbox"]');
  await toggle?.click();

  // Verify text change
  const allPermitsText = await page.waitForSelector('text=All Permits (All)');
  expect(allPermitsText).toBeTruthy();

  // Click again to toggle back
  await toggle?.click();
  const activeOnlyText = await page.waitForSelector('text=All Permits (Active Only)');
  expect(activeOnlyText).toBeTruthy();
});

