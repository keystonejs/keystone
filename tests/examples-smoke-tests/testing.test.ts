import type { Browser, Page } from 'playwright'
import { exampleProjectTests, initialUserTest, loadIndex } from './utils'

exampleProjectTests(
  'testing',
  (browserType, _mode, getInitialUser) => {
    let browser: Browser = undefined as any
    let page: Page = undefined as any
    beforeAll(async () => {
      browser = await browserType.launch()
      page = await browser.newPage()
      await loadIndex(page)
    })
    initialUserTest(() => page, getInitialUser)
    afterAll(async () => {
      await browser.close()
    })
  },
  { waitForInitialUser: true }
)
