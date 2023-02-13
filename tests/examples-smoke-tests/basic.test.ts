import { Browser, Page } from 'playwright';
import fetch from 'node-fetch';
import { exampleProjectTests, initFirstItemTest, loadIndex } from './utils';

exampleProjectTests('../examples/basic', (browserType, mode) => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });

  initFirstItemTest(() => page);

  test('sign out and sign in', async () => {
    if (mode === 'dev') {
      await page.click('[aria-label="Links and signout"]');
    }
    await page.click('button:has-text("Sign out")');
    await page.fill('[placeholder="email"]', 'admin@keystonejs.com');
    await page.fill('[placeholder="password"]', 'password');
    await page.click('button:has-text("Sign in")');
  });

  test('update user', async () => {
    try {
      await page.goto('http://localhost:3000/users');
    } catch {
      await page.goto('http://localhost:3000/users');
    }
    await page.click('a:has-text("Admin")');
    await page.fill('label:has-text("Name") >> .. >> input', 'Admin2');
    await page.click('button:has-text("Save changes")');
    await page.waitForSelector('text=No changes');
  });

  test('can query users', async () => {
    const usersResponse = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: `
          query {
            users {
              id
              name
            }
          }
        `,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
    expect(usersResponse).toEqual({
      data: {
        users: [{ id: expect.stringMatching(/\d+/), name: 'Admin2' }],
      },
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
