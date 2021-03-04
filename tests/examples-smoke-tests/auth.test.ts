import { Browser, Page } from 'playwright';
import { exampleProjectTests, initUserTest } from './utils';

exampleProjectTests('auth', browserType => {
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
