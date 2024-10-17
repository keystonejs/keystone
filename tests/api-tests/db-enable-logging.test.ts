import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'

const runner = (enableLogging: boolean) =>
  setupTestRunner({
    config: {
      db: { enableLogging },
      lists: {
        User: list({
          access: allowAll,
          fields: {
            name: text()
          },
        }),
      },
    },
  })

test(
  'enableLogging: true enables logging',
  runner(true)(async ({ context }) => {
    const prevConsoleLog = console.log
    const logs: unknown[][] = []
    console.log = (...args) => {
      logs.push(args.map(x => (typeof x === 'string' ? x.replace(/[^ -~]/g, '^') : x)))
    }
    try {
      expect(await context.query.User.findMany()).toEqual([])
      expect(logs).toEqual([
        [
          expect.stringContaining('prisma:query'),
          expect.stringContaining('SELECT '),
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
    const prevConsoleLog = console.log
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
