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
  test('Custom field view "Related Links" is visible', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("Tasks")')]);
    await Promise.all([page.waitForSelector('button:has-text("Create Task")'), page.click('button:has-text("Create Task")')]);
    await page.waitForSelector('label:has-text("Related Links")');
  });
  afterAll(async () => {
    await browser.close();
  });
});
