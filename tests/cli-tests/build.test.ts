import { readFile } from 'node:fs/promises'

import execa from 'execa'
import {
  basicKeystoneConfig,
  cliBinPath,
  cliMock,
  schemas,
  symlinkKeystoneDeps,
  testdir,
} from './utils'

test("start errors when a build hasn't happened", async () => {
  const cwd = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })
  await expect(cliMock(cwd, 'start')).rejects.toEqual(new Error('You need to run "keystone build"'))
})

test('build works with typescript without the user defining a babel config', async () => {
  const cwd = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await readFile(`${__dirname}/fixtures/with-ts.ts`, 'utf8'),
  })
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  })
  expect(result.stdout.includes('Compiled successfully')).toBe(true)
  expect(result.stdout.includes('Generating static pages')).toBe(true)
  expect(result.stdout.includes('Finalizing page optimization')).toBe(true)
  expect(result.exitCode).toBe(0)
})

test('process.env.NODE_ENV is production in production', async () => {
  const cwd = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await readFile(`${__dirname}/fixtures/log-node-env.ts`, 'utf8'),
  })
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd,
    buffer: true,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  })
  expect(result.exitCode).toBe(0)
  const startResult = execa('node', [cliBinPath, 'start'], {
    reject: false,
    all: true,
    cwd,
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  })
  let output = ''
  try {
    await Promise.race([
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`timed out. output:\n${output}`)), 10000)
      ),
      new Promise<void>(resolve => {
        startResult.all!.on('data', data => {
          output += data
          if (
            output.includes('CLI-TESTS-NODE-ENV: production') &&
            output.includes('CLI-TESTS-NODE-ENV-EVAL: production')
          ) {
            resolve()
          }
        })
      }),
    ])
  } finally {
    startResult.kill()
  }
})
