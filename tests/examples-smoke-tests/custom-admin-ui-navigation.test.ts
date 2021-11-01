import { Browser, Page } from 'playwright';
import { exampleProjectTests, loadIndex } from './utils';

exampleProjectTests('custom-admin-ui-navigation', browserType => {
  let browser: Browser = undefined as any;
  let page: Page = undefined as any;
  beforeAll(async () => {
    browser = await browserType.launch();
    page = await browser.newPage();
    await loadIndex(page);
  });
  test('Has a nav link to the Dashboard', async () => {
    const navElement = await page.waitForSelector('nav a:has-text("Dashboard")');
    const href = await navElement?.getAttribute('href');
    expect(href).toBe('/');
  });
  test('Has a nav link to the Tasks list', async () => {
    const navElement = await page.waitForSelector('nav a:has-text("Tasks")');
    const href = await navElement?.getAttribute('href');
    expect(href).toBe('/tasks');
  });
  test('Has a nav link to the People list', async () => {
    const navElement = await page.waitForSelector('nav a:has-text("People")');
    const href = await navElement?.getAttribute('href');
    expect(href).toBe('/people');
  });
  test('Has a nav link to the Keystone docs', async () => {
    const navElement = await page.waitForSelector('text="Keystone Docs"');
    const href = await navElement?.getAttribute('href');
    console.log(href);
    expect(href).toBe('https://keystonejs.com');
  });
  afterAll(async () => {
    await browser.close();
  });
});
