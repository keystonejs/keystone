import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('custom-admin-ui-navigation', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Contains a Navigation Guide link', async () => {
    await page.click('nav a:has-text("Naigation Guide")');
    await page.waitForURL('https://keystonejs.com');
  });
  afterAll(async () => {
    await browser.close();
  });
});
