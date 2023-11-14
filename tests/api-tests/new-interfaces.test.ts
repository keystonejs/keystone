import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { testConfig } from './utils'

const runner = setupTestRunner({
  config: testConfig({
    lists: {
      User: list({ access: allowAll, fields: { name: text() } }),
    },
  }),
})

test(
  'Smoke test',
  runner(async ({ context }) => {
    const users = await context.db.User.findMany({})
    expect(users).toEqual([])
  })
)
