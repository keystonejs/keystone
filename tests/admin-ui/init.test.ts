import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  // initFirstItemTest(() => page);
  test('Should see a 404 on request of the /init route', async () => {
    await page.goto('http://localhost:3000/init');
    const content = await page.textContent('body h1');
    expect(content).toBe('404');
  });
  test('Should see a 404 on request of the /signin route', async () => {
    await page.goto('http://localhost:3000/signin');
    const content = await page.textContent('body h1');
    expect(content).toBe('404');
  });
  afterAll(async () => {
    await browser.close();
  });
});
