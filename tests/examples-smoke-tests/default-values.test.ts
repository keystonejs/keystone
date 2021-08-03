import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('default-values', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Load list', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("People")')]);
    await page.waitForSelector('button:has-text("Create Person")');
  });
  afterAll(async () => {
    await browser.close();
  });
});
