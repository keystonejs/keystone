import { afterAll, describe, test, vi } from 'vitest'
import path from 'path'
import { promisify } from 'util'
import { DatabaseSync } from 'node:sqlite'
import execa, { type ExecaChildProcess } from 'execa'
import _treeKill from 'tree-kill'
import * as playwright from 'playwright'

vi.setConfig({ testTimeout: 1_200_000, hookTimeout: 30_000 })

export async function loadIndex(page: playwright.Page) {
  await page.goto('http://localhost:3000')
  try {
    // sometimes Next will fail to load the page the first time
    // this is probably because Keystone is fetching the API route to compile Keystone
    // while we're fetching an Admin UI page
    // and Next doesn't handle fetching two pages at the same time well
    await page.waitForSelector(':has-text("Dashboard")', { timeout: 2000 })
  } catch {
    await page.goto('http://localhost:3000')
  }
}

async function deleteAllData(projectDir: string) {
  const database = new DatabaseSync(path.join(projectDir, 'keystone-example.db'), {
    timeout: 10_000,
  })

  try {
    const tables = database
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table'
           AND name NOT LIKE 'sqlite_%'
           AND name != '_prisma_migrations'`
      )
      .all() as { name: string }[]

    database.exec('PRAGMA foreign_keys = OFF; BEGIN')
    try {
      for (const { name } of tables) {
        const tableName = `"${name.replaceAll('"', '""')}"`
        database.prepare(`DELETE FROM ${tableName}`).run()
      }
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
  } finally {
    database.close()
  }
}

const treeKill = promisify(_treeKill)

type InitialUser = { identity: string; password: string }

export function initialUserTest(getPage: () => playwright.Page, getInitialUser: () => InitialUser) {
  test('sign in as the initial user', async () => {
    const page = getPage()
    const initialUser = getInitialUser()
    await page.getByLabel('Name').fill(initialUser.identity)
    await page.getByRole('textbox', { name: 'Password' }).fill(initialUser.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('button', { name: 'Sign out' }).waitFor()
  })
}

// TODO: merge with tests/admin-ui-tests/utils.ts copy
export async function waitForIO(ksProcess: ExecaChildProcess, content: string) {
  return await new Promise<string>(resolve => {
    let output = ''
    function listener(chunk: Buffer) {
      output += chunk.toString('utf8')
      if (process.env.VERBOSE) console.log(chunk.toString('utf8'))
      if (!output.includes(content)) return

      ksProcess.stdout!.off('data', listener)
      ksProcess.stderr!.off('data', listener)
      return resolve(output)
    }

    ksProcess.stdout!.on('data', listener)
    ksProcess.stderr!.on('data', listener)
  })
}

export const exampleProjectTests = (
  exampleName: string,
  tests: (
    browser: playwright.BrowserType<playwright.Browser>,
    mode: 'dev' | 'prod',
    getInitialUser: () => InitialUser
  ) => void,
  options: { waitForInitialUser?: boolean } = {}
) => {
  const projectDir = path.join(__dirname, '..', '..', 'examples', exampleName)
  const env = {
    ...process.env,
    DATABASE_URL: `file:${path.join(projectDir, 'keystone-example.db')}`,
  }
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {}
    let initialUser: InitialUser | undefined

    afterAll(async () => {
      await cleanupKeystoneProcess()
    })

    async function startKeystone(command: 'start' | 'dev') {
      await deleteAllData(projectDir)
      const ksProcess = execa('pnpm', ['keystone', command], {
        cwd: projectDir,
        env,
      })

      cleanupKeystoneProcess = async () => {
        await treeKill(ksProcess.pid!)
      }
      const output = await Promise.all([
        waitForIO(ksProcess, 'Admin UI ready'),
        options.waitForInitialUser
          ? waitForIO(ksProcess, 'Created initial user:')
          : Promise.resolve(''),
      ])
      if (options.waitForInitialUser) {
        const match = output[1].match(/Created initial user: (.+) \/ ([0-9a-f]+)/)
        if (!match) throw new Error('Could not parse the initial user credentials')
        initialUser = { identity: match[1], password: match[2] }
      }
    }

    if (mode === 'dev') {
      test('start keystone in dev', async () => {
        await startKeystone('dev')
      })
    }

    if (mode === 'prod') {
      test('build keystone', async () => {
        const keystoneBuildProcess = execa('pnpm', ['build'], {
          cwd: projectDir,
          env,
        })
        if (process.env.VERBOSE) {
          const logChunk = (chunk: any) => {
            console.log(chunk.toString('utf8'))
          }
          keystoneBuildProcess.stdout!.on('data', logChunk)
          keystoneBuildProcess.stderr!.on('data', logChunk)
        }
        await keystoneBuildProcess
      })
      test('start keystone in prod', async () => {
        await startKeystone('start')
      })
    }

    describe('browser tests', () => {
      tests(playwright.chromium, mode, () => {
        if (!initialUser) throw new Error('Initial user credentials are not available')
        return initialUser
      })
    })
  })
}
