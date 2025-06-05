import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    // headless: true,
    /*
     * Use these two settings instead of the one above if you want to see the
     * browser. However, in the grading system e2e test run headless, so make
     * sure they work that way before submitting.
     */
    headless: false,
    slowMo: 20,
    // defaultViewport: null,
    // args: ['--start-maximized'],
  });

  if (!browser) {
    throw new Error('Browser failed to launch');
  }

  page = await browser.newPage();
  await page.goto('http://localhost:3001/enforcement/login');
  // await page.goto('https://copark.space/driver/en/login');
});

afterEach(async () => {
  await browser.close();
});

const typeText = async (selector: string, text: string) => {
  const input = await page.waitForSelector(selector);
  await input?.type(text);
  input?.dispose();
};

test('Enforcement Can Login Successfully', async () => {
  await typeText(`::-p-text(Your Email)`, 'babayaga@copark.com');
  await typeText('::-p-text(Password)', 'password1');
  const continueButton = await page.waitForSelector(`::-p-aria(login-button)`);
  await continueButton?.click();
  expect(await page.waitForSelector(`::-p-text(Dashboard)`)).toBeDefined();
}, 10000);
