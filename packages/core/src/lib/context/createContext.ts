import {
  type IncomingMessage,
  type ServerResponse
} from 'http'
import {
  type ExecutionResult,
  type GraphQLSchema,
  graphql,
  print
} from 'graphql'
import {
  type KeystoneContext,
  type KeystoneGraphQLAPI,
  type __ResolvedKeystoneConfig,
} from '../../types'

import { type InitialisedList } from '../core/initialise-lists'
import { createImagesContext } from '../assets/createImagesContext'
import { createFilesContext } from '../assets/createFilesContext'
import { getDbFactory, getQueryFactory } from './api'

export function createContext ({
  config,
  lists,
  graphQLSchema,
  graphQLSchemaSudo,
  prismaClient,
  prismaTypes
}: {
  config: __ResolvedKeystoneConfig
  lists: Record<string, InitialisedList>
  graphQLSchema: GraphQLSchema
  graphQLSchemaSudo: GraphQLSchema
  prismaClient: unknown
  prismaTypes: {
    DbNull: unknown
    JsonNull: unknown
  }
}) {
  const dbFactories: Record<string, ReturnType<typeof getDbFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    dbFactories[listKey] = getDbFactory(list, graphQLSchema)
  }

  const dbFactoriesSudo: Record<string, ReturnType<typeof getDbFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    dbFactoriesSudo[listKey] = getDbFactory(list, graphQLSchemaSudo)
  }

  const queryFactories: Record<string, ReturnType<typeof getQueryFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    queryFactories[listKey] = getQueryFactory(list, graphQLSchema)
  }

  const queryFactoriesSudo: Record<string, ReturnType<typeof getQueryFactory>> = {}
  for (const [listKey, list] of Object.entries(lists)) {
    queryFactoriesSudo[listKey] = getQueryFactory(list, graphQLSchemaSudo)
  }

  const images = createImagesContext(config)
  const files = createFilesContext(config)
  const construct = ({
    prisma,
    session,
    sudo,
    req,
    res,
  }: {
    prisma: any
    session?: unknown
    sudo: boolean
    req?: IncomingMessage
    res?: ServerResponse
  }) => {
    const schema = sudo ? graphQLSchemaSudo : graphQLSchema
    const rawGraphQL: KeystoneGraphQLAPI['raw'] = async ({ query, variables }) => {
      const source = typeof query === 'string' ? query : print(query)
      return await graphql({
        schema,
        source,
        contextValue: context,
        variableValues: variables,
      }) as ExecutionResult<any>
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

      sudo: () => construct({ prisma, session, sudo: true, req, res }),

      transaction: async (f, opts) => {
        return await prisma.$transaction(async (prisma_: any) => {
          const newContext = construct({
            prisma: prisma_,
            session,
            sudo,
            req,
            res
          })

          return await f(newContext)
        }, opts)
      },

      req,
      res,
      sessionStrategy: config.session,
      ...(session ? { session } : {}),

      withRequest: async (newReq, newRes) => {
        const newContext = construct({
          prisma,
          session,
          sudo,
          req: newReq,
          res: newRes,
        })
        return newContext.withSession(await config.session?.get({ context: newContext }) ?? undefined)
      },

      withSession: session => {
        return construct({ prisma, session, sudo, req, res })
      },

      images,
      files,

      __internal: {
        lists,
        prisma: {
          ...prismaTypes
        }
      }
    }

    const _dbFactories = sudo ? dbFactoriesSudo : dbFactories
    const _queryFactories = sudo ? queryFactoriesSudo : queryFactories

    for (const listKey of Object.keys(lists)) {
      context.db[listKey] = _dbFactories[listKey](context)
      context.query[listKey] = _queryFactories[listKey](context)
    }

    return context
  }

  return construct({
    prisma: prismaClient,
    session: undefined,
    sudo: false
  })
}
