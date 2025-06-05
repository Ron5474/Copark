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
  await page.setBypassCSP(true)
  await page.goto('http://localhost:3000/driver/en/login');
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

const typeText = async (selector: string, text: string) => {
  const input = await page.waitForSelector(selector);
  await input?.type(text);
  input?.dispose();
};

test('New Driver can Sign Up', async () => {
  const signupButton  = await page.waitForSelector(`::-p-text(Sign Up)`);
  await signupButton?.click();
  const signupGitHubButton  = await page.waitForSelector(`::-p-text(Sign Up With GitHub)`);
  await signupGitHubButton?.click();

  await typeText('input[name="login"]', 'coparkspace@gmail.com');
  await typeText('input[name="password"]', 'copark@123');
  const continueButton = await page.waitForSelector(`input[name="commit"]`);
  await continueButton?.click();
  await page.waitForNavigation();

  await click('::-p-text(I have read and agree to the Terms of Service)');
  await new Promise(res => setTimeout(res, 1000));
  await click('::-p-aria(submit-tos-button)');

  console.log('Waiting for the "Add First Vehicle" button to appear...');

  await click('::-p-text(Add First Vehicle)');

  await typeText('::-p-aria(Enter license plate number)', 'YAQUOB');

  await click('::-p-aria(Submit vehicle)');
  expect(await page.waitForSelector(`::-p-text(Available Permits)`)).toBeDefined();
}, 15000);

test('Driver can Login Successfully', async () => {
  const loginButton  = await page.waitForSelector(`::-p-text(Log In)`);
  await loginButton?.click();
  const GitHubButton  = await page.waitForSelector(`::-p-text(Sign In With GitHub)`);
  await GitHubButton?.click();

  await typeText('input[name="login"]', 'coparkspace@gmail.com');
  await typeText('input[name="password"]', 'copark@123');
  const continueButton = await page.waitForSelector(`input[name="commit"]`);
  await continueButton?.click();
  await page.waitForNavigation();
  expect(await page.waitForSelector(`::-p-text(Available Permits)`)).toBeDefined();
}, 10000);



