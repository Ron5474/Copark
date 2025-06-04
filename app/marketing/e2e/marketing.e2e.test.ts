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
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  if (!browser) {
    throw new Error('Browser failed to launch');
  }
  console.log('Browser launched successfully');

  page = await browser.newPage();
  await page.goto('http://localhost:8080/en');
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

test('Hero section displays CoPark heading', async () => {
  const heading = await page.waitForSelector('h1');
  if (!heading) {
    throw new Error('Heading element not found');
  }
  const text = await heading.evaluate(el => el.textContent || '');
  expect(text).toContain('Parking Permits Made Easy');
});

test('Get Started button redirects to driver app', async () => {
  const button = await page.waitForSelector('[aria-label="go-to-login"]');
  if (!button) {
    throw new Error('Button with aria-label "go-to-login" not found');
  }
  const [newPage] = await Promise.all([
    browser.waitForTarget(target => target.url().includes('driver')).then(t => t.page()),
    button.click(),
  ]);
  if (!newPage) {
    throw new Error('New page for driver app was not opened');
  }
  const url = newPage.url();
  expect(url).toMatch(/driver/);
});

test('Footer links to /privacy and /tos', async () => {
  await click('[aria-label="privacy-policy-link"]');
  expect(page.url()).toMatch(/\/privacy$/);

  await page.goto('http://localhost:8080/en');
  await click('[aria-label="service-terms-link"]');
  expect(page.url()).toMatch(/\/tos$/);
});
