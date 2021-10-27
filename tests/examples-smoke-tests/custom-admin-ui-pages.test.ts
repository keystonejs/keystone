import { Browser, Page } from 'playwright';
import { exampleProjectTests, loadIndex } from './utils';

exampleProjectTests('custom-admin-ui-pages', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  test('Load list', async () => {
    await page.goto('http://localhost:3000/custom-page');
    await page.waitForSelector('main h1:has-text("This is a custom Admin UI page")');
  });
  afterAll(async () => {
    await browser.close();
  });
});
