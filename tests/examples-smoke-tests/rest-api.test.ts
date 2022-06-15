import { Browser, Page } from 'playwright';
import fetch from 'node-fetch';
import { exampleProjectTests, loadIndex } from './utils';

exampleProjectTests('rest-api', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  test('Load list', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("People")')]);
    await page.waitForSelector('button:has-text("Create Person")');
  });
  test('Get Tasks', async () => {
    const tasks = await fetch('http://localhost:3000/rest/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
    expect(tasks).toEqual([]);
  });
  afterAll(async () => {
    await browser.close();
  });
});
