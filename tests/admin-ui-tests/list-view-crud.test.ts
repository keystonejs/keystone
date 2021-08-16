import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';

adminUITests('./tests/test-projects/crud-notifications', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Complete deletion success', async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=-label&page=2'),
    ]);
    await page.waitForSelector('tbody tr:first-of-type td:first-of-type label');
    await page.click('tbody tr:first-of-type td:first-of-type label');
    await page.waitForSelector('button:has-text("Delete")');
    await page.click('button:has-text("Delete")');
    await page.click('div[role="dialog"] button:has-text("Delete")');
    await page.waitForSelector(
      'div[role="alert"] h3:has-text("Deleted 1 of 1 Tasks successfully")'
    );
  });
  test('Complete deletion failure', async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=-label&page=1'),
    ]);
    await page.click('tbody tr:first-of-type td:first-of-type label');
    await page.click('button:has-text("Delete")');
    await page.click('div[role="dialog"] button:has-text("Delete")');
    await page.waitForSelector('div[role="alert"] h3:has-text("Failed to delete 1 of 1 Tasks")');
  });
  // test('Partial deletion failure', async () => {});
  afterAll(async () => {
    await browser.close();
  });
});
