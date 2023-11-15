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
    await Promise.all([page.waitForNavigation(), page.goto('http://localhost:3000/tasks')])
    await page.waitForSelector('tbody tr:first-of-type td:first-of-type label')
    await page.click('tbody tr:first-of-type td:first-of-type label')
    await page.waitForSelector('button:has-text("Delete")')
    await page.click('button:has-text("Delete")')
    await page.click('div[role="dialog"] button:has-text("Delete")')
    await page.waitForSelector(
      'div[role="alert"] h3:has-text("Deleted 1 of 1 Tasks successfully")'
    )
    const dialogs = await page.$$('div[role="alert"] > div')
    expect(dialogs.length).toBe(1)
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
    await Promise.all([page.waitForNavigation(), page.goto('http://localhost:3000/tasks')])
    await page.click('tbody tr:first-of-type td:first-of-type label')
    await page.click('button:has-text("Delete")')
    await page.click('div[role="dialog"] button:has-text("Delete")')
    await page.waitForSelector('div[role="alert"] h3:has-text("Failed to delete 1 of 1 Tasks")')
    const dialogs = await page.$$('div[role="alert"] > div')
    expect(dialogs.length).toBe(1)
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
    await Promise.all([
      page.waitForNavigation(),
      page.goto('http://localhost:3000/tasks?sortBy=label&page=1'),
    ])
    await page.click('thead th:first-of-type label')
    await page.click('button:has-text("Delete")')
    await page.click('div[role="dialog"] button:has-text("Delete")')
    await page.waitForSelector('div[role="alert"] h3:has-text("Failed to delete 25 of 50 Tasks")')
    await page.waitForSelector(
      'div[role="alert"] h3:has-text("Deleted 25 of 50 Tasks successfully")'
    )
    const dialogs = await page.$$('div[role="alert"] > div')
    expect(dialogs.length).toBe(2)
  })
  afterAll(async () => {
    await browser.close()
  })
})
