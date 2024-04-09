import execa from 'execa'
import { basicKeystoneConfig, cliBinPath, schemas, symlinkKeystoneDeps, testdir } from './utils'

// testing erroring when the schemas are not up to date is in artifacts.test.ts

test('keystone prisma exits with the same code as the prisma child process exits with', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })
  const result = await execa('node', [cliBinPath, 'prisma', 'bad-thing'], {
    reject: false,
    all: true,
    cwd: tmp,
  })
  expect(result.all!.replace(/[^ -~\n]/g, '?').replace(/  \n/g, '\n')).toMatchSnapshot()
  expect(result.exitCode).toBe(1)
})

test('keystone prisma uses the db url in the keystone config', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  })
  const result = await execa('node', [cliBinPath, 'prisma', 'migrate', 'status'], {
    reject: false,
    all: true,
    cwd: tmp,
  })
  expect(result.all!.replace(/[^ -~\n]/g, '?').replace(/  \n/g, '\n')).toMatchSnapshot()
  expect(result.exitCode).toBe(1)
})
