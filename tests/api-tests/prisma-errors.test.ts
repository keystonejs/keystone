import { g, list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

import { setupTestRunner } from './test-runner'
import type { KeystoneContext } from '@keystone-6/core/types'
import { dbProvider } from './utils'

const extendGraphqlSchema = g.extend(base => ({
  mutation: {
    createUserViaContextDb: g.field({
      type: base.object('User'),
      async resolve(_, __, context: KeystoneContext) {
        return context.db.User.createOne({ data: { name: 'User' } })
      },
    }),
    createUserViaContextQuery: g.field({
      type: base.object('User'),
      async resolve(_, __, context: KeystoneContext) {
        const user = await context.query.User.createOne({ data: { name: 'User' } })
        return context.db.User.findOne({ where: { id: user.id } })
      },
    }),
    createUserViaGraphQLRun: g.field({
      type: base.object('User'),
      async resolve(_, __, context: KeystoneContext) {
        const data = await context.graphql.run({
          query: 'mutation { createUser(data: { name: "User" }) { id } }',
        })
        return context.db.User.findOne({ where: { id: (data as any).createUser.id } })
      },
    }),
  },
}))

for (const name of ['with custom formatError', 'without custom formatError'] as const) {
  describe(name, () => {
    const extraExtensions = name === 'with custom formatError' ? { someCustomThing: true } : {}
    const runner = (debug: boolean) =>
      setupTestRunner({
        serve: true,
        config: {
          lists: {
            User: list({
              access: allowAll,
              fields: {
                name: text({ isIndexed: 'unique' }),
              },
            }),
          },
          graphql: {
            debug,
            extendGraphqlSchema,
            apolloConfig:
              name === 'with custom formatError'
                ? {
                    formatError: formattedError => {
                      return {
                        ...formattedError,
                        extensions: { ...formattedError.extensions, ...extraExtensions },
                      }
                    },
                  }
                : undefined,
          },
        },
      })

    for (const query of [
      'createUser',
      'createUserViaContextDb',
      'createUserViaContextQuery',
      'createUserViaGraphQLRun',
    ]) {
      test(
        `details of prisma error are shown in debug when debug is enabled with ${query}`,
        runner(true)(async ({ gql }) => {
          const doc = `mutation { ${query}${query === 'createUser' ? '(data: { name: "User" })' : ''} { id } }`
          expect(await gql({ query: doc })).toEqual({
            data: {
              [query]: { id: expect.any(String) },
            },
          })
          const result = await gql({ query: doc })
          expect(result).toEqual({
            data: { [query]: null },
            errors: [
              {
                extensions: {
                  stacktrace: expect.any(Array),
                  code: 'KS_PRISMA_ERROR',
                  ...extraExtensions,
                },
                ...(query === 'createUser' || query === 'createUserViaGraphQLRun'
                  ? { locations: [{ line: 1, column: 12 }] }
                  : {}),
                // interesting that it's always `createUser` here
                // it makes sense since the error comes from there in all cases
                // but weird that it's not an accurate path into the query the consumer
                // actually runs
                path: ['createUser'],
                message: 'Prisma error',
              },
            ],
          })
          expect(result.errors[0].extensions.stacktrace.slice(0, 5)).toEqual([
            'PrismaClientKnownRequestError: ',
            'Invalid `prisma.user.create()` invocation:',
            '',
            '',
            `Unique constraint failed on the ${dbProvider === 'mysql' ? 'constraint: `User_name_key`' : 'fields: (`name`)'}`,
          ])
        })
      )
    }

    for (const query of [
      'createUser',
      'createUserViaContextDb',
      'createUserViaContextQuery',
      'createUserViaGraphQLRun',
    ]) {
      test(
        `no details of prisma error are shown beyond that it's a prima error when debug is disabled with ${query}`,
        runner(false)(async ({ gql }) => {
          const doc = `mutation { ${query}${query === 'createUser' ? '(data: { name: "User" })' : ''} { id } }`
          expect(await gql({ query: doc })).toEqual({
            data: {
              [query]: { id: expect.any(String) },
            },
          })
          const result = await gql({ query: doc })
          expect(result).toEqual({
            data: { [query]: null },
            errors: [
              {
                extensions: {
                  code: 'KS_PRISMA_ERROR',
                  ...extraExtensions,
                },
                ...(query === 'createUser' || query === 'createUserViaGraphQLRun'
                  ? { locations: [{ line: 1, column: 12 }] }
                  : {}),
                path: ['createUser'],
                message: 'Prisma error',
              },
            ],
          })
        })
      )
    }
  })
}
