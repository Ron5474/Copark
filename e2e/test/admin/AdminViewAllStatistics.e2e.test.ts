import { test, beforeEach, afterEach, expect } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeEach(async () => {
  // console.log('Launching browser...');
  browser = await puppeteer.launch({
    headless: true,
    slowMo: 10,
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

test('Admin can log in and navigate to View Statistics tab', async () => {
  // Fill in login form
  await typeText('input[name="email"]', 'jxiong0822@outlook.com');
  await typeText('input[name="password"]', 'password1');
  await click('button[type="submit"]');

  // Wait for dashboard/home to load
  await page.waitForSelector('h4', { timeout: 10000 }); // Wait for a heading to appear

  // Wait for the statistics header to appear and check its text
  const header = await page.waitForSelector('h4', { timeout: 10000 });
  expect(await header?.evaluate(node => node.textContent)).toMatch(/Statistics/i);

  await click('text=Tickets by Day');
  await click('text=Tickets by Enforcer');
  await page.$('text/Enforcer 1');
  await click('text=Permits by Day');
  await click('text=Permits by Zone');
  await click('text=Permits by Lot');
  await click('text=All Permits');

},20000);
