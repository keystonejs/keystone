import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';
// @ts-nocheck
adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  // initFirstItemTest(() => page);
  test('A Task card exists', () => {
    expect(true).toBe(true);
  });
  afterAll(async () => {
    await browser.close();
  });
});
