import path from 'path'
import fs from 'fs/promises'
import { type Browser, type Page, chromium } from 'playwright'
import { expect as playwrightExpect } from 'playwright/test'
import { parse, print } from 'graphql'
import ms from 'ms'

import { loadIndex, makeGqlRequest, spawnCommand3, waitForIO } from './utils'

const gql = ([content]: TemplateStringsArray) => content
const testProjectPath = path.join(__dirname, '..', 'test-projects', 'live-reloading')

async function replaceSchema(schema: string) {
  await fs.writeFile(
    path.join(testProjectPath, 'schema.ts'),
    await fs.readFile(path.join(testProjectPath, `schemas/${schema}`))
  )
}

jest.setTimeout(ms('20 minutes'))

let exit = async () => {}
let ksProcess = undefined as any
let page: Page = undefined as any
let browser: Browser = undefined as any

test('start keystone', async () => {
  // just in case a previous failing test run messed things up, let's reset it
  await replaceSchema('initial.ts')
  ;({ process: ksProcess, exit } = await spawnCommand3(testProjectPath, ['dev']))
  browser = await chromium.launch()
  page = await browser.newPage()
  await waitForIO(ksProcess, 'Admin UI ready')
  await loadIndex(page)
})

test('Creating an item with the GraphQL API and navigating to the item page for it', async () => {
  const {
    createSomething: { id },
  } = await makeGqlRequest(gql`
    mutation {
      createSomething(data: { text: "blah" }) {
        id
      }
    }
  `)

  await page.goto(`http://localhost:3000/somethings/${id}`)
  await playwrightExpect(page.getByRole('textbox', { name: 'Initial Label For Text' })).toHaveValue(
    'blah'
  )
})

test('api routes written with getAdditionalFiles containing [...rest] work', async () => {
  expect(
    await fetch('http://localhost:3000/api/blah/asdasdas/das/da/sdad').then(x => x.text())
  ).toEqual('something')
})

test('changing the label of a field updates in the Admin UI', async () => {
  await replaceSchema('second.ts')
  await waitForIO(ksProcess, 'compiled successfully')

  await playwrightExpect(page.getByRole('textbox', { name: 'Very Important Text' })).toHaveValue(
    'blah'
  )
})

test('adding a virtual field', async () => {
  const virtualFieldTextbox = page.getByRole('textbox', { name: 'Virtual' })
  expect(await virtualFieldTextbox.getAttribute('value')).toBe('blah')
})

test('the generated schema includes schema updates', async () => {
  // we want to make sure the field that we added worked
  // and the change we made to the have worked
  const schema = await fs.readFile(path.join(testProjectPath, 'schema.graphql'), 'utf8')
  const parsed = parse(schema)
  const objectTypes = parsed.definitions.filter(
    x =>
      x.kind === 'ObjectTypeDefinition' &&
      (x.name.value === 'Query' || x.name.value === 'Something')
  )
  expect(objectTypes.map(x => print(x)).join('\n\n')).toMatchInlineSnapshot(`
        "type Something {
          id: ID!
          text: String
          virtual: String
        }

        type Query {
          something(where: SomethingWhereUniqueInput!): Something
          somethings(where: SomethingWhereInput! = {}, orderBy: [SomethingOrderByInput!]! = [], take: Int, skip: Int! = 0, cursor: SomethingWhereUniqueInput): [Something!]
          somethingsCount(where: SomethingWhereInput! = {}): Int
          keystone: KeystoneMeta!
          someNumber: Int!
        }"
      `)
})

test("a syntax error is shown and doesn't crash the process", async () => {
  await replaceSchema('syntax-error.js')
  await waitForIO(ksProcess, '✘ [ERROR] Expected ";" but found "const"')
})

test("a runtime error is shown and doesn't crash the process", async () => {
  await replaceSchema('runtime-error.ts')
  await waitForIO(ksProcess, 'ReferenceError: doesNotExist is not defined')
})

test('errors can be recovered from', async () => {
  await replaceSchema('initial.ts')

  await playwrightExpect(page.getByRole('textbox', { name: 'Initial Label For Text' })).toHaveValue(
    'blah'
  )
})

afterAll(async () => {
  await Promise.all([exit(), browser.close()])
})
