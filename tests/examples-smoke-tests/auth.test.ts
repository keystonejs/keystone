import fetch from 'node-fetch';
import { Browser, Page } from 'playwright';
import { exampleProjectTests, initFirstItemTest, loadIndex } from './utils';

exampleProjectTests('../examples-staging/auth', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  test('going to any page redirects to /init with a Cache-Control: no-cache, max-age=0 header', async () => {
    const res = await fetch('http://localhost:3000', { redirect: 'manual' });
    expect(res.status).toEqual(302);
    expect(res.headers.get('Cache-Control')).toEqual('no-cache, max-age=0');
  });
  initFirstItemTest(() => page);
  afterAll(async () => {
    await browser.close();
  });
});
