import { type Browser, type Page } from 'playwright'
import fetch from 'node-fetch'
import { exampleProjectTests, loadIndex } from './utils'

exampleProjectTests('extend-express-app', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any
  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
    await loadIndex(page)
  })
  test('Load list', async () => {
    await Promise.all([page.waitForNavigation(), page.click('h3:has-text("Posts")')])
    await page.waitForSelector('a:has-text("Create Post")')
  })
  test('Get Posts', async () => {
    const tasks = await fetch('http://localhost:3000/rest/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())
    expect(tasks).toEqual([])
  })
  afterAll(async () => {
    await browser.close()
  })
})
