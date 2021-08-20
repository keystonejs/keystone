import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';

adminUITests('./tests/test-projects/crud-notifications', (browserType, deleteAllData) => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  let ids: any[] = [];
  const seedData = async (page: Page) => {
    await page.evaluate(async () => {
      const gql = String.raw;
      return fetch('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: gql`
            mutation CreateTaskItems($data: [TaskCreateInput!]!) {
              createTasks(data: $data) {
                id
                label
              }
            }
          `,
          variables: {
            data: Array.from(Array(75).keys()).map(key => {
              if (key >= 50) {
                return {
                  label: `delete me ${key - 50}`,
                };
              } else {
                return {
                  label: `do not delete ${key}`,
                };
              }
            }),
          },
        }),
      }).then(res => res.json());
    }, ids);
  };

  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  beforeEach(async () => {
    // add records
    try {
      await deleteAllData('./tests/test-projects/crud-notifications');
      await seedData(page);
    } catch (e) {
      console.log('beforeEach error', e.message);
    }
  });
  test('Complete deletion success, only shows the successful deletion prompt', async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=-label&page=2'),
    ]);
    await page.waitForSelector('tbody tr:first-of-type td:first-of-type label');
    await page.click('tbody tr:first-of-type td:first-of-type label');
    await page.waitForSelector('button:has-text("Delete")');
    await page.click('button:has-text("Delete")');
    await page.click('div[role="dialog"] button:has-text("Delete")');
    await page.waitForSelector(
      'div[role="alert"] h3:has-text("Deleted 1 of 1 Tasks successfully")'
    );
    const dialogs = await page.$$('div[role="alert"] > div');
    expect(dialogs.length).toBe(1);
  });
  test('Complete deletion failure, only shows the successful failure prompt', async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=-label&page=1'),
    ]);
    await page.click('tbody tr:first-of-type td:first-of-type label');
    await page.click('button:has-text("Delete")');
    await page.click('div[role="dialog"] button:has-text("Delete")');
    await page.waitForSelector('div[role="alert"] h3:has-text("Failed to delete 1 of 1 Tasks")');
    const dialogs = await page.$$('div[role="alert"] > div');
    expect(dialogs.length).toBe(1);
  });
  test('Partial deletion failure', async () => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=label&page=1'),
    ]);
    await page.click('thead th:first-of-type label');
    await page.click('button:has-text("Delete")');
    await page.click('div[role="dialog"] button:has-text("Delete")');
    await page.waitForSelector('div[role="alert"] h3:has-text("Failed to delete 25 of 50 Tasks")');
    await page.waitForSelector(
      'div[role="alert"] h3:has-text("Deleted 25 of 50 Tasks successfully")'
    );
    const dialogs = await page.$$('div[role="alert"] > div');
    expect(dialogs.length).toBe(2);
  });
  afterAll(async () => {
    await browser.close();
  });
});
