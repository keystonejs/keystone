import { afterAll, beforeAll, expect, test } from 'vitest'
import type { Browser, Page } from 'playwright'

import { exampleProjectTests } from './utils.ts'

exampleProjectTests(
  'framework-nextjs-pages-directory',
  (browserType, mode) => {
    let browser: Browser = undefined as any
    let page: Page = undefined as any

    beforeAll(async () => {
      browser = await browserType.launch()
      page = await browser.newPage()
      await page.goto('http://localhost:3000/admin')
      await page
        .getByRole('navigation', { name: 'main' })
        .getByRole('link', { name: 'Users', exact: true })
        .waitFor()
    })

    test('applies the base path to anchors and client-side navigation', async () => {
      const link = page
        .getByRole('navigation', { name: 'main' })
        .getByRole('link', { name: 'Users', exact: true })
      expect(await link.getAttribute('href')).toBe('/admin/users')

      await link.click()

      await page.waitForURL('http://localhost:3000/admin/users')
      await page.getByRole('heading', { name: 'Users' }).waitFor()
    })

    if (mode === 'dev') {
      test('does not apply the Admin UI base path to the API explorer', async () => {
        await page.goto('http://localhost:3000/admin')
        await page.getByRole('button', { name: 'Developer resources' }).press('Enter')

        const link = page.getByRole('menuitem', { name: 'API explorer' })
        expect(await link.getAttribute('href')).toBe('/api/graphql')
      })
    }

    afterAll(async () => {
      await browser.close()
    })
  },
  { buildScript: 'keystone:build' }
)
