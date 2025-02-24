import { type Browser, type Page } from 'playwright'
import { exampleProjectTests, loadIndex } from './utils'
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
  test('Field group is rendered exactly once', async () => {
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
    await page.goto(`http://localhost:3000/posts/${id}`)
    await expect(page.getByText('Some automatically updated meta fields')).toHaveCount(1)
  })
  afterAll(async () => {
    await browser.close()
  })
})
