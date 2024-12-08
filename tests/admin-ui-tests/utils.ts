import {
  type ChildProcessWithoutNullStreams,
  spawn,
} from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import fetch from 'node-fetch'

import { type ExecaChildProcess } from 'execa'
import * as playwright from 'playwright'
import dotenv from 'dotenv'
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

const projectRoot = path.resolve(__dirname, '..', '..')

export async function makeGqlRequest (query: string, variables?: Record<string, any>) {
  const { data, errors } = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ query, variables, }),
  }).then(res => res.json())

  if (errors) throw new Error(`graphql errors: ${errors.map((x: Error) => x.message).join('\n')}`)
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

export function adminUITests (
  pathToTest: string,
  tests: (browser: playwright.BrowserType<playwright.Browser>) => void
) {
  const projectDir = path.join(projectRoot, pathToTest)
  dotenv.config()

  describe('development', () => {
    let exit: (() => Promise<void>) | undefined = undefined
    test('prepare keystone', async () => {
      ;({ exit } = await spawnCommand3(projectDir, ['dev'], 'Admin UI ready'))
    })

    describe('browser tests', () => tests(playwright.chromium))
    afterAll(async () => await exit?.())
  })

  describe('production browser tests', () => {
    let exit: (() => Promise<void>) | undefined = undefined
    test('prepare keystone', async () => {
      await (await spawnCommand3(projectDir, ['build'])).exited
      ;({ exit } = await spawnCommand3(projectDir, ['start'], 'Admin UI ready'))
    })

    describe('browser tests', () => tests(playwright.chromium))
    afterAll(async () => await exit?.())
  })
}

export async function waitForIO (p: ExecaChildProcess | ChildProcessWithoutNullStreams, content: string) {
  return await new Promise<string>((resolve, reject) => {
    let output = ''
    function listener (chunk: Buffer) {
      output += chunk.toString('utf8')
      if (process.env.VERBOSE) console.log(chunk.toString('utf8'))
      if (!output.includes(content)) return

      p.stdout!.off('data', listener)
      p.stderr!.off('data', listener)
      resolve(output)
    }

    p.stdout!.on('data', listener)
    p.stderr!.on('data', listener)
    p.on('error', err => reject(err))
  })
}

const cliBinPath = require.resolve('@keystone-6/core/bin/cli.js')

export async function spawnCommand3 (cwd: string, commands: string[], waitOn: string | null = null) {
  if (!fs.existsSync(cwd)) throw new Error(`No such file or directory ${cwd}`)

  const p = spawn('node', [cliBinPath, ...commands], { cwd })
  if (waitOn) {
    await waitForIO(p, waitOn)
  }

  const exitPromise = new Promise<void>((resolve, reject) => {
    p.on('exit', exitCode => {
      if (typeof exitCode === 'number' && exitCode !== 0) return reject(new Error(`Error ${exitCode}`))
      resolve()
    })
  })

  return {
    process: p,
    exit: async () => {
      p.kill('SIGHUP')
      await exitPromise
    },
    exited: exitPromise
  }
}
