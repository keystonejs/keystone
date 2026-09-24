import type { IncomingMessage, ServerResponse } from 'http'
import { type ExecutionResult, type GraphQLSchema, graphql, print } from 'graphql/index.js'
import type { KeystoneContext, KeystoneGraphQLAPI, KeystoneConfig } from '../../types/index.ts'

import type { InitialisedList } from '../core/initialise-lists.ts'
import { getDbFactory, getQueryFactory } from './api.ts'
import {
  bindTransactionContext,
  snapshotTransactionValue,
  TransactionLifecycle,
} from './transaction-hooks.ts'

export function createContext({
  config,
  lists,
  graphQLSchemas,
  prismaClient,
  prismaTypes,
}: {
  config: KeystoneConfig
  lists: Record<string, InitialisedList>
  graphQLSchemas: {
    public: GraphQLSchema
    internal: GraphQLSchema
  }
  prismaClient: unknown
  prismaTypes: {
    DbNull: unknown
    JsonNull: unknown
  }
}) {
  const dbFactories: Record<string, ReturnType<typeof getDbFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    dbFactories[listKey] = getDbFactory(list, graphQLSchemas.public)
  }

  const dbFactoriesInternal: Record<string, ReturnType<typeof getDbFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    dbFactoriesInternal[listKey] = getDbFactory(list, graphQLSchemas.internal)
  }

  const queryFactories: Record<string, ReturnType<typeof getQueryFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    queryFactories[listKey] = getQueryFactory(list, graphQLSchemas.public)
  }

  const queryFactoriesInternal: Record<string, ReturnType<typeof getQueryFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    queryFactoriesInternal[listKey] = getQueryFactory(list, graphQLSchemas.internal)
  }

  const construct = ({
    prisma,
    req,
    res,
    session,
    internal,
    sudo,
    transactionLifecycle,
  }: {
    prisma: any
    req?: IncomingMessage
    res?: ServerResponse
    session?: unknown
    internal: boolean
    sudo: boolean
    transactionLifecycle?: TransactionLifecycle
  }) => {
    const schema = internal ? graphQLSchemas.internal : graphQLSchemas.public
    const rawGraphQL: KeystoneGraphQLAPI['raw'] = async ({ query, variables }) => {
      const source = typeof query === 'string' ? query : print(query)
      return (await graphql({
        schema,
        source,
        contextValue: context,
        variableValues: variables,
      })) as ExecutionResult<any>
    }

    const runGraphQL: KeystoneGraphQLAPI['run'] = async ({ query, variables }) => {
      const result = await rawGraphQL({ query, variables })
      if (result.errors?.length) throw result.errors[0]
      return result.data as any
    }

    const context: KeystoneContext = {
      prisma,
      db: {},
      query: {},
      graphql: { raw: rawGraphQL, run: runGraphQL, schema },

      transaction: async (f, opts) => {
        if (transactionLifecycle) {
          throw new Error('Nested context.transaction() calls are not supported')
        }

        const lifecycle = new TransactionLifecycle()
        let result
        try {
          result = await prisma.$transaction(async (prisma_: any) => {
            const newContext = construct({
              prisma: prisma_,
              req,
              res,
              session,
              internal,
              sudo,
              transactionLifecycle: lifecycle,
            })

            return await f(newContext)
          }, opts)
        } catch (error) {
          try {
            await lifecycle.settle('afterRollback', error)
          } catch (hookError) {
            // Rollback callback failures must not replace the original transaction failure.
            console.error(hookError)
          }
          throw error
        }

        // Keep this outside the catch: a callback failure cannot roll back committed data.
        await lifecycle.settle('afterCommit')
        return result
      },

      req,
      res,
      sessionStrategy: config.session,
      ...(session ? { session } : {}),

      withRequest: async (newReq, newRes) => {
        const newContext = construct({
          prisma,
          req: newReq,
          res: newRes,
          session,
          internal,
          sudo,
          transactionLifecycle,
        })
        return newContext.withSession(
          (await config.session?.get({ context: newContext })) ?? undefined
        )
      },

      withSession: session => {
        return construct({ prisma, req, res, session, internal, sudo, transactionLifecycle })
      },

      // privilege escalation
      internal: () =>
        construct({ prisma, req, res, session, internal: true, sudo, transactionLifecycle }),
      sudo: () =>
        construct({ prisma, req, res, session, internal: true, sudo: true, transactionLifecycle }),

      __internal: {
        sudo,
        lists,
        prisma: {
          ...prismaTypes,
        },
      },
    }

    if (transactionLifecycle) {
      bindTransactionContext(context, transactionLifecycle, () =>
        construct({
          prisma: prismaClient,
          req,
          res,
          session: snapshotTransactionValue(context.session),
          internal,
          sudo,
        })
      )
    }

    const _dbFactories = internal ? dbFactoriesInternal : dbFactories
    const _queryFactories = internal ? queryFactoriesInternal : queryFactories

    for (const listKey of Object.keys(lists)) {
      context.db[listKey] = _dbFactories[listKey](context)
      context.query[listKey] = _queryFactories[listKey](context)
    }

    return context
  }

  return construct({
    prisma: prismaClient,
    internal: false,
    sudo: false,
  })
}
