import { list, graphql } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

import { setupTestRunner } from './test-runner'
import { expectInternalServerError } from './utils'

const falseFn: (...args: any) => boolean = () => false

function withAccessCheck <T, Args extends unknown[]> (
  access: boolean | ((...args: Args) => boolean),
  resolver: (...args: Args) => T
): ((...args: Args) => T) {
  return (...args: Args) => {
    if (typeof access === 'function') {
      if (!access(...args)) {
        throw new Error('Access denied')
      }
    } else if (!access) {
      throw new Error('Access denied')
    }
    return resolver(...args)
  }
}

const runner = setupTestRunner({
  serve: true,
  config: ({
    lists: {
      User: list({
        access: allowAll,
        fields: { name: text() },
      }),
    },
    graphql: {
      extendGraphqlSchema: graphql.extend(() => {
        return {
          mutation: {
            triple: graphql.field({
              type: graphql.Int,
              args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
              resolve: withAccessCheck(true, (_, { x }: { x: number }) => 3 * x),
            }),
          },
          query: {
            double: graphql.field({
              type: graphql.Int,
              args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
              resolve: withAccessCheck(true, (_, { x }: { x: number }) => 2 * x),
            }),
            quads: graphql.field({
              type: graphql.Int,
              args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
              resolve: withAccessCheck(falseFn, (_, { x }: { x: number }) => 4 * x),
            }),
          },
        }
      })
    }
  }),
})

describe('extendGraphqlSchema', () => {
  it(
    'Executes custom queries correctly',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              query {
                double(x: 10)
              }
            `,
      })
      expect(data).toEqual({ double: 20 })
    })
  )
  it(
    'Denies access acording to access control',
    runner(async ({ gqlSuper }) => {
      const { body } = await gqlSuper({
        query: `
          query {
            quads(x: 10)
          }
        `,
      })
      expect(body.data).toEqual({ quads: null })
      expectInternalServerError(body.errors, [{ path: ['quads'], message: 'Access denied' }])
    })
  )
  it(
    'Executes custom mutations correctly',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              mutation {
                triple(x: 10)
              }
            `,
      })

      expect(data).toEqual({ triple: 30 })
    })
  )
  it(
    'Default keystone resolvers remain unchanged',
    runner(async ({ context }) => {
      const data = await context.graphql.run({
        query: `
              mutation {
                createUser(data: { name: "Real User" }) {
                  name
                }
              }
            `,
      })

      expect(data).toEqual({ createUser: { name: 'Real User' } })
    })
  )
})
