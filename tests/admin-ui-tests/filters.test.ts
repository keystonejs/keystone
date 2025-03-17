import { type Browser, type Page, type BrowserContext } from 'playwright'
import { adminUITests, deleteAllData, generateDataArray, loadIndex, makeGqlRequest } from './utils'

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any
  let context: BrowserContext = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
  })

  describe('relationship filters', () => {
    beforeEach(async () => {
      context = await browser.newContext({
        recordVideo: {
          dir: 'videos/',
        },
      })
      page = await context.newPage()
      await loadIndex(page)
      await deleteAllData('./tests/test-projects/basic')
    })
    afterEach(async () => {
      await context.close()
    })
    test('Lists are filterable by relationships', async () => {
      const gql = String.raw
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
      `
      const CREATE_TASKS = gql`
        mutation CREATE_TASKS_MUTATION($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `
      const { assignedTask } = await makeGqlRequest(TASK_MUTATION_CREATE, {
        name: 'Task-assigned',
        assignedTo: 'James Joyce',
      })
      await makeGqlRequest(CREATE_TASKS, {
        data: generateDataArray(
          key => ({
            label: `Task-not-assigned-${key}`,
          }),
          20
        ),
      })
      await page.goto('http://localhost:3000/tasks')
      await page.getByText('21 Tasks').waitFor()
      // apply filter
      await page.getByRole('button', { name: 'Filter' }).click()
      await page.getByRole('menuitem', { name: 'Assigned To' }).click()
      await page.getByRole('button', { name: 'Is empty filter type' }).click()
      await page.getByRole('option', { name: 'Is', exact: true }).click()
      await page.getByLabel('Show suggestions').click()
      await page.getByRole('option', { name: 'James Joyce' }).click()
      await page.getByRole('button', { name: 'Add' }).click()
      await page.waitForURL(
        `http://localhost:3000/tasks?%21assignedTo_is="${assignedTask.assignedTo.id}"`
      )

      // Assert that there's only one result.
      await page.getByText('1 Task').waitFor()
    })

    test('Deeplinking a url with the appropriate relationship filter query params will apply the filter', async () => {
      const gql = String.raw
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
      `
      const CREATE_TASKS = gql`
        mutation CREATE_TASKS_MUTATION($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `
      const { assignedTask } = await makeGqlRequest(TASK_MUTATION_CREATE, {
        name: 'Task-assigned',
        assignedTo: 'James Joyce',
      })

      await makeGqlRequest(CREATE_TASKS, {
        data: generateDataArray(
          key => ({
            label: `Task-not-assigned-${key}`,
          }),
          20
        ),
      })
      await page.goto('http://localhost:3000/tasks')
      await page.getByText('21 Tasks').waitFor({ timeout: 10000 })
      await page.goto(`http://localhost:3000/tasks?!assignedTo_is="${assignedTask.assignedTo.id}"`)
      await page.getByText('1 Task').waitFor()
    })
  })

  afterAll(async () => {
    await browser.close()
  })
})
