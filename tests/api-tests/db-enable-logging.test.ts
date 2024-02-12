import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { testConfig, dbProvider } from './utils'

const runner = (enableLogging: boolean) =>
  setupTestRunner({
    config: testConfig({
      db: { enableLogging },
      lists: {
        User: list({
          access: allowAll,
          fields: {
            name: text()
          },
        }),
      },
    }),
  })

test(
  'enableLogging: true enables logging',
  runner(true)(async ({ context }) => {
    let prevConsoleLog = console.log
    const logs: unknown[][] = []
    console.log = (...args) => {
      logs.push(args.map(x => (typeof x === 'string' ? x.replace(/[^ -~]/g, '^') : x)))
    }
    try {
      expect(await context.query.User.findMany()).toEqual([])
      expect(logs).toEqual([
        [
          expect.stringContaining('prisma:query'),
          dbProvider === 'sqlite'
            ? 'SELECT `main`.`User`.`id`, `main`.`User`.`name` FROM `main`.`User` WHERE 1=1 LIMIT ? OFFSET ?'
            : dbProvider === 'mysql'
            ? 'SELECT `test_db`.`User`.`id`, `test_db`.`User`.`name` FROM `test_db`.`User` WHERE 1=1'
            : 'SELECT "public"."User"."id", "public"."User"."name" FROM "public"."User" WHERE 1=1 OFFSET $1',
        ],
      ])
    } finally {
      console.log = prevConsoleLog
    }
  })
)

test(
  'enableLogging: false does not enable logging',
  runner(false)(async ({ context }) => {
    let prevConsoleLog = console.log
    let didLog = false
    console.log = () => {
      didLog = true
    }
    try {
      expect(await context.query.User.findMany()).toEqual([])
      expect(didLog).toEqual(false)
    } finally {
      console.log = prevConsoleLog
    }
  })
)
