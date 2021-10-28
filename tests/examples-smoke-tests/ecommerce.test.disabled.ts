import { Browser, Page } from 'playwright';
import { exampleProjectTests, initFirstItemTest, loadIndex } from './utils';

// this is disabled currently because it's currently failing and we want to get the tests in without being blocked on this

exampleProjectTests('ecommerce', browserType => {
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
