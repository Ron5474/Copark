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

test('Admin can view unpaid tickets and see ticket details', async () => {
  // Log in as admin
  await typeText('input[name="email"]', 'jxiong0822@outlook.com');
  await typeText('input[name="password"]', 'password1');
  await click('button[type="submit"]');

  // Wait for dashboard/home to load
  await page.waitForSelector('h4', { timeout: 10000 });

  await click('text=Manage Tickets');

  // Wait for the unpaid tickets list to appear
  await page.waitForSelector('h6', { timeout: 10000 });
  const header = await page.$('h6');
  expect(await header?.evaluate(node => node.textContent)).toMatch(/No Ticket Selected/i);

  // Check for a ticket in the list
  const ticketRow = await page.waitForSelector('text/Ticket #', { timeout: 10000 });
  expect(ticketRow).toBeDefined();

  // Click on a ticket to view details
  await ticketRow?.click();
  const violation = await page.$('text/this is a challenged ticket that will be rejected');
  expect(violation).toBeDefined();

}, 30000);

