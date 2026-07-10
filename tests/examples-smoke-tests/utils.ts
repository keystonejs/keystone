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

export function initFirstItemTest(getPage: () => playwright.Page) {
  test('init first item', async () => {
    const page = getPage()
    await page.getByLabel('Name').fill('Admin')
    await page.getByText('Set Password').click()
    await page.getByPlaceholder('New').fill('password')
    await page.getByPlaceholder('Confirm').fill('password')
    await page.getByRole('button', { name: 'Get started' }).click()
    await page.getByRole('button', { name: 'Sign out' }).waitFor()
  })
}

// TODO: merge with tests/admin-ui-tests/utils.ts copy
export async function waitForIO(ksProcess: ExecaChildProcess, content: string) {
  return await new Promise(resolve => {
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
  tests: (browser: playwright.BrowserType<playwright.Browser>, mode: 'dev' | 'prod') => void
) => {
  const projectDir = path.join(__dirname, '..', '..', 'examples', exampleName)
  const env = {
    ...process.env,
    DATABASE_URL: `file:${path.join(projectDir, 'keystone-example.db')}`,
  }
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {}

    afterAll(async () => {
      await cleanupKeystoneProcess()
    })

    async function startKeystone(command: 'start' | 'dev') {
      const ksProcess = execa('pnpm', ['keystone', command], {
        cwd: projectDir,
        env,
      })

      cleanupKeystoneProcess = async () => {
        await treeKill(ksProcess.pid!)
      }
      await waitForIO(ksProcess, 'Admin UI ready')
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
      beforeAll(async () => {
        await deleteAllData(projectDir)
      })

      tests(playwright.chromium, mode)
    })
  })
}
