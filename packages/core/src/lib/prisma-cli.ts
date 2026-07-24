import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { ExitError } from '../scripts/utils.ts'
import { createRequire } from 'node:module'

export type PrismaOutput = 'inherit' | 'capture'

async function runPrisma(cwd: string, args: string[], output: PrismaOutput): Promise<string> {
  const require = createRequire(path.join(cwd, 'a.js'))
  const prismaCli = require.resolve('prisma/build/index.js')

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [prismaCli, ...args], {
      cwd,
      env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: '1' },
      stdio: output === 'capture' ? ['ignore', 'pipe', 'pipe'] : output,
    })
    let stdout = ''
    let stderr = ''
    if (output === 'capture') {
      child.stdout!.setEncoding('utf8').on('data', chunk => (stdout += chunk))
      child.stderr!.setEncoding('utf8').on('data', chunk => (stderr += chunk))
    }
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (typeof code === 'number' && code !== 0) {
        const detail = [stdout, stderr]
          .map(output => output.trim())
          .filter(Boolean)
          .join('\n')
        const error = new ExitError(code, detail)
        error.message = `Prisma exited with code ${code}${detail ? `:\n${detail}` : ''}`
        reject(error)
      } else if (code === null) {
        reject(new Error(`Prisma was terminated by signal ${signal ?? 'unknown'}`))
      } else {
        resolve(stdout)
      }
    })
  })
}

export async function formatPrismaSchema(cwd: string, schema: string) {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'keystone-prisma-'))
  const schemaPath = path.join(temporaryDirectory, 'schema.prisma')
  try {
    await fs.writeFile(schemaPath, schema)
    await runPrisma(cwd, ['format', '--schema', schemaPath], 'capture')
    return await fs.readFile(schemaPath, 'utf8')
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true })
  }
}

export async function generatePrisma(
  cwd: string,
  schemaPath: string,
  output: PrismaOutput = 'inherit'
) {
  await runPrisma(cwd, ['generate', '--schema', schemaPath], output)
}

export async function pushPrismaSchema(
  cwd: string,
  schemaPath: string,
  output: PrismaOutput = 'inherit'
) {
  await runPrisma(cwd, ['db', 'push', '--schema', schemaPath], output)
}
