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
  
  // Click on Manage Tickets in sidebar
  await click('text=Manage Tickets');
  
  // Wait for the component to load and click Accepted Tickets tab
  await page.waitForSelector('[role="tab"]');
  await click('text=Accepted Tickets');
  
  // Wait for tickets to load
  await page.waitForSelector('[data-testid="ticket-count"]', { timeout: 15000 });
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

test('renders list of accepted tickets', async () => {
  const ticketCount = await page.waitForSelector('[data-testid="ticket-count"]');
  expect(await ticketCount?.evaluate(el => el.textContent)).toContain('Accepted Tickets:');

  // Check for specific tickets
  const vehicleElements = await page.$$('[data-testid="vehicle-id"]');
  const vehicles = await Promise.all(
    vehicleElements.map(el => el.evaluate(node => node.textContent))
  );
  expect(vehicles.length).toBe(1);

  // Check status chips
  const statusChips = await page.$$('[data-testid="status-chip"]');
  expect(statusChips.length).toBeGreaterThan(0);
}, 10000);

test('displays no ticket selected message initially', async () => {
  const noTicketMessage = await page.waitForSelector('body');
  const helpText = await page.waitForSelector('body');

  expect(await noTicketMessage?.evaluate(el => el.textContent)).toContain('No Ticket Selected');
  expect(await helpText?.evaluate(el => el.textContent)).toContain('Select a ticket from the list to view its details');
}, 10000);