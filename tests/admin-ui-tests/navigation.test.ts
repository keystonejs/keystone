import { Browser, Page } from 'playwright';
import { adminUITests } from './utils';

adminUITests('./tests/test-projects/basic', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;

  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  test('Nav contains a Dashboard route by default', async () => {
    await page.waitForSelector('nav a:has-text("Dashboard")');
  });
  test('When at the index, the Dashboard NavItem is selected', async () => {
    const element = await page.waitForSelector('nav a:has-text("Dashboard")');
    const ariaCurrent = await element?.getAttribute('aria-current');
    expect(ariaCurrent).toBe('location');
  });
  test('When navigated to a List route, the representative list NavItem is selected', async () => {
    await page.goto('http://localhost:3000/tasks');
    const element = await page.waitForSelector('nav a:has-text("Tasks")');
    const ariaCurrent = await element?.getAttribute('aria-current');
    expect(ariaCurrent).toBe('location');
  });
  test('Can access all list pages via the navigation', async () => {
    await page.goto('http://localhost:3000');
    await Promise.all([page.waitForNavigation(), page.click('nav a:has-text("Tasks")')]);
    expect(page.url()).toBe('http://localhost:3000/tasks');
    await Promise.all([page.waitForNavigation(), page.click('nav a:has-text("People")')]);
    expect(page.url()).toBe('http://localhost:3000/people');
  });
  test('Can not access hidden lists via the navigation', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('nav a:has-text("Tasks")', { state: 'detached' });
  });
  test('When navigated to an Item view, the representative list NavItem is selected', async () => {
    await page.goto('http://localhost:3000');
    await page.click('button[title="Create Task"]');
    await page.fill('id=label', 'Test Task');
    await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
    const element = await page.waitForSelector('nav a:has-text("Tasks")');
    const ariaCurrent = await element?.getAttribute('aria-current');
    expect(ariaCurrent).toBe('location');
  });
  test('When pressing a list view nav item from an item view, the correct route should be reached', async () => {
    await page.goto('http://localhost:3000');
    await page.click('button[title="Create Task"]');
    await page.fill('id=label', 'Test Task');
    await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
    await Promise.all([page.waitForNavigation(), page.click('nav a:has-text("Tasks")')]);

    expect(page.url()).toBe('http://localhost:3000/tasks');
  });
  afterAll(async () => {
    await browser.close();
  });
});
