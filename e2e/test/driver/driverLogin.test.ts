import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Scenario 1
test('Driver Signup Flow', async ({ page }) => {
  await page.goto('http://localhost:3000/driver/en/login');

  await page.getByText('Sign Up').click();
  await page.getByText('Sign Up With GitHub').click();

  await page.fill('input[name="login"]', 'coparkspace@gmail.com');
  await page.fill('input[name="password"]', 'coparkspace@123');
  await page.locator('input[name="commit"]').click();

  await page.getByText('I have read and agree to the Terms of Service').waitFor();
  await page.getByText('I have read and agree to the Terms of Service').click();

  const continueButton = page.getByRole('button', { name: 'submit-tos-button' });
  await continueButton.waitFor({ state: 'visible' });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  const addBtn = page.getByRole('button', { name: 'add-vehicle-button' });
  await addBtn.waitFor({ state: 'visible' });
  await expect(addBtn).toBeEnabled();
  await addBtn.click();

  await page.getByPlaceholder('e.g. 1ABC123').fill('YAQUOB');
  await page.getByRole('button', { name: 'Submit vehicle' }).click();

  await expect(page.getByText('Available Permits')).toBeVisible();
});

test('Driver session from cookie then enforcement checks plate then driver pays for ticket', async ({ browser }) => {
  // === DRIVER COOKIE SESSION ===
  const driverContext = await browser.newContext();
  await driverContext.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQ29QYXJrU3BhY2UiLCJlbWFpbCI6ImNvcGFya3NwYWNlQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMjE0OTE5ODM5P3Y9NCIsInN1YiI6IjIxNDkxOTgzOSIsImlzcyI6ImdpdGh1YiIsImlhdCI6MTc0OTI2MDM3NCwiZXhwIjoxOTA3MDQ4Mzc0fQ.l00sZhAsNwnpxNp0THNmfx0v3Bf20sof1PTE1pI9WOo',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  // Expect session to be valid and dashboard to load
  await expect(driverPage.getByText('Active Permits')).not.toBeVisible();

  // === ENFORCEMENT LOGIN ===
  const enforcementContext = await browser.newContext();
  const enforcementPage = await enforcementContext.newPage();
  await enforcementPage.goto('http://localhost:3001/enforcement/login');

  await enforcementPage.getByLabel('Your Email').fill('babayaga@copark.com');
  await enforcementPage.getByLabel('Password').fill('password1');
  await enforcementPage.getByRole('button', { name: 'LOGIN' }).click();

  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  await enforcementPage.getByPlaceholder('ABC1234').fill('YAQUOB');
  await enforcementPage.getByLabel('Select State').click();
  await enforcementPage.getByRole('option', { name: 'California', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Search License Plate' }).click();
  await enforcementPage.getByRole('button', { name: 'Issue Citation' }).click();
  await enforcementPage.getByLabel('Reason').click();
  await enforcementPage.getByRole('option', { name: 'No Valid Permit', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Upload or Take Photo' }).click();
  const imagePath = path.resolve(__dirname, 'picture.png');

  await enforcementPage.locator('input[name="violationPhoto"]').setInputFiles(imagePath);

  await enforcementPage.getByRole('button', { name: 'Submit Violation' }).click();
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // === DRIVER PAYS TICKET ===
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('No Valid Permit')).toBeVisible();
  await driverPage.getByText('No Valid Permit').click();
  await expect(driverPage.getByText('Parking Violation')).toBeVisible();
  await driverPage.getByText('Pay Ticket').click();

  const stripeFrame = driverPage.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
  await stripeFrame.getByPlaceholder('MM / YY').fill('02/27');
  await stripeFrame.getByPlaceholder('CVC').fill('123');
  await stripeFrame.getByPlaceholder('Full name on card').fill('copark space');
  await stripeFrame.getByPlaceholder('ZIP').fill('95064');
  await stripeFrame.getByText('Pay').click();

  await expect(driverPage.getByText('Payment Confirmed')).toBeVisible();
  await driverPage.getByRole('button', { name: 'Continue to Dashboard' }).click();
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).toBeVisible();
});

// Senario 2
test('Driver login then enforcement checks plate then driver pays for ticket', async ({ browser }) => {
  // DRIVER
  const driverContext = await browser.newContext();
  await driverContext.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQ29QYXJrU3BhY2UiLCJlbWFpbCI6ImNvcGFya3NwYWNlQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMjE0OTE5ODM5P3Y9NCIsInN1YiI6IjIxNDkxOTgzOSIsImlzcyI6ImdpdGh1YiIsImlhdCI6MTc0OTI2MDM3NCwiZXhwIjoxOTA3MDQ4Mzc0fQ.l00sZhAsNwnpxNp0THNmfx0v3Bf20sof1PTE1pI9WOo',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  await expect(driverPage.getByText('Active Permits')).not.toBeVisible();

  // ENFORCEMENT
  const enforcementContext = await browser.newContext();
  const enforcementPage = await enforcementContext.newPage();
  await enforcementPage.goto('http://localhost:3001/enforcement/login');

  await enforcementPage.getByLabel('Your Email').fill('babayaga@copark.com');
  await enforcementPage.getByLabel('Password').fill('password1');
  await enforcementPage.getByRole('button', { name: 'LOGIN' }).click();

  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  await enforcementPage.getByPlaceholder('ABC1234').fill('YAQUOB');
  await enforcementPage.getByLabel('Select State').click();
  await enforcementPage.getByRole('option', { name: 'California', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Search License Plate' }).click();
  await enforcementPage.getByRole('button', { name: 'Issue Citation' }).click();
  await enforcementPage.getByLabel('Reason').click();
  await enforcementPage.getByRole('option', { name: 'No Valid Permit', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Submit Violation' }).click()
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // DRIVER
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).not.toBeVisible();
  await expect(driverPage.getByText('No Valid Permit')).toBeVisible();

  await driverPage.getByText('No Valid Permit').click();
  await expect(driverPage.getByText('Parking Violation')).toBeVisible();

  await driverPage.getByText('Pay Ticket').click();
  const stripeFrame = driverPage.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
  await stripeFrame.getByPlaceholder('MM / YY').fill('02/27');
  await stripeFrame.getByPlaceholder('CVC').fill('123');
  await stripeFrame.getByPlaceholder('Full name on card').fill('copark space');
  await stripeFrame.getByPlaceholder('ZIP').fill('95064');
  await stripeFrame.getByText('Pay').click();

  await expect(driverPage.getByText('Payment Confirmed')).toBeVisible();
  await driverPage.getByRole('button', { name: 'Continue to Dashboard' }).click();

  // Check if the ticket is no longer visible
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).toBeVisible();
});

// Senario 3
test('Driver login then enforcement checks plate then driver challengs ticket and admin aproves it', async ({ browser }) => {
  // DRIVER FLOW
  const driverContext = await browser.newContext();
  await driverContext.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQ29QYXJrU3BhY2UiLCJlbWFpbCI6ImNvcGFya3NwYWNlQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMjE0OTE5ODM5P3Y9NCIsInN1YiI6IjIxNDkxOTgzOSIsImlzcyI6ImdpdGh1YiIsImlhdCI6MTc0OTI2MDM3NCwiZXhwIjoxOTA3MDQ4Mzc0fQ.l00sZhAsNwnpxNp0THNmfx0v3Bf20sof1PTE1pI9WOo',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  await expect(driverPage.getByText('Active Permits')).not.toBeVisible();

  // ENFORCEMENT FLOW
  const enforcementContext = await browser.newContext();
  const enforcementPage = await enforcementContext.newPage();
  await enforcementPage.goto('http://localhost:3001/enforcement/login');

  await enforcementPage.getByLabel('Your Email').fill('babayaga@copark.com');
  await enforcementPage.getByLabel('Password').fill('password1');
  await enforcementPage.getByRole('button', { name: 'LOGIN' }).click();

  // Check enforcement dashboard loaded
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // Simulate license plate lookup
  await enforcementPage.getByPlaceholder('ABC1234').fill('YAQUOB');
  await enforcementPage.getByLabel('Select State').click();
  await enforcementPage.getByRole('option', { name: 'California', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Search License Plate' }).click();
  await enforcementPage.getByRole('button', { name: 'Issue Citation' }).click();
  await enforcementPage.getByLabel('Reason').click();
  await enforcementPage.getByRole('option', { name: 'No Valid Permit', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Submit Violation' }).click()
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // DRIVER FLOW
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  // Check if the driver sees the ticket
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).not.toBeVisible();
  await expect(driverPage.getByText('No Valid Permit')).toBeVisible();
  // Check if the driver sees the ticket details
  await driverPage.getByText('No Valid Permit').click();
  await expect(driverPage.getByText('Parking Violation')).toBeVisible();

  // Challenge the ticket
  await driverPage.getByText('Challenge Ticket').click();
  await driverPage.getByPlaceholder('Describe your challenge').fill('I have bought the permit 2 min later than my ticket, please forgive me.');
  await driverPage.getByRole('button', { name: 'Submit Challenge' }).click();
  await driverPage.getByText('Home').click();

  // ADMIN FLOW
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3002/admin/login');
  await adminPage.getByLabel('Your Email').fill('jxiong0822@outlook.com');
  await adminPage.getByLabel('Password').fill('password1');
  await adminPage.getByRole('button', { name: 'SIGN IN' }).click();
  await expect(adminPage.getByText('Statistics')).toBeVisible();
  await adminPage.getByText('Manage Tickets').click();
  await expect(adminPage.getByText('Fine: $50.00')).toBeVisible();
  await adminPage.getByText('No Valid Permit').click();
  await adminPage.getByText('ACCEPT CHALLENGE').click();
  await expect(adminPage.getByText('Challenge Accepted')).toBeVisible();
  await adminPage.getByText('ACCEPTED TICKETS').click();
  await expect(adminPage.getByText('ACCEPTED')).toBeVisible();

  // DRIVER FLOW
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  // Check if the driver sees the ticket
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('ACCEPTED.')).toBeVisible();
});

// Senario 4
test('Driver login then enforcement checks plate then driver challengs ticket and admin rejects it', async ({ browser }) => {
  // DRIVER FLOW
  const driverContext = await browser.newContext();
  await driverContext.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQ29QYXJrU3BhY2UiLCJlbWFpbCI6ImNvcGFya3NwYWNlQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMjE0OTE5ODM5P3Y9NCIsInN1YiI6IjIxNDkxOTgzOSIsImlzcyI6ImdpdGh1YiIsImlhdCI6MTc0OTI2MDM3NCwiZXhwIjoxOTA3MDQ4Mzc0fQ.l00sZhAsNwnpxNp0THNmfx0v3Bf20sof1PTE1pI9WOo',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  await expect(driverPage.getByText('Active Permits')).not.toBeVisible();

  // ENFORCEMENT FLOW
  const enforcementContext = await browser.newContext();
  const enforcementPage = await enforcementContext.newPage();
  await enforcementPage.goto('http://localhost:3001/enforcement/login');

  await enforcementPage.getByLabel('Your Email').fill('babayaga@copark.com');
  await enforcementPage.getByLabel('Password').fill('password1');
  await enforcementPage.getByRole('button', { name: 'LOGIN' }).click();

  // Check enforcement dashboard loaded
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // Simulate license plate lookup
  await enforcementPage.getByPlaceholder('ABC1234').fill('YAQUOB');
  await enforcementPage.getByLabel('Select State').click();
  await enforcementPage.getByRole('option', { name: 'California', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Search License Plate' }).click();
  await enforcementPage.getByRole('button', { name: 'Issue Citation' }).click();
  await enforcementPage.getByLabel('Reason').click();
  await enforcementPage.getByRole('option', { name: 'No Valid Permit', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Submit Violation' }).click()
  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();

  // DRIVER FLOW
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  // Check if the driver sees the ticket
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).not.toBeVisible();
  await expect(driverPage.getByText('No Valid Permit')).toBeVisible();
  // Check if the driver sees the ticket details
  await driverPage.getByText('No Valid Permit').click();
  await expect(driverPage.getByText('Parking Violation')).toBeVisible();

  // Challenge the ticket
  await driverPage.getByText('Challenge Ticket').click();
  await driverPage.getByPlaceholder('Describe your challenge').fill('I have bought the permit 2 min later than my ticket, please forgive me.');
  await driverPage.getByRole('button', { name: 'Submit Challenge' }).click();
  await driverPage.getByText('Home').click();

  // ADMIN FLOW
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3002/admin/login');
  await adminPage.getByLabel('Your Email').fill('jxiong0822@outlook.com');
  await adminPage.getByLabel('Password').fill('password1');
  await adminPage.getByRole('button', { name: 'SIGN IN' }).click();
  await expect(adminPage.getByText('Statistics')).toBeVisible();
  await adminPage.getByText('Manage Tickets').click();
  await expect(adminPage.getByText('Fine: $50.00')).toBeVisible();
  await adminPage.getByText('No Valid Permit').click();
  await adminPage.getByText('REJECT CHALLENGE').click();

  // DRIVER FLOW
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');

  // Check if the driver sees the ticket
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('UNPAID.')).toBeVisible();
    await expect(driverPage.getByText('No Valid Permit')).toBeVisible();
  await driverPage.getByText('No Valid Permit').click();
  await expect(driverPage.getByText('Parking Violation')).toBeVisible();
  await driverPage.getByText('Pay Ticket').click();

  const stripeFrame = driverPage.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
  await stripeFrame.getByPlaceholder('MM / YY').fill('02/27');
  await stripeFrame.getByPlaceholder('CVC').fill('123');
  await stripeFrame.getByPlaceholder('Full name on card').fill('copark space');
  await stripeFrame.getByPlaceholder('ZIP').fill('95064');
  await stripeFrame.getByText('Pay').click();

  await expect(driverPage.getByText('Payment Confirmed')).toBeVisible();
  await driverPage.getByRole('button', { name: 'Continue to Dashboard' }).click();
  await driverPage.getByText('Tickets').click();
  await expect(driverPage.getByText('You have no tickets at this time.')).toBeVisible();
});

// Scenario 5
test('Driver login pays for permit then enforcer logs in and sees the permit', async ({ page, browser }) => {
  const driverContext = await browser.newContext();
  await driverContext.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQ29QYXJrU3BhY2UiLCJlbWFpbCI6ImNvcGFya3NwYWNlQGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMjE0OTE5ODM5P3Y9NCIsInN1YiI6IjIxNDkxOTgzOSIsImlzcyI6ImdpdGh1YiIsImlhdCI6MTc0OTI2MDM3NCwiZXhwIjoxOTA3MDQ4Mzc0fQ.l00sZhAsNwnpxNp0THNmfx0v3Bf20sof1PTE1pI9WOo',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  const driverPage = await driverContext.newPage();
  await driverPage.goto('http://localhost:3000/driver/en/dashboard');
  // Wait for navigation to complete
  await expect(page.getByText('Active Permits')).not.toBeVisible();

  await page.getByText('Daily').click();
  await page.getByText('All Lots Access - $15').click();

  // Purchase Permit
  await page.getByText('Purchase Permit').click();

  const frames = page.frames();

  for (const frame of page.frames()) {
    console.log(`Frame: ${frame.name()} — URL: ${frame.url()}`);
  }

  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.getByRole('button', { name: 'Pay with card' }).click();
  await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
  await stripeFrame.getByPlaceholder('MM / YY').fill('02/27');
  await stripeFrame.getByPlaceholder('CVC').fill('123');
  await stripeFrame.getByPlaceholder('Full name on card').fill('copark space');
  await stripeFrame.getByPlaceholder('ZIP').fill('95064');
  await stripeFrame.getByText('Pay').click();
 
  // Wait for confirmation
  await expect(page.getByText('Payment Confirmed')).toBeVisible();

  await page.getByRole('button', { name: 'Continue to Dashboard' }).click();

  await expect(page.getByText('Active Permits')).toBeVisible();
  await expect(page.getByText('Daily All Lots Access')).toBeVisible();

  // ENFORCEMENT
  const enforcementContext = await browser.newContext();
  const enforcementPage = await enforcementContext.newPage();
  await enforcementPage.goto('http://localhost:3001/enforcement/login');

  await enforcementPage.getByLabel('Your Email').fill('babayaga@copark.com');
  await enforcementPage.getByLabel('Password').fill('password1');
  await enforcementPage.getByRole('button', { name: 'LOGIN' }).click();


  await expect(enforcementPage.getByText('Manual License Plate Entry')).toBeVisible();


  await enforcementPage.getByPlaceholder('ABC1234').fill('YAQUOB');
  await enforcementPage.getByLabel('Select State').click();
  await enforcementPage.getByRole('option', { name: 'California', exact: true }).click();
  await enforcementPage.getByRole('button', { name: 'Search License Plate' }).click();
  await expect(enforcementPage.getByText('Permit Found')).toBeVisible();
});
