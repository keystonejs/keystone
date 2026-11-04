import { afterAll, beforeAll, test } from 'vitest'
import type { Browser, Page } from 'playwright'
import { exampleProjectTests, loadIndex } from './utils.ts'
import { expect } from 'playwright/test'

const gql = ([str]: TemplateStringsArray) => str

exampleProjectTests('field-groups', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any
  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
    await loadIndex(page)
  })
  test('Groups respect defaultOpen and manual toggles in create and item views', async () => {
    const res = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: gql`
          mutation {
            createPost(data: { title: "Hello World" }) {
              id
            }
          }
        `,
      }),
    }).then(res => res.json())
    const id = res.data.createPost.id
    for (const url of ['/posts/create', `/posts/${id}`]) {
      await page.goto(`http://localhost:3000${url}`)
      await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Group state test')
      const contentGroup = page
        .getByRole('group', { name: 'Content', exact: true })
        .and(page.locator('details'))
      const contentSummary = contentGroup.locator('summary').getByText('Content', { exact: true })
      await expect(contentGroup).toHaveJSProperty('open', false)
      await contentSummary.click()
      await expect(contentGroup).toHaveJSProperty('open', true)
      await contentGroup.getByRole('checkbox', { name: 'Set to null' }).uncheck()
      await page.getByRole('textbox', { name: 'Content', exact: true }).fill('Some content')
      await expect(contentGroup).toHaveJSProperty('open', true)
      await contentSummary.click()
      await expect(contentGroup).toHaveJSProperty('open', false)
      await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Updated title')
      await expect(contentGroup).toHaveJSProperty('open', false)

      if (url === '/posts/create') continue
      await expect(page.getByText('Some automatically updated meta fields')).toHaveCount(1)
      const metaGroup = page.getByRole('group', { name: 'Meta', exact: true })
      await expect(metaGroup).toHaveJSProperty('open', true)
      await metaGroup.locator('summary').getByText('Meta', { exact: true }).click()
      await expect(metaGroup).toHaveJSProperty('open', false)
      await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Another title')
      await expect(metaGroup).toHaveJSProperty('open', false)
      await metaGroup.locator('summary').press('Space')
      await expect(metaGroup).toHaveJSProperty('open', true)
    }
  })
  afterAll(async () => {
    await browser.close()
  })
})
