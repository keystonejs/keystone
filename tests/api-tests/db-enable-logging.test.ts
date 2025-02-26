import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { monitorLogs, waitFor } from './utils'

const runner = (enableLogging: boolean) =>
  setupTestRunner({
    config: {
      db: { enableLogging },
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
  'enableLogging: true enables logging',
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
  'enableLogging: false does not enable logging',
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
