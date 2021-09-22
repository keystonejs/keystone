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
  describe('relationship filters', () => {
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
        mutation CREATE_TASKS_MUTATION($data) {
            createTasks(data: $data) {
                id
            }
        }
      `;
      await makeGqlRequest(TASK_MUTATION_CREATE, {
        $name: 'Task-assigned',
        $assignedTo: 'James Joyce',
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
    });
    test('One way relationships can only be filterable by the List with the relationship declared', async () => {});
  });

  afterAll(async () => {
    await browser.close();
  });
});
