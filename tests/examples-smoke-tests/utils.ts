import path from 'path'
import { promisify } from 'util'
import execa, { type ExecaChildProcess } from 'execa'
import _treeKill from 'tree-kill'
import * as playwright from 'playwright'
import ms from 'ms'

jest.setTimeout(ms('20 minutes'))

export async function loadIndex (page: playwright.Page) {
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

async function deleteAllData (projectDir: string) {
  const { PrismaClient } = require(path.join(projectDir, 'node_modules/myprisma'))
  const prisma = new PrismaClient()

  await prisma.$transaction(
    Object.values(prisma)
      .filter((x: any) => x?.deleteMany)
      .map((x: any) => x?.deleteMany?.({}))
  )

  await prisma.$disconnect()
}

const treeKill = promisify(_treeKill)

export function initFirstItemTest (getPage: () => playwright.Page) {
  test('init first item', async () => {
    const page = getPage()
    await page.fill('label:has-text("Name") >> .. >> input', 'Admin')
    await page.click('button:has-text("Set Password")')
    await page.fill('[placeholder="New Password"]', 'password')
    await page.fill('[placeholder="Confirm Password"]', 'password')
    await page.click('button:has-text("Get started")')
    await page.uncheck('input[type="checkbox"]', { force: true })
    await page.click('text=Continue')
    await page.waitForSelector('text=Signed in as Admin')
  })
}

// TODO: merge with tests/admin-ui-tests/utils.ts copy
export async function waitForIO (ksProcess: ExecaChildProcess, content: string) {
  return await new Promise(resolve => {
    let output = ''
    function listener (chunk: Buffer) {
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
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {}

    afterAll(async () => {
      await cleanupKeystoneProcess()
    })

    async function startKeystone (command: 'start' | 'dev') {
      const ksProcess = execa('pnpm', ['keystone', command], {
        cwd: projectDir,
        env: process.env,
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
          env: process.env,
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
