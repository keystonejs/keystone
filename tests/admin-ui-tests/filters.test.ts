import { Browser, Page, BrowserContext } from 'playwright';
import { adminUITests, deleteAllData, generateDataArray, loadIndex, makeGqlRequest } from './utils';

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  let context: BrowserContext = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch();
    context = await browser.newContext();
    page = await browser.newPage();
    await loadIndex(page);
  });

  describe('relationship filters', () => {
    afterEach(async () => {
      await context.clearCookies();
      await page.evaluate(() => {
        window.localStorage.clear();
      });
      await deleteAllData('./tests/test-projects/basic');
    });
    test('Lists are filterable by relationships', async () => {
      const gql = String.raw;
      const TASK_MUTATION_CREATE = gql`
        mutation TASK_MUTATION_CREATE($name: String!, $assignedTo: String!) {
          assignedTask: createTask(
            data: { label: $name, assignedTo: { create: { name: $assignedTo } } }
          ) {
            id
            assignedTo {
              id
              name
            }
          }
        }
      `;
      const CREATE_TASKS = gql`
        mutation CREATE_TASKS_MUTATION($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `;
      const { assignedTask } = await makeGqlRequest(TASK_MUTATION_CREATE, {
        name: 'Task-assigned',
        assignedTo: 'James Joyce',
      });
      await makeGqlRequest(CREATE_TASKS, {
        data: generateDataArray(
          key => ({
            label: `Task-not-assigned-${key}`,
          }),
          20
        ),
      });
      await page.goto('http://localhost:3000/tasks');
      await page.waitForSelector('table tbody tr');
      const elements = await page.$$('table tbody tr');
      expect(elements.length).toBe(21);
      // apply filter
      await page.click('button[aria-haspopup=true]:has-text("Filter List")');
      await page.click('div div div div div div div:has-text("Assigned To")');
      await page.click('div div div div div:has-text("Select...")');
      await page.click('div div div div div:has-text("James Joyce")');
      await Promise.all([
        page.waitForNavigation({
          url: `http://localhost:3000/tasks?%21assignedTo_matches="${assignedTask.assignedTo.id}"`,
        }),
        page.click('button[type="submit"]:has-text("Apply")'),
      ]);

      // Assert that there's only one result.
      await page.waitForSelector('table tbody tr');
      const filteredElements = await page.$$('table tbody tr');
      expect(filteredElements.length).toBe(1);
    });

    test('Deeplinking a url with the appropriate relationship filter query params will apply the filter', async () => {
      const gql = String.raw;
      const TASK_MUTATION_CREATE = gql`
        mutation TASK_MUTATION_CREATE($name: String!, $assignedTo: String!) {
          assignedTask: createTask(
            data: { label: $name, assignedTo: { create: { name: $assignedTo } } }
          ) {
            id
            assignedTo {
              id
              name
            }
          }
        }
      `;
      const CREATE_TASKS = gql`
        mutation CREATE_TASKS_MUTATION($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `;
      const { assignedTask } = await makeGqlRequest(TASK_MUTATION_CREATE, {
        name: 'Task-assigned',
        assignedTo: 'James Joyce',
      });

      await makeGqlRequest(CREATE_TASKS, {
        data: generateDataArray(
          key => ({
            label: `Task-not-assigned-${key}`,
          }),
          20
        ),
      });

      await page.goto('http://localhost:3000/tasks');
      await page.waitForSelector('table tbody tr');
      const elements = await page.$$('table tbody tr');
      expect(elements.length).toBe(21);

      await page.goto(
        `http://localhost:3000/tasks?!assignedTo_matches="${assignedTask.assignedTo.id}"`
      );

      await page.waitForSelector('table tbody tr');
      const filteredElements = await page.$$('table tbody tr');
      expect(filteredElements.length).toBe(1);
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
