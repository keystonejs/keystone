import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
  });

  test('Creating relation items using the inline drawer does not submit main form', async () => {
    await page.goto('http://localhost:3000/tasks/create');
    await page.fill('label:has-text("Label")', 'Buy beer');
    await page.click('button:has-text("Create related Person")');
    await page.waitForSelector('h1:has-text("Create Person")');
    await page.fill('label:has-text("Name")', 'Geralt');
    await page.click('button:has-text("Create Person")');
    await page.waitForSelector('legend:has-text("Assigned To") ~ div:has-text("Geralt")');
    expect(page.url()).toBe('http://localhost:3000/tasks/create');
  });

  test('Creating/Editing relation items using the inline card does not submit main form', async () => {
    await page.goto('http://localhost:3000/cats/create');
    await page.fill('name:has-text("Name")', 'Whiskers');
    await page.click('button:has-text("Create related Person")');
    await page.waitForSelector('h1:has-text("Create Person")');
    await page.fill('label:has-text("Name")', 'Geralt');
    await page.click('button:has-text("Create Person")');

    expect(page.url()).toBe('http://localhost:3000/cats/create');

    await page.click('button:has-text("Edit")');
    await page.fill('label:has-text("Name")', 'John');
    await page.click('button:has-text("Save")');

    expect(page.url()).toBe('http://localhost:3000/cats/create');
  });

  afterAll(async () => {
    await browser.close();
  });
});
