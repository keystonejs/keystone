import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { monitorLogs, prismaClientOptions, waitFor } from './utils'

const runner = (enableLogging: boolean) =>
  setupTestRunner({
    config: {
      db: {
        prismaClientOptions: url => ({
          ...prismaClientOptions(url),
          log: enableLogging ? ['query'] : [],
        }),
      },
      lists: {
        User: list({
          access: allowAll,
          fields: {
            name: text(),
          },
        }),
      },
    },
  })

test(
  'Prisma client query logging can be enabled',
  runner(true)(async ({ context }) => {
    const monitor = monitorLogs()
    try {
      expect(await context.query.User.findMany()).toEqual([])
      await waitFor(() => {
        expect(monitor.logs).toEqual([
          [expect.stringContaining('prisma:query'), expect.stringContaining('SELECT ')],
        ])
      })
    } finally {
      monitor.cleanup()
    }
  })
)

test(
  'Prisma client query logging can be disabled',
  runner(false)(async ({ context }) => {
    const monitor = monitorLogs()
    try {
      expect(await context.query.User.findMany()).toEqual([])
      expect(monitor.logs).toHaveLength(0)
    } finally {
      monitor.cleanup()
    }
  })
)
