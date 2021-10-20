import { Browser, Page } from 'playwright';
import { exampleProjectTests, initFirstItemTest, loadIndex } from './utils';

exampleProjectTests('../examples-staging/roles', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  initFirstItemTest(() => page);
  afterAll(async () => {
    await browser.close();
  });
});
