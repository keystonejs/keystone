import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import fetch from 'node-fetch'
import execa, { type ExecaChildProcess } from 'execa'
import _treeKill from 'tree-kill'
import * as playwright from 'playwright'
import dotenv from 'dotenv'

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

const treeKill = promisify(_treeKill)

// this'll take a while
jest.setTimeout(10000000)

const projectRoot = path.resolve(__dirname, '..', '..')

// Light wrapper around node-fetch for making graphql requests to the graphql api of the test instance.
export const makeGqlRequest = async (query: string, variables?: Record<string, any>) => {
  const { data, errors } = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then(res => res.json())

  if (errors) {
    throw new Error(`graphql errors: ${errors.map((x: Error) => x.message).join('\n')}`)
  }

  return data
}

// Simple utility to create an Array of records given a map function and a range.
export function generateDataArray (map: (key: number) => any, range: number) {
  return Array.from(Array(range).keys()).map(map)
}

export async function deleteAllData (projectDir: string) {
  const resolvedProjectDir = path.resolve(projectRoot, projectDir)

  const { PrismaClient } = require(path.join(
    resolvedProjectDir,
    'node_modules/.testprisma/client'
  ))
  const prisma = new PrismaClient()

  await prisma.$transaction(
    Object.values(prisma)
      .filter((x: any) => x?.deleteMany)
      .map((x: any) => x?.deleteMany?.({}))
  )

  await prisma.$disconnect()
}

export const adminUITests = (
  pathToTest: string,
  tests: (browser: playwright.BrowserType<playwright.Browser>) => void
) => {
  const projectDir = path.join(projectRoot, pathToTest)

  dotenv.config()
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {}

    afterAll(async () => {
      await cleanupKeystoneProcess()
    })

    async function startKeystone (command: 'start' | 'dev') {
      cleanupKeystoneProcess = (await generalStartKeystone(projectDir, command)).exit
    }

    if (mode === 'dev') {
      test('start keystone in dev', async () => {
        await startKeystone('dev')
      })
    }

    if (mode === 'prod') {
      test('build keystone', async () => {
        const ksProcess = execa('pnpm', ['build'], {
          cwd: projectDir,
          env: process.env,
        })

        if (process.env.VERBOSE) {
          ksProcess.stdout!.pipe(process.stdout)
          ksProcess.stderr!.pipe(process.stdout)
        }

        await ksProcess
      })
      test('start keystone in prod', async () => {
        await startKeystone('start')
      })
    }

    describe('browser tests', () => {
      beforeAll(async () => {
        await deleteAllData(projectDir)
      })
      tests(playwright.chromium)
    })
  })
}

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

export async function generalStartKeystone (projectDir: string, command: 'start' | 'dev') {
  if (!fs.existsSync(projectDir)) {
    throw new Error(`No such file or directory ${projectDir}`)
  }

  const keystoneProcess = execa('pnpm', ['keystone', command], {
    cwd: projectDir,
    env: process.env,
  })

  await waitForIO(keystoneProcess, 'Admin UI ready')
  return {
    process: keystoneProcess,
    exit: async () => {
      // childProcess.kill will only kill the direct child process
      // so we use tree-kill to kill the process and it's children
      await treeKill(keystoneProcess.pid!)
    },
  }
}
