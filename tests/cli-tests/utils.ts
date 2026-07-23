import { afterAll, expect, vi } from 'vitest'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { format } from 'node:util'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

import { cli } from '@keystone-6/core/scripts/cli'

vi.setConfig({ testTimeout: 30_000 })

export const cliBinPath = require.resolve('@keystone-6/core/bin/cli.js')

export const basicKeystoneConfig = fs.readFileSync(
  `${__dirname}/fixtures/basic-project/keystone.ts`,
  'utf8'
)

export const schemas = {
  'schema.graphql': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.graphql`, 'utf8'),
  'schema.prisma': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.prisma`, 'utf8'),
}

const prismaConfig = fs.readFileSync(`${__dirname}/prisma.config.ts`, 'utf8')

export function recordConsole() {
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

function packageDirectory(packageName: string) {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`))
  } catch (error: any) {
    if (!['MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED'].includes(error.code)) throw error
    let directory = path.dirname(require.resolve(packageName))
    while (!fs.existsSync(path.join(directory, 'package.json'))) {
      directory = path.dirname(directory)
    }
    return directory
  }
}

export const symlinkKeystoneDeps = {
  ...Object.fromEntries(
    [
      '@keystone-6/core',
      '@prisma/adapter-better-sqlite3',
      '@prisma/adapter-pg',
      '@prisma/client',
      'prisma',
      'typescript',
      '@types/react',
      '@types/node',
      'next',
      'react',
      'react-dom',
    ].map(pkg => [`node_modules/${pkg}`, { kind: 'symlink' as const, path: packageDirectory(pkg) }])
  ),
  'prisma.config.ts': prismaConfig,
}

type Fixture = {
  [key: string]: string | Buffer | { kind: 'symlink'; path: string }
}

export async function cliMock(cwd: string, args: string | string[]) {
  const argv = typeof args === 'string' ? [args] : args
  const proc = await cli(cwd, argv)
  if (typeof proc === 'function') {
    await proc()
  }
}

export async function spawnCommand(cwd: string, commands: string[]) {
  let output = ''
  return new Promise<string>((resolve, reject) => {
    const p = spawn('node', [cliBinPath, ...commands], {
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes',
      },
    })
    p.stdout.on('data', data => (output += data.toString('utf-8')))
    p.stderr.on('data', data => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => {
      if (typeof exitCode === 'number' && exitCode !== 0)
        return reject(`${commands.join(' ')} returned ${exitCode}:\n${output}`)
      resolve(output)
    })
  })
}

export async function spawnCommand2(cwd: string, commands: string[]) {
  let output = ''
  return new Promise<{
    exitCode: number | null
    output: string
  }>((resolve, reject) => {
    const p = spawn('node', [cliBinPath, ...commands], {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
    })
    p.stdout.on('data', data => (output += data.toString('utf-8')))
    p.stderr.on('data', data => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => resolve({ exitCode, output }))
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
export async function testdir(dir: Fixture) {
  const temp = await fsp.mkdtemp(__dirname)
  dirsToRemove.push(temp)
  await Promise.all(
    Object.keys(dir).map(async filename => {
      const output = dir[filename]
      const fullPath = path.join(temp, filename)
      if (typeof output === 'string' || Buffer.isBuffer(output)) {
        await fsp.mkdir(path.dirname(fullPath), { recursive: true })
        await fsp.writeFile(fullPath, output)

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
  print(_val) {
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
  test(val) {
    return val && val[dirPrintingSymbol]
  },
})

const dirPrintingSymbol = Symbol('dir printing symbol')

// derived from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
export async function getFiles(
  dir: string,
  glob: string[] = ['**', '!node_modules/**'],
  encoding: 'utf8' | null = 'utf8'
) {
  const patterns = glob.filter(pattern => !pattern.startsWith('!'))
  const exclude = glob.filter(pattern => pattern.startsWith('!')).map(pattern => pattern.slice(1))
  const entries = await Array.fromAsync(
    fsp.glob(patterns, { cwd: dir, exclude, withFileTypes: true })
  )
  const files = entries
    .filter(entry => !entry.isDirectory())
    .map(entry => path.relative(dir, path.join(entry.parentPath, entry.name)))
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

export async function introspectDatabase(cwd: string, url: string) {
  let output = ''
  return new Promise<string>((resolve, reject) => {
    const p = spawn(
      'node',
      ['--title=prisma', require.resolve('prisma/build/index.js'), 'db', 'pull', '--print'],
      {
        cwd,
        env: {
          ...process.env,
          DATABASE_URL: url,
          PRISMA_HIDE_UPDATE_MESSAGE: '1',
        },
      }
    )
    p.stdout.on('data', data => (output += data.toString('utf-8')))
    p.stderr.on('data', data => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => {
      output = output.replace(/^Loaded Prisma config from .+\.\n\n/, '')
      if (output.includes('P4001')) return resolve('') // empty database
      if (typeof exitCode === 'number' && exitCode !== 0)
        return reject(
          `Introspect process returned ${exitCode}:\n${output}\nFiles: ${fs.readdirSync(cwd).join(', ')}`
        )
      resolve(output)
    })
  })
}
