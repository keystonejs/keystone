import { type Browser, type Page } from 'playwright'

import { makeGqlRequest, adminUITests, deleteAllData } from './utils'

adminUITests('./tests/test-projects/crud-notifications', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
  })
  beforeEach(async () => {
    // Drop the database
    await deleteAllData('./tests/test-projects/crud-notifications')
  })

  test('Complete deletion success, only shows the successful deletion prompt', async () => {
    // hack for gql syntax highlighting
    const gql = String.raw
    const query = gql`
      mutation CreateTaskItem {
        createTask(data: { label: "you can delete me" }) {
          id
          label
        }
      }
    `
    await makeGqlRequest(query)
    await page.goto('http://localhost:3000/tasks')
    await page.getByRole('checkbox', { name: 'Select you can delete me' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    const alertDialog = page.locator('[role=alertdialog][aria-modal=false]')
    await alertDialog.waitFor()
    expect(await alertDialog.innerText()).toBe('Deleted 1 item.')
  })

  test('Complete deletion failure, only shows the successful failure prompt', async () => {
    // hack for gql syntax highlighting
    const gql = String.raw
    const query = gql`
      mutation CreateTaskItem {
        createTask(data: { label: "do not delete" }) {
          id
          label
        }
      }
    `
    await makeGqlRequest(query)
    await page.goto('http://localhost:3000/tasks')
    await page.getByRole('checkbox', { name: 'Select do not delete' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    const alertDialog = page.locator('[role=alertdialog][aria-modal=false]')
    await alertDialog.waitFor()
    expect(await alertDialog.innerText()).toBe('Unable to delete 1 item.')
  })

  test('Partial deletion failure', async () => {
    // hack for gql syntax highlighting
    const gql = String.raw
    const query = gql`
      mutation CreateTaskItems($data: [TaskCreateInput!]!) {
        createTasks(data: $data) {
          id
          label
        }
      }
    `
    const variables = {
      data: Array.from(Array(75).keys()).map(key => {
        if (key >= 50) {
          return {
            label: `delete me ${key - 50}`,
          }
        } else {
          return {
            label: `do not delete ${key}`,
          }
        }
      }),
    }
    await makeGqlRequest(query, variables)
    await page.goto('http://localhost:3000/tasks?sortBy=label&page=1')
    await page.getByRole('checkbox', { name: 'Select All' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    const alertDialog = page.locator('[role=alertdialog][aria-modal=false]')
    await alertDialog.waitFor()
    expect(await alertDialog.innerText()).toBe('Unable to delete 25 items.')
    await alertDialog.getByRole('button', { name: 'Close' }).click()
    await page.locator('[role=alertdialog][aria-modal=false]:has-text("Deleted 25 items.")').waitFor()
  })
  afterAll(async () => {
    await browser.close()
  })
})
