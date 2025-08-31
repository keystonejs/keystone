import type { Browser, Page } from 'playwright'
import { adminUITests, deleteAllData, generateDataArray, loadIndex, makeGqlRequest } from './utils'

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
    await loadIndex(page)
  })
  test('Task List card should be visible', async () => {
    await page.waitForSelector('h3:has-text("Task")')
  })
  test('Clicking on the logo should return you to the Dashboard route', async () => {
    await page.goto('http://localhost:3000/tasks')
    await page.waitForSelector('a:has-text("Keystone")')
    await page.click('a:has-text("Keystone")')
    await page.waitForURL('http://localhost:3000')
  })
  test('Should see a 404 on request of the /init route', async () => {
    await page.goto('http://localhost:3000/init')
    const content = await page.textContent('body h1')
    expect(content).toBe('404')
  })
  describe('List View', () => {
    beforeEach(async () => {
      await deleteAllData('./tests/test-projects/basic')
      const gql = String.raw
      const query = gql`
        mutation Create_Tasks_Mutation($data: [TaskCreateInput!]!) {
          createTasks(data: $data) {
            id
          }
        }
      `
      const variables = {
        data: generateDataArray(
          (key: number) => ({ label: `Test Task: ${key}`, isComplete: false }),
          52
        ),
      }
      await makeGqlRequest(query, variables)
      await page.goto('http://localhost:3000/tasks?page=6&pageSize=10&sortBy=label')
    })
    test('If all items are deleted from the last page, users should be redirected to the previous page if one exists', async () => {
      await page.getByRole('checkbox', { name: 'Select Test Task: 8' }).check()
      await page.getByRole('checkbox', { name: 'Select Test Task: 9' }).check()
      await page.click('button:has-text("Delete")')
      await page.getByRole('button', { name: 'Yes, delete' }).click()
      await page.waitForURL(/localhost:3000\/tasks\?.*(page=5)/)
    })
    test('The page users are redirected to on complete deletion of the last page, should have items', async () => {
      await page.getByRole('checkbox', { name: 'Select Test Task: 8' }).check()
      await page.getByRole('checkbox', { name: 'Select Test Task: 9' }).check()
      await page.click('button:has-text("Delete")')
      await page.getByRole('button', { name: 'Yes, delete' }).click()
      await page.waitForURL(/localhost:3000\/tasks\?.*(page=5)/)
      await page.getByText('Test Task: 45').waitFor()
    })
  })

  afterAll(async () => {
    await browser.close()
  })
  afterAll(async () => {
    await deleteAllData('./tests/test-projects/basic')
  })
})
