import { ExitError } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'

import {
  basicKeystoneConfig,
  getFiles,
  recordConsole,
  cliMock,
  schemas,
  symlinkKeystoneDeps,
  testdir,
} from './utils'

describe.each(['postinstall', ['build', '--frozen']])('%s', command => {
  test('logs an error and exits with 1 when the schemas do not exist', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    })

    const recording = recordConsole()
    await expect(cliMock(cwd, command)).rejects.toEqual(new ExitError(1))

    expect(recording()).toMatchInlineSnapshot(`"Your Prisma and GraphQL schemas are not up to date"`)
  })
})

describe('prisma migrate status', () => {
  test('logs an error and exits with 1 when the schemas do not exist', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    })
    await expect(cliMock(cwd, ['build', '--no-ui', '--frozen'])).rejects.toEqual(new ExitError(1))

    const recording = recordConsole()
    await expect(cliMock(cwd, ['prisma', '--frozen', 'migrate', 'status'])).rejects.toEqual(new ExitError(1))

    expect(recording()).toMatchInlineSnapshot(`"Your Prisma and GraphQL schemas are not up to date"`)
  })
})

const schemasMatch = ['schema.prisma', 'schema.graphql']

// a lot of these cases are also the same for prisma and build commands but we don't include them here
// because when they're slow and then run the same code as the postinstall command
// (and in the case of the build command we need to spawn a child process which would make each case take a _very_ long time)
describe('postinstall', () => {
  test('updates the schemas without prompting when --fix is passed', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    })

    const recording = recordConsole()
    await cliMock(cwd, ['postinstall', '--fix'])
    const files = await getFiles(cwd, schemasMatch)

    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`, schemasMatch))
    expect(recording()).toMatchInlineSnapshot(`"? Generated GraphQL and Prisma schemas"`)
  })

  test("does not prompt, error or modify the schemas if they're already up to date", async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': basicKeystoneConfig,
    })

    const recording = recordConsole()
    await cliMock(cwd, 'postinstall')
    const files = await getFiles(cwd, schemasMatch)

    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`, schemasMatch))
    expect(recording()).toMatchInlineSnapshot(`"? GraphQL and Prisma schemas are up to date"`)
  })

  test('writes the correct node_modules files', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': basicKeystoneConfig,
    })

    const recording = recordConsole()
    await cliMock(cwd, 'postinstall')

    expect(await getFiles(cwd, ['node_modules/.keystone/**/*'])).toMatchSnapshot()
    expect(recording()).toMatchInlineSnapshot(`"? GraphQL and Prisma schemas are up to date"`)
  })
})
