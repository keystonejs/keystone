import type { Browser, Page } from 'playwright'
import { expect } from 'playwright/test'
import { adminUITests } from './utils'

const gql = ([str]: TemplateStringsArray) => str

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
  })

  test('Creating related item does not submit main form', async () => {
    await page.goto('http://localhost:3000/tasks/create')
    await page.fill('label:has-text("Label")', 'Buy beer')
    await page.getByRole('button', { name: 'Actions for Assigned To' }).click()
    await page.getByText('Add person').click()
    await page.getByRole('textbox', { name: 'Name' }).fill('Geralt')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByRole('combobox', { name: 'Assigned To' })).toHaveValue('Geralt')
    expect(page.url()).toBe('http://localhost:3000/tasks/create')
  })

  test('selection is not removed when focusing and blurring relationship field', async () => {
    const result = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: gql`
          mutation ($people: [PersonCreateInput!]!) {
            createPeople(data: $people) {
              id
            }
            createTask(data: { label: "some task", assignedTo: { create: { name: "the user" } } }) {
              id
            }
          }
        `,
        variables: { people: Array.from({ length: 500 }, (_, i) => ({ name: `Person ${i}` })) },
      }),
    }).then(res => res.json())
    expect(result.errors).toBeUndefined()

    await page.goto(`http://localhost:3000/tasks/${result.data.createTask.id}`)
    await page.getByRole('combobox', { name: 'Assigned To' }).click()
    await page.getByRole('textbox', { name: 'Label' }).click()
    await expect(page.getByRole('combobox', { name: 'Assigned To' })).toHaveValue('the user')
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  afterAll(async () => {
    await browser.close()
  })
})
