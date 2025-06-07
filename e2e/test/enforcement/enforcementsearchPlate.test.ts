import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  console.log('Launching browser...');
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
  console.log('Browser launched successfully');

  page = await browser.newPage();
  await page.setBypassCSP(true)
  await page.goto('http://localhost:3001/enforcement/login');
  // await page.goto('https://copark.space/driver/en/login');
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

const login = async (email: string, password: string) => {
  await page.waitForSelector(`::-p-text(Your Email)`);
  await page.type(`::-p-text(Your Email)`, email);
  await page.waitForSelector('::-p-text(Password)');
  await page.type('::-p-text(Password)', password);
  const continueButton = await page.waitForSelector(`::-p-aria(login-button)`);
  if (!continueButton) {
    throw new Error('Login button not found');
  }
  await continueButton.click();
  const dashboard = await page.waitForSelector(`::-p-text(Dashboard)`, { timeout: 5000 });
  if (!dashboard) {
    throw new Error('Login failed, dashboard not found');
  }
  return true;
};

const typeText = async (selector: string, text: string) => {
  const input = await page.waitForSelector(selector);
  await input?.type(text);
  input?.dispose();
};

test('Enforcement Can Search a License Plate', async () => {
  await login('babayaga@copark.com', 'password1')
  await typeText(`::-p-text(License Plate Number)`, 'YAQUOB');
  await click('::-p-text(Select State)');
  await click(`::-p-text(California)`);
  await click(`::-p-aria(Search License Plate)`);
  expect(await page.waitForSelector(`::-p-text(No Permit Found)`)).toBeDefined();
}, 10000);

test('Enforcement Can Search Valid License Plate', async () => {
  await login('babayaga@copark.com', 'password1')
  await typeText(`::-p-text(License Plate Number)`, 'YAQUOB');
  await click('::-p-text(Select State)');
  await click(`::-p-text(California)`);
  await click(`::-p-aria(Search License Plate)`);
  expect(await page.waitForSelector(`::-p-text(No Permit Found)`)).toBeDefined();
}, 10000);