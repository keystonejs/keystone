import { afterAll, beforeAll, expect, test } from 'vitest'
import type { Browser, Page } from 'playwright'
import { exampleProjectTests, initialUserTest, loadIndex } from './utils'

exampleProjectTests(
  '../examples/auth',
  (browserType, _mode, getInitialUser) => {
    let browser: Browser = undefined as any
    let page: Page = undefined as any
    beforeAll(async () => {
      browser = await browserType.launch()
      page = await browser.newPage()
      await loadIndex(page)
    })
    test('going to any page redirects to /signin with a Cache-Control: no-cache, max-age=0 header', async () => {
      const res = await fetch('http://localhost:3000', { redirect: 'manual' })
      expect(res.status).toEqual(302)
      expect(res.headers.get('Location')).toEqual('/signin')
      expect(res.headers.get('Cache-Control')).toEqual('no-cache, max-age=0')

      const resWithAutoRedirect = await fetch('http://localhost:3000')
      expect(resWithAutoRedirect.status).toEqual(200)
      expect(resWithAutoRedirect.url).toEqual('http://localhost:3000/signin')
    })
    initialUserTest(() => page, getInitialUser)
    afterAll(async () => {
      await browser.close()
    })
  },
  { waitForInitialUser: true }
)
