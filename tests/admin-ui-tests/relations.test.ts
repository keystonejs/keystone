import { type Browser, type Page } from 'playwright'
import { adminUITests } from './utils'

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
  })

  test('Creating relation items inline does not submit main form', async () => {
    await page.goto('http://localhost:3000/tasks/create')
    await page.fill('label:has-text("Label")', 'Buy beer')
    await page.click('button:has-text("Create related Person")')
    await page.waitForSelector('h1:has-text("Create Person")')
    await page.fill('label:has-text("Name")', 'Geralt')
    await page.click('button:has-text("Create Person")')
    await page.waitForSelector('legend:has-text("Assigned To") ~ div:has-text("Geralt")')
    expect(page.url()).toBe('http://localhost:3000/tasks/create')
  })

  afterAll(async () => {
    await browser.close()
  })
})
