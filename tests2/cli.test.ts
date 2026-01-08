import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { collect, spawnTestEnv } from './utils'
import { finished } from 'node:stream/promises'

describe('keystone build', () => {
  test('builds with next OK', async () => {
    const k = await spawnTestEnv({
      'keystone.js': `
import { config, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./app.db',
    prismaClientPath: 'node_modules/.testprisma/client',
  },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
      },
    }),
  },
})
      `,
    }, ['build'])

    k.stderr.pipe(process.stderr)
    const stdout = collect(k.stdout).then(b => b.toString())
    await finished(k.stdout)
    await new Promise(resolve => k.on('exit', resolve))

    assert.ok((await stdout).includes('Generated GraphQL and Prisma schemas'))
    assert.ok((await stdout).includes('Compiled successfully'))
    assert.ok((await stdout).includes('Generating static pages'))
    assert.ok((await stdout).includes('Finalizing page optimization'))
    assert.equal(k.exitCode, 0)
  })

  test('builds typescript OK', async () => {
    const k = await spawnTestEnv({
      'keystone.ts': `
import { config, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

type something = string // the typescript under test

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./app.db',
    prismaClientPath: 'node_modules/.testprisma/client',
  },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
      },
    }),
  },
  ui: { isDisabled: true },
})
      `,
    }, ['build'])

    k.stderr.pipe(process.stderr)
    const stdout = collect(k.stdout).then(b => b.toString())
    // const stderr = collect(k.stdout).then(b => b.toString())
    await finished(k.stdout)
    await new Promise(resolve => k.on('exit', resolve))

    // console.log('output', await stdout)
    // console.log('output', await stderr)
    assert.ok((await stdout).includes('Generated GraphQL and Prisma schemas'))
    assert.equal(k.exitCode, 0)
  })

  test('process.env is retained', async () => {
    const k = await spawnTestEnv({
      'keystone.ts': `
import { config, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

console.log('CLI-TESTS-NODE_ENV=' + process.env.NODE_ENV)
console.log('CLI-TESTS-NEXT_TELEMETRY_DISABLED=' + process.env.NEXT_TELEMETRY_DISABLED)

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./app.db',
    prismaClientPath: 'node_modules/.testprisma/client',
  },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
      },
    }),
  },
  ui: { isDisabled: true },
})
      `,
    }, ['build'], {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    })

    k.stderr.pipe(process.stderr)
    const stdout = collect(k.stdout).then(b => b.toString())
    await finished(k.stdout)
    await new Promise(resolve => k.on('exit', resolve))

    assert.ok((await stdout).includes('CLI-TESTS-NODE_ENV=production'))
    assert.ok((await stdout).includes('CLI-TESTS-NEXT_TELEMETRY_DISABLED=1'))
    assert.equal(k.exitCode, 0)
  })
})
