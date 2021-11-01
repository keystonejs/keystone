import { Browser, Page } from 'playwright';
import { exampleProjectTests, loadIndex } from './utils';

exampleProjectTests('custom-admin-ui-logo', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  test('Find custom logo', async () => {
    const content = await page.textContent('h3 a');
    expect(content).toBe('LegendBoulder After');
  });
  afterAll(async () => {
    await browser.close();
  });
});
