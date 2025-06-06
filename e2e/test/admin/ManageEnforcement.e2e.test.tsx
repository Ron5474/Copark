import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
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
  
  // Navigate to Manage Enforcement section
  await click('text=Manage Enforcement');
  
  // Wait for the component to load
  await page.waitForSelector('[data-testid="enforcers-list"]', { timeout: 15000 });
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

test('should add a new enforcer', async () => {
  // Click add enforcer button
  await click('text=Add Enforcer');
  
  // Fill in the form
  await typeText('[aria-label="Input Name"] input', 'New Enforcer');
  await typeText('[aria-label="Input Email"] input', 'new.enforcer@example.com');
  
  // Submit form
  await click('text=Add');
  
  await page.waitForSelector('text=New Enforcer');
}, 30000);

test('should suspend and reinstate an enforcer', async () => {
  // Find and click suspend button for first enforcer
  const suspendButton = await page.$('[aria-label="Suspend user"]');
  await suspendButton?.click();
  
  // Verify status changed to suspended
  await page.waitForSelector('text=suspended');
  
  // Find and click reinstate button
  const reinstateButton = await page.$('[aria-label="Restore user"]');
  await reinstateButton?.click();
  
  // Verify status changed back to active
  await page.waitForSelector('text=active');
}, 30000);

test('should delete an enforcer', async () => {
  const deleteButton = await page.$('[aria-label="Delete user"]');
  await deleteButton?.click();
}, 30000);

test('should close dialogs with backdrop click', async () => {
  // Open add enforcer dialog
  await click('text=Add Enforcer');
  
  // Click backdrop
  await page.click('.MuiBackdrop-root');
  
  // Verify dialog closed
  const dialog = await page.$('dialog');
  expect(dialog).toBeNull();
}, 30000);

