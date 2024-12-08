import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import ms from 'ms'
import {
  getFiles,
  introspectDatabase,
  recordConsole,
  cliMock,
  spawnCommand,
  symlinkKeystoneDeps,
  testdir,
} from './utils'

const dbUrl = 'file:./app.db'
const config0 = fs.readFileSync(`${__dirname}/fixtures/no-fields.ts`, 'utf8')
const config1 = fs.readFileSync(`${__dirname}/fixtures/one-field.ts`, 'utf8')
const config2 = fs.readFileSync(`${__dirname}/fixtures/two-fields.ts`, 'utf8')

const schema1 = `generator client {
  provider = "prisma-client-js"
  output   = "node_modules/.testprisma/client"
}

datasource sqlite {
  provider          = "sqlite"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

model Todo {
  id    String @id @default(cuid())
  title String @default("")
}


`

const schema2 = `generator client {
  provider = "prisma-client-js"
  output   = "node_modules/.testprisma/client"
}

datasource sqlite {
  provider          = "sqlite"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

model Todo {
  id         String  @id @default(cuid())
  title      String  @default("")
  isComplete Boolean @default(false)
}


`

let mockPromptResponseEntries: [string, string | boolean][] = []

jest.setTimeout(ms('1 minute')) // these tests are slow

jest.mock('prompts', () => {
  return function (
    args:
      | { name: 'value', type: 'text', message: string }
      | { name: 'value', type: 'confirm', message: string, initial: boolean }
  ) {
    const getPromptAnswer = (message: string) => {
      message = message.replace(/[^ -~\n]+/g, '?')
      const response = mockPromptResponseEntries.shift()!
      if (!response) {
        throw new Error(
          `The prompt question "${message}" was asked but there are no responses left`
        )
      }
      const [expectedMessage, answer] = response
      if (expectedMessage !== message) {
        throw new Error(
          `The expected prompt question was "${expectedMessage}" but the actual question was "${message}"`
        )
      }
      return answer
    }

    if (args.type === 'confirm') {
      const answer = getPromptAnswer(args.message)
      if (typeof answer === 'string') {
        throw new Error(
          `The answer to "${args.message}" is a string but the question is a confirm prompt that should return a boolean`
        )
      }
      console.log(`Prompt: ${args.message} ${answer}`)
      return { value: answer }
    } else {
      const answer = getPromptAnswer(args.message)
      if (typeof answer === 'boolean') {
        throw new Error(
          `The answer to "${args.message}" is a boolean but the question is a text prompt that should return a string`
        )
      }
      console.log(`Prompt: ${args.message} ${answer}`)
      return { value: answer }
    }
  }
})

function getPrismaClient (cwd: string) {
  return new (require(path.join(cwd, 'node_modules/.testprisma/client')).PrismaClient)({
    datasources: { sqlite: { url: dbUrl } },
  })
}

describe('dev', () => {
  async function setupInitialProject () {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': config1,
    })
    const stopRecording = recordConsole()

    await cliMock(cwd, 'dev')
    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1)
    expect(stopRecording()).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Server listening on :3000 (http://localhost:3000/)
      ? GraphQL API available at /api/graphql
      ? Generating GraphQL and Prisma schemas
      ? Database created
      ? Database synchronized with Prisma schema
      ? Connecting to the database
      ? Creating server
      ? GraphQL API ready"
    `)
    return cwd
  }

  test('creates database and pushes schema from empty', async () => {
    await setupInitialProject()
  })

  test('logs correctly when things are already up to date', async () => {
    const cwd = await setupInitialProject()
    const stopRecording = recordConsole()
    await cliMock(cwd, 'dev')

    expect(stopRecording()).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Server listening on :3000 (http://localhost:3000/)
      ? GraphQL API available at /api/graphql
      ? Generating GraphQL and Prisma schemas
      ? Database unchanged
      ? Connecting to the database
      ? Creating server
      ? GraphQL API ready"
    `)
  })

  test('warns when dropping field that has data in it', async () => {
    const prevCwd = await setupInitialProject()
    const prismaClient = getPrismaClient(prevCwd)
    await prismaClient.todo.create({ data: { title: 'todo' } })
    await prismaClient.$disconnect()

    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': config0,
    })

    mockPromptResponseEntries = [['Do you want to continue? Some data will be lost', true]]
    const stopRecording = recordConsole()
    await cliMock(cwd, 'dev')

    expect(stopRecording()).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Server listening on :3000 (http://localhost:3000/)
      ? GraphQL API available at /api/graphql
      ? Generating GraphQL and Prisma schemas

      ?  Warnings:

        ? You are about to drop the column \`title\` on the \`Todo\` table, which still contains 1 non-null values.
      Prompt: Do you want to continue? Some data will be lost true
      ? Database synchronized with Prisma schema
      ? Connecting to the database
      ? Creating server
      ? GraphQL API ready"
    `)

    expect(await introspectDatabase(cwd, dbUrl)).toMatchInlineSnapshot(`
      "generator client {
        provider = "prisma-client-js"
        output   = "node_modules/.testprisma/client"
      }

      datasource sqlite {
        provider          = "sqlite"
        url               = env("DATABASE_URL")
        shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
      }

      model Todo {
        id String @id @default(cuid())
      }


      "
    `)
  })

  test('exits when refusing data loss prompt', async () => {
    const prevCwd = await setupInitialProject()
    const prismaClient = getPrismaClient(prevCwd)
    await prismaClient.todo.create({ data: { title: 'todo' } })
    await prismaClient.$disconnect()
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': config0,
    })

    mockPromptResponseEntries = [['Do you want to continue? Some data will be lost', false]]
    const stopRecording = recordConsole()
    await expect(cliMock(cwd, 'dev')).rejects.toEqual(expect.objectContaining({ code: 0 }))

    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1)
    expect(stopRecording()).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Server listening on :3000 (http://localhost:3000/)
      ? GraphQL API available at /api/graphql
      ? Generating GraphQL and Prisma schemas

      ?  Warnings:

        ? You are about to drop the column \`title\` on the \`Todo\` table, which still contains 1 non-null values.
      Prompt: Do you want to continue? Some data will be lost false
      Push cancelled"
    `)
  })
})

async function getDatabaseFiles (cwd: string) {
  return getFiles(cwd, ['app.db', 'migrations/**/*'], null)
}

describe('prisma', () => {
  test.concurrent('prisma db push --force-reset works', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': config1,
    })

    await spawnCommand(cwd, ['build', '--no-ui'])
    await spawnCommand(cwd, ['prisma', 'db', 'push'])
    {
      const prismaClient = getPrismaClient(cwd)
      await prismaClient.todo.create({ data: { title: 'something' } })
      expect(await prismaClient.todo.findMany()).toHaveLength(1)
      await prismaClient.$disconnect()
    }

    await spawnCommand(cwd, ['prisma', 'db', 'push', '--force-reset'])
    const output = await spawnCommand(cwd, ['build', '--frozen', '--no-ui'])
    {
      const prismaClient = getPrismaClient(cwd)
      expect(await prismaClient.todo.findMany()).toHaveLength(0)
      await prismaClient.$disconnect()
    }

    expect(
      output
        .replace(/[^ -~\n]+/g, '?')
    ).toMatchInlineSnapshot(`
      "? GraphQL and Prisma schemas are up to date
      "
    `)
  })
})

describe('start --with-migrations', () => {
  test.concurrent('apply init migrations', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': config1,
    })

    await spawnCommand(cwd, ['build', '--no-ui'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'dev', '--name', 'init', '--create-only'])
    expect(await introspectDatabase(cwd, dbUrl)).toEqual('') // empty

    const output = await spawnCommand(cwd, ['start', '--no-server', '--no-ui', '--with-migrations'])
    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1) // migrated

    expect(
      output
        .replace(/\d+_/, '') // migrations are prefixed with a timestamp
        .replace(/\d+ms/g, '0ms')
        .replace(/[^ -~\n]+/g, '?')
    ).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Applying any database migrations
      Applying migration \`init\`
      ? Database migrated
      "
    `)
  })

  test.concurrent('apply any migrations', async () => {
    // step 1, init
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.ts': config1,
    })

    await spawnCommand(cwd, ['build', '--no-ui'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'dev', '--name', 'init', '--create-only'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'deploy'])
    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1)

    // step 2, add a field
    await fsp.writeFile(`${cwd}/keystone.ts`, config2)
    await spawnCommand(cwd, ['build', '--no-ui'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'dev', '--name', 'add', '--create-only'])

    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1) // unchanged
    const output = await spawnCommand(cwd, ['start', '--no-server', '--no-ui', '--with-migrations'])
    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema2) // migrated

    expect(
      output
        .replace(/\d+_/, '') // migrations are prefixed with a timestamp
        .replace(/\d+ms/g, '0ms')
        .replace(/[^ -~\n]+/g, '?')
    ).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Applying any database migrations
      Applying migration \`add\`
      ? Database migrated
      "
    `)
  })

  test.concurrent('no migrations', async () => {
    const cwd = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': config1,
    })
    await spawnCommand(cwd, ['build', '--no-ui'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'dev', '--name', 'init', '--create-only'])
    await spawnCommand(cwd, ['prisma', 'migrate', 'deploy'])

    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1) // unchanged
    const output = await spawnCommand(cwd, ['start', '--no-server', '--no-ui', '--with-migrations'])
    expect(await introspectDatabase(cwd, dbUrl)).toEqual(schema1) // unchanged

    expect(output.replace(/[^ -~\n]+/g, '?')).toMatchInlineSnapshot(`
      "? Starting Keystone
      ? Applying any database migrations
      ? No database migrations to apply
      "
    `)
  })
})
