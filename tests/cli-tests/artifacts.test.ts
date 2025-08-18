import {
  basicKeystoneConfig,
  cliMock,
  getFiles,
  recordConsole,
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

    await expect(cliMock(cwd, command)).rejects.toEqual(
      new Error('Your Prisma and GraphQL schemas are not up to date')
    )
  })
})

describe('prisma migrate status', () => {
  test('logs an error and exits with 1 when the schemas do not exist', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    })
    await expect(cliMock(cwd, ['build', '--no-ui', '--frozen'])).rejects.toEqual(
      new Error('Your Prisma and GraphQL schemas are not up to date')
    )
    await expect(cliMock(cwd, ['prisma', '--frozen', 'migrate', 'status'])).rejects.toEqual(
      new Error('Your Prisma and GraphQL schemas are not up to date')
    )
  })
})

const schemasMatch = ['schema.prisma', 'schema.graphql']

// a lot of these cases are also the same for prisma and build commands but we don't include them here
// because when they're slow and then run the same code as the postinstall command
// (and in the case of the build command we need to spawn a child process which would make each case take a _very_ long time)
describe('postinstall', () => {
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

// uncomment when you need to update the schemas
// import fs from 'node:fs/promises'
// test.only('update', async () => {
//   const cwd = await testdir({
//     ...symlinkKeystoneDeps,
//     'keystone.js': basicKeystoneConfig,
//   })
//   await cliMock(cwd, ['build', '--no-ui'])
//   await fs.cp(`${cwd}/schema.graphql`, `${__dirname}/fixtures/basic-project/schema.graphql`)
//   await fs.cp(`${cwd}/schema.prisma`, `${__dirname}/fixtures/basic-project/schema.prisma`)
// })
