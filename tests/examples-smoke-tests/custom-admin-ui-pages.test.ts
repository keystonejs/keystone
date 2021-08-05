import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('custom-admin-ui-pages', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Load list', async () => {
    await page.goto('http://localhost:3000/custom-page');
    const content = await page.textContent('body h1');
    expect(content).toBe('This is a custom Admin UI page');
  });
  afterAll(async () => {
    await browser.close();
  });
});
