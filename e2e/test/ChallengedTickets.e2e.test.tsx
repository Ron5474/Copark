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
  
  // Navigate to challenged tickets page
  await click('text=Manage Tickets');
  await click('text=Challenged Tickets');
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

test('renders list of challenged tickets', async () => {
  const challengeCount = await page.waitForSelector('text=Active Challenges:');
  expect(challengeCount).toBeTruthy();
});

test('displays ticket details when selected', async () => {
  await click('text=Vehicle:');
  expect(await page.waitForSelector('text=this is a challenged ticket that will be rejected')).toBeTruthy();
});

test('handles accepting a challenge', async () => {
  await click('text=Vehicle:');
  expect(await page.waitForSelector('text=this is a challenged ticket')).toBeTruthy();
  
  await click('text=Accept Challenge');
  await click('text=Accepted Tickets');
}, 20000);

test('handles rejecting a challenge', async () => {
  await click('text=Vehicle:');
  expect(await page.waitForSelector('text=this is a challenged ticket')).toBeTruthy();
  
  await click('text=Reject Challenge');
  await click('text=Unpaid Tickets');
}, 20000);

test('displays no tickets selected message initially', async () => {
  const noTicketMessage = await page.waitForSelector('text=No Ticket Selected');
  expect(noTicketMessage).toBeTruthy();
});
