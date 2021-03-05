import { Browser, Page } from 'playwright';
import { exampleProjectTests, initUserTest } from './utils';

// this is disabled currently because it's currently failing and we want to get the tests in without being blocked on this

exampleProjectTests('ecommerce', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    page.goto('http://localhost:3000');
  });
  initUserTest(() => page);
  afterAll(async () => {
    await browser.close();
  });
});
