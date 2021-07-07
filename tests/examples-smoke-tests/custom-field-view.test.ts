import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('custom-field-view', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Load list', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("Authors")')]);
    await page.waitForSelector('button:has-text("Create Author")');
  });
  afterAll(async () => {
    await browser.close();
  });
});
