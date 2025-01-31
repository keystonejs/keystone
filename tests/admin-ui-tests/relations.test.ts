import { type Browser, type Page } from 'playwright'
import { expect } from 'playwright/test'
import { adminUITests } from './utils'

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

  afterAll(async () => {
    await browser.close()
  })
})
