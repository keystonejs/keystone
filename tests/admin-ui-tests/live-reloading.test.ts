import { parse, print } from 'graphql'
import ms from 'ms'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { type Browser, type Page, chromium } from 'playwright'
import { expect as playwrightExpect } from 'playwright/test'

import { loadIndex, makeGqlRequest, spawnCommand3, waitForIO } from './utils'

const gql = ([content]: TemplateStringsArray) => content
const testProjectPath = path.join(__dirname, '..', 'test-projects', 'live-reloading')

async function replaceSchema(schema: string) {
  await writeFile(
    path.join(testProjectPath, 'schema.ts'),
    await readFile(path.join(testProjectPath, `schemas/${schema}`))
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

test('creating an item with the GraphQL API and navigating to the item page for it', async () => {
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

test('getAdditionalFiles routes that use [...rest] are working', async () => {
  expect(
    await fetch('http://localhost:3000/api/blah/asdasdas/das/da/sdad').then(x => x.text())
  ).toEqual('something')
})

test('updates to the Keystone schema are propagated', async () => {
  await new Promise(resolve => setTimeout(resolve, 5000)) // TODO: FIXME, something is up
  await replaceSchema('second.ts')
  await waitForIO(ksProcess, 'compiled successfully')

  // WARNING: assumes we are still on the item page from a previous test
  // the virtual field should have updated
  await playwrightExpect(
    page.getByRole('textbox', {
      name: 'Virtual',
    })
  ).toHaveValue('blah', { timeout: 20_000 }) // allow some time

  await playwrightExpect(
    page.getByRole('textbox', {
      name: 'Very Important Text',
    })
  ).toHaveValue('blah')

  // check the GraphQL schema has updated
  const schema = await readFile(path.join(testProjectPath, 'schema.graphql'), 'utf8')
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
  await new Promise(resolve => setTimeout(resolve, 5000)) // TODO: FIXME, something is up
  await replaceSchema('initial.ts')
  await playwrightExpect(
    page.getByRole('textbox', {
      name: 'Initial Label For Text',
    })
  ).toHaveValue('blah', { timeout: 20_000 }) // allow some time
})

afterAll(async () => {
  await Promise.all([exit(), browser.close()])
})
