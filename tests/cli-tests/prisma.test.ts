import {
  basicKeystoneConfig,
  schemas,
  spawnCommand,
  spawnCommand2,
  symlinkKeystoneDeps,
  testdir
} from './utils'

// testing erroring when the schemas are not up to date is in artifacts.test.ts

test('keystone prisma exits with the same code as the prisma child process exits with', async () => {
  const cwd = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })

  await spawnCommand(cwd, ['build', '--no-ui'])
  const { exitCode, output } = await spawnCommand2(cwd, ['prisma', 'foo'])

  expect(exitCode).toEqual(1)
  expect(output.replace(/[^ -~\n]/g, '?').replace(/ {2}\n/g, '\n')).toContain(`Unknown command "foo"`)
})

test('keystone prisma uses the db url in the keystone config', async () => {
  const cwd = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })

  await spawnCommand(cwd, ['build', '--no-ui'])
  const { exitCode, output } = await spawnCommand2(cwd, ['prisma', 'migrate', 'status'])

  expect(exitCode).toEqual(1)
  expect(output.replace(/[^ -~\n]/g, '?').replace(/ {2}\n/g, '\n')).toContain(`file:./app.db`)
})
