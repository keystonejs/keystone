import { Browser, Page } from 'playwright';
import { exampleProjectTests, initFirstItemTest } from './utils';

exampleProjectTests('todo', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    page.goto('http://localhost:3000');
  });
  initFirstItemTest(() => page);
  afterAll(async () => {
    await browser.close();
  });
});
