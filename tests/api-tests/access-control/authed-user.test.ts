import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, password } from '@keystone-6/core/fields'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'

import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { testConfig } from '../utils'

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id',
})

const lists = {
  User: list({
    fields: {
      name: text(),
      email: text({ isIndexed: 'unique' }),
      password: password(),
      noRead: text({ access: { read: () => false } }),
      yesRead: text({ access: { read: () => true } }),
    },
    access: allowAll,
  }),
}

const config = auth.withAuth(
  testConfig({
    lists,
    session: statelessSessions(),
  })
)

const runner = setupTestRunner({ config })

test(
  'authenticatedItem',
  runner(async ({ context }) => {
    const user = (await context.query.User.createOne({
      data: { name: 'test', yesRead: 'yes', noRead: 'no' },
      query: 'id name yesRead noRead',
    })) as { id: string, name: string, yesRead: string, noRead: string }

    const query = `query { authenticatedItem { ... on User { id yesRead noRead } } }`
    const _context = context.withSession({
      itemId: user.id,
      listKey: 'User',
      data: user,
    })
    const { data, errors } = await _context.graphql.raw({ query })
    expect(data).toEqual({
      authenticatedItem: { id: user.id, yesRead: user.yesRead, noRead: null },
    })
    expect(errors).toBe(undefined)
  })
)
