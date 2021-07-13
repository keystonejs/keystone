import { Browser, Page } from 'playwright';
import { exampleProjectTests } from './utils';

exampleProjectTests('custom-admin-ui-logo', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Load list', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.textContent('h3 a');
    expect(content).toBe('LegendBoulder After');
  });
  afterAll(async () => {
    await browser.close();
  });
});
