import { spawn } from 'node:child_process'
import path from 'node:path'
import { format } from 'node:util'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import * as fse from 'fs-extra'
import fastGlob from 'fast-glob'
import chalk from 'chalk'
import ms from 'ms'

import { cli } from '@keystone-6/core/scripts/cli'

jest.setTimeout(ms('30 seconds'))

export const cliBinPath = require.resolve('@keystone-6/core/bin/cli.js')

export const basicKeystoneConfig = fs.readFileSync(
  `${__dirname}/fixtures/basic-project/keystone.ts`,
  'utf8'
)

export const schemas = {
  'schema.graphql': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.graphql`, 'utf8'),
  'schema.prisma': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.prisma`, 'utf8'),
}

export function recordConsole () {
  const oldConsole = { ...console }
  const contents: string[] = []
  const log = (...args: any[]) => {
    contents.push(format(...args).replace(/[^ -~\n]+/g, '?'))
  }

  Object.assign(console, { log, error: log, warn: log, info: log })

  return () => {
    Object.assign(console, oldConsole)
    return contents.join('\n')
  }
}

export const symlinkKeystoneDeps = Object.fromEntries(
  [
    '@keystone-6/core',
    '@prisma/engines',
    '@prisma/client',
    'typescript',
    '@types/react',
    '@types/node',
    'next',
    'react',
    'react-dom',
  ].map(pkg => [
    `node_modules/${pkg}`,
    { kind: 'symlink' as const, path: path.dirname(require.resolve(`${pkg}/package.json`)) },
  ])
)

type Fixture = {
  [key: string]:
    | string
    | Buffer
    | { kind: 'symlink', path: string }
}

export async function cliMock (cwd: string, args: string | string[]) {
  const argv = typeof args === 'string' ? [args] : args
  chalk.level = 0 // disable ANSI colouring for this
  const proc = await cli(cwd, argv)
  if (typeof proc === 'function') {
    await proc()
  }
}

export async function spawnCommand (cwd: string, commands: string[]) {
  let output = ''
  return new Promise<string>((resolve, reject) => {
    const p = spawn('node', [cliBinPath, ...commands], { cwd })
    p.stdout.on('data', (data) => (output += data.toString('utf-8')))
    p.stderr.on('data', (data) => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => {
      if (typeof exitCode === 'number' && exitCode !== 0) return reject(`${commands.join(' ')} returned ${exitCode}`)
      resolve(output)
    })
  })
}

export async function spawnCommand2 (cwd: string, commands: string[]) {
  let output = ''
  return new Promise<{
    exitCode: number | null
    output: string
  }>((resolve, reject) => {
    const p = spawn('node', [cliBinPath, ...commands], { cwd })
    p.stdout.on('data', (data) => (output += data.toString('utf-8')))
    p.stderr.on('data', (data) => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => (resolve({ exitCode, output })))
  })
}

let dirsToRemove: string[] = []

afterAll(async () => {
  await Promise.all(
    dirsToRemove.map(path => {
      return fsp.rm(path, { recursive: true, force: true })
    })
  )
  dirsToRemove = []
})

// from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
export async function testdir (dir: Fixture) {
  const temp = await fsp.mkdtemp(__dirname)
  dirsToRemove.push(temp)
  await Promise.all(
    Object.keys(dir).map(async filename => {
      const output = dir[filename]
      const fullPath = path.join(temp, filename)
      if (typeof output === 'string' || Buffer.isBuffer(output)) {
        await fse.outputFile(fullPath, output)

      // symlink
      } else {
        await fsp.mkdir(path.dirname(fullPath), { recursive: true })
        const targetPath = path.resolve(temp, output.path)
        const symlinkType = (await fsp.stat(targetPath)).isDirectory() ? 'dir' : 'file'
        await fsp.symlink(targetPath, fullPath, symlinkType)
      }
    })
  )
  return temp
}

// from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
expect.addSnapshotSerializer({
  print (_val) {
    const val = _val as Record<string, string>
    const contentsByFilename: Record<string, string[]> = {}
    Object.entries(val).forEach(([filename, contents]) => {
      if (contentsByFilename[contents] === undefined) {
        contentsByFilename[contents] = []
      }
      contentsByFilename[contents].push(filename)
    })
    return Object.entries(contentsByFilename)
      .map(([contents, filenames]) => {
        return `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ ${filenames.join(', ')} ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n${contents}`
      })
      .join('\n')
  },
  test (val) {
    return val && val[dirPrintingSymbol]
  },
})

const dirPrintingSymbol = Symbol('dir printing symbol')

// derived from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
export async function getFiles (
  dir: string,
  glob: string[] = ['**', '!node_modules/**'],
  encoding: 'utf8' | null = 'utf8'
) {
  const files = await fastGlob(glob, { cwd: dir })
  const result: Record<string, string | Buffer> = {
    [dirPrintingSymbol]: true,
  }
  await Promise.all(
    files.sort().map(async (fileName: string) => {
      result[fileName] = await fsp.readFile(path.join(dir, fileName), encoding)
    })
  )
  return result
}

export async function introspectDatabase (cwd: string, url: string) {
  let output = ''
  return new Promise<string>((resolve, reject) => {
    const p = spawn('node', [require.resolve('prisma'), 'db', 'pull', '--print'], {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: url,
        PRISMA_HIDE_UPDATE_MESSAGE: '1',
      },
    })
    p.stdout.on('data', (data) => (output += data.toString('utf-8')))
    p.stderr.on('data', (data) => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => {
      if (output.includes('P4001')) return resolve('') // empty database
      if (typeof exitCode === 'number' && exitCode !== 0) return reject(`Introspect process returned ${exitCode}`)
      resolve(output)
    })
  })
}
