import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import esbuild from 'esbuild'

import { getEsbuildConfig } from '../packages/core/src/scripts/esbuild'

test('bundles Keystone config and generated Prisma client into one CommonJS runtime', async () => {
  const scratchRoot = path.join(process.cwd(), '.keystone')
  await fs.mkdir(scratchRoot, { recursive: true })
  const cwd = await fs.mkdtemp(path.join(scratchRoot, 'runtime-bundle-test-'))
  const clientPath = path.join(cwd, 'generated/prisma/client.ts')
  await fs.mkdir(path.dirname(clientPath), { recursive: true })
  await fs.writeFile(path.join(cwd, 'keystone.ts'), `export default { marker: 'config' }\n`)
  await fs.writeFile(
    clientPath,
    `export const clientDirectory = new URL('.', import.meta.url).pathname
export class PrismaClient {}
export const Prisma = { marker: 'prisma' }
`
  )

  await esbuild.build(await getEsbuildConfig(cwd, clientPath))
  const runtime = require(path.join(cwd, '.keystone/config.js'))

  assert.equal(runtime.config.marker, 'config')
  assert.equal(typeof runtime.prisma.PrismaClient, 'function')
  assert.equal(runtime.prisma.Prisma.marker, 'prisma')
  assert.equal(runtime.prisma.clientDirectory, `${path.join(cwd, '.keystone')}/`)
})
