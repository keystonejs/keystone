import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('custom-admin-ui-navigation', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Contains a Navigation Guide link', async () => {
    const customNavItem = await page.$('text="Keystone Docs"');
    console.log(customNavItem);
  });
  afterAll(async () => {
    await browser.close();
  });
});
