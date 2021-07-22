import { Browser, Page } from 'playwright';
import { exampleProjectTests, initFirstItemTest } from './utils';

exampleProjectTests('with-auth', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  initFirstItemTest(() => page);
  afterAll(async () => {
    await browser.close();
  });
});
