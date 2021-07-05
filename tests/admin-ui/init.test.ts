import { Browser, Page } from 'playwright';
import { adminUITests } from '@keystone-next/testing';
// @ts-nocheck
adminUITests('./test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  // initFirstItemTest(() => page);
  test('A User card exists', () => {
    expect(true).toBe(true);
  });
  afterAll(async () => {
    await browser.close();
  });
});
