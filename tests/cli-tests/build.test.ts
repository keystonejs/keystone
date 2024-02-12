import fs from 'node:fs/promises'
import execa from 'execa'
import {
  ExitError,
  basicKeystoneConfig,
  cliBinPath,
  recordConsole,
  runCommand,
  schemas,
  symlinkKeystoneDeps,
  testdir,
} from './utils'

test("start errors when a build hasn't happened", async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })
  const recording = recordConsole()
  await expect(runCommand(tmp, 'start')).rejects.toEqual(new ExitError(1))
  expect(recording()).toMatchInlineSnapshot(`
    "? Starting Keystone
    ? keystone build must be run before running keystone start"
  `)
})

jest.setTimeout(1000000)

test('build works with typescript without the user defining a babel config', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await fs.readFile(`${__dirname}/fixtures/with-ts.ts`, 'utf8'),
  })
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd: tmp,
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
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await fs.readFile(`${__dirname}/fixtures/log-node-env.ts`, 'utf8'),
  })
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd: tmp,
    buffer: true,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  })
  expect(result.exitCode).toBe(0)
  const startResult = execa('node', [cliBinPath, 'start'], {
    reject: false,
    all: true,
    cwd: tmp,
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  })
  let output = ''
  try {
    await Promise.race([
      new Promise((resolve, reject) =>
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
