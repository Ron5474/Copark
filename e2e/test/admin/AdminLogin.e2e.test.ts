import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  // console.log('Launching browser...');
  browser = await puppeteer.launch({
    headless: true,
    // slowMo: 20,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  if (!browser) {
    throw new Error('Browser failed to launch');
  }
  // console.log('Browser launched successfully');

  page = await browser.newPage();
  await page.setBypassCSP(true)
  await page.goto('http://localhost:3002/admin/login');
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

test('Login page renders with all required elements', async () => {
  // Check for email input
  expect(await page.waitForSelector('#email')).toBeDefined();
  
  // Check for password input
  expect(await page.waitForSelector('#password')).toBeDefined();
  
  // Check for sign in button
  expect(await page.waitForSelector('button[type="submit"]')).toBeDefined();
});

test('Admin can login successfully', async () => {
  await typeText('#email', 'jxiong0822@outlook.com');
  await typeText('#password', 'password1');
  await click('button[type="submit"]');

  // Wait for navigation and verify we're on the dashboard
  await page.waitForNavigation();
  const url = page.url();
  expect(url).toContain('/admin');
}, 10000);

test('Admin sees error with invalid credentials', async () => {
  await typeText('#email', 'wrong@email.com');
  await typeText('#password', 'wrongpass');
  await click('button[type="submit"]');

  // Wait for error message
  const errorAlert = await page.waitForSelector('.MuiAlert-standardError');
  expect(await errorAlert?.evaluate(node => node.textContent)).toBe('Invalid email or password');
}, 10000);

test('Password visibility toggle works', async () => {
  // Initial password field should be type="password"
  const passwordInput = await page.waitForSelector('#password');
  expect(await passwordInput?.evaluate(el => el.getAttribute('type'))).toBe('password');

  // Click visibility toggle
  await click('button[aria-label="toggle password visibility"]');
  
  // Password should now be visible (type="text")
  expect(await passwordInput?.evaluate(el => el.getAttribute('type'))).toBe('text');

  // Click visibility toggle again
  await click('button[aria-label="toggle password visibility"]');
  
  // Password should be hidden again
  expect(await passwordInput?.evaluate(el => el.getAttribute('type'))).toBe('password');
}, 10000);