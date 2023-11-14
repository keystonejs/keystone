import { type Browser, type Page } from 'playwright'
import { exampleProjectTests, loadIndex } from './utils'

exampleProjectTests('usecase-blog', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any
  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
    await loadIndex(page)
  })
  test('Load list', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("Authors")')])
    await page.waitForSelector('a:has-text("Create Author")')
  })
  afterAll(async () => {
    await browser.close()
  })
})
