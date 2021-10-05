import { Browser, Page } from 'playwright';
import { adminUITests, deleteAllData, generateDataArray, makeGqlRequest } from './utils';

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Task List card should be visible', async () => {
    await page.waitForSelector('h3:has-text("Task")');
  });
  test('Clicking on the logo should return you to the Dashboard route', async () => {
    await page.goto('http://localhost:3000/tasks');
    await page.waitForSelector('h3 a:has-text("Keystone 6")');
    await Promise.all([
      page.waitForNavigation({
        url: 'http://localhost:3000',
      }),
      page.click('h3 a:has-text("Keystone 6")'),
    ]);
  });
  test('Should see a 404 on request of the /init route', async () => {
    await page.goto('http://localhost:3000/init');
    const content = await page.textContent('body h1');
    expect(content).toBe('404');
  });
  describe('List View', () => {
    beforeEach(async () => {
      const gql = String.raw;
      const query = gql`
        mutation Create_Tasks_Mutation($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `;
      const variables = {
        data: generateDataArray(
          (key: number) => ({ label: `Test Task: ${key}`, isComplete: false }),
          52
        ),
      };
      await makeGqlRequest(query, variables);
      await page.goto('http://localhost:3000/tasks?page=6&pageSize=10');
    });
    afterEach(async () => {
      await deleteAllData('./tests/test-projects/basic');
    });
    test('If all items are deleted from the last page, users should be redirected to the previous page if one exists', async () => {
      await page.waitForSelector('thead th:first-of-type label');
      await page.click('thead th:first-of-type label');
      await page.click('button:has-text("Delete")');
      await Promise.all([
        page.waitForNavigation({
          url: /localhost:3000\/tasks\?.*(page=5)/,
        }),
        page.click('div[role="dialog"] button:has-text("Delete")'),
      ]);
    });
    test('The page users are redirected to on complete deleletion of the last page, should have items', async () => {
      await page.waitForSelector('thead th:first-of-type label');
      await page.click('thead th:first-of-type label');
      await page.click('button:has-text("Delete")');
      await Promise.all([
        page.waitForNavigation({
          url: /localhost:3000\/tasks\?.*(page=5)/,
        }),
        page.click('div[role="dialog"] button:has-text("Delete")'),
      ]);
      await page.waitForSelector('table tbody');
      const elements = page.locator('table tbody tr');
      await expect(elements.evaluateAll((tr, min) => tr.length > min, 0)).resolves.toBe(true);
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
