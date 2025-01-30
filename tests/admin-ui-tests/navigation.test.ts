import { type Browser, type Page } from 'playwright'
import { adminUITests, loadIndex, makeGqlRequest } from './utils'

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any
  let page: Page = undefined as any

  beforeAll(async () => {
    browser = await browserType.launch()
    page = await browser.newPage()
    await loadIndex(page)
  })
  test('Nav contains a Dashboard route by default', async () => {
    await page.locator('nav a:has-text("Dashboard")').waitFor()
  })
  test('When at the index, the Dashboard NavItem is selected', async () => {
    await page.locator('nav a:has-text("Dashboard")[aria-current="page"]').waitFor()
  })
  test('When navigated to a List route, the representative list NavItem is selected', async () => {
    await page.goto('http://localhost:3000/tasks')
    await page.getByRole('heading', { name: 'Tasks' }).waitFor()
    await page.locator('nav a:has-text("Tasks")[aria-current="page"]').waitFor()
  })
  test('Can access all list pages via the navigation', async () => {
    await page.goto('http://localhost:3000')
    await page.click('nav a:has-text("Tasks")')
    await page.waitForURL('http://localhost:3000/tasks')
    await page.click('nav a:has-text("People")')
    await page.waitForURL('http://localhost:3000/people')
  })
  test('Can not access hidden lists via the navigation', async () => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('nav')
    const navItems = await page.locator('nav li a').all()
    const navLinks = await Promise.all(
      navItems.map(navItem => {
        return navItem.getAttribute('href')
      })
    )
    expect(navLinks.length).toBe(3)
    expect(navLinks.includes('/secretplans')).toBe(false)
  })
  test('When navigated to an Item view, the representative list NavItem is selected', async () => {
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: 'add' }).first().click()
    await page.getByRole('textbox', { name: 'Label' }).fill('Test Task')
    await page.getByRole('button', { name: 'Create' }).click()
    await page.hover('nav a:has-text("Tasks")')
    await page.locator('nav a:has-text("Tasks")[aria-current="true"]').waitFor()
  })
  test('When pressing a list view nav item from an item view, the correct route should be reached', async () => {
    const gql = String.raw
    const query = gql`
      mutation CreateTaskItem {
        createTask(data: { label: "test task" }) {
          id
        }
      }
    `
    const {
      createTask: { id },
    } = await makeGqlRequest(query)
    await page.goto(`http://localhost:3000/tasks/${id}`)
    await page.waitForSelector('nav a:has-text("Tasks")')
    await page.click('nav a:has-text("Tasks")')
    await page.waitForURL('http://localhost:3000/tasks')
  })
  afterAll(async () => {
    await browser.close()
  })
})
