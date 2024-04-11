// most of these utilities come from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
import { spawn } from 'node:child_process';
import path from 'node:path'
import { format } from 'node:util'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import * as fse from 'fs-extra'
import fastGlob from 'fast-glob'
import chalk from 'chalk'

import { SchemaEngine } from '@prisma/migrate'
import { uriToCredentials } from '@prisma/internals'
import { cli } from '@keystone-6/core/scripts/cli'

// these tests spawn processes and it's all pretty slow
jest.setTimeout(1000 * 20)

export class ExitError extends Error {
  code: number
  constructor (code: number) {
    super(`The process should exit with ${code}`)
    this.code = code
  }
}

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
  let oldConsole = { ...console }
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

export async function runCommand (cwd: string, args: string | string[]) {
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
    p.on('exit', code => {
      if (code) return reject(new ExitError(code))
      resolve(output)
    })
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

export async function getFiles (
  dir: string,
  glob: string[] = ['**', '!node_modules/**'],
  encoding: 'utf8' | null = 'utf8'
) {
  const files = await fastGlob(glob, { cwd: dir })
  const filesObj: Record<string, string | Buffer> = {
    [dirPrintingSymbol]: true,
  }
  await Promise.all(
    files.map(async filename => {
      filesObj[filename] = await fsp.readFile(path.join(dir, filename), encoding)
    })
  )
  const result: Record<string, string | Buffer> = { [dirPrintingSymbol]: true }
  files.sort().forEach(filename => {
    result[filename] = filesObj[filename]
  })
  return result
}

export async function introspectDb (cwd: string, url: string) {
  const engine = new SchemaEngine({ projectDir: cwd })
  try {
    const { datamodel } = await engine.introspect({
      schema: `datasource db {
  url = ${JSON.stringify(url)}
  provider = ${JSON.stringify(uriToCredentials(url).type)}
}`,
    })
    return datamodel
  } catch (e: any) {
    if (e.code === 'P4001') return null
    throw e

  } finally {
    engine.stop()
  }
}
