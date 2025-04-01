import { type ExecutionResult, type GraphQLSchema, graphql, print } from 'graphql'
import type { KeystoneContext, KeystoneGraphQLAPI, KeystoneConfig } from '../../types'

import { type InitialisedList } from '../core/initialise-lists'
import { getDbFactory, getQueryFactory } from './api'
import type { OutgoingMessage } from 'http'

export function createContext({
  config,
  lists,
  graphQLSchema,
  graphQLSchemaSudo,
  prismaClient,
  prismaTypes,
}: {
  config: KeystoneConfig
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
    req?: KeystoneContext['req']
    res?: KeystoneContext['res']
  }) => {
    const schema = sudo ? graphQLSchemaSudo : graphQLSchema
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

      sudo: () => construct({ prisma, session, sudo: true, req, res }),

      transaction: async (f, opts) => {
        return await prisma.$transaction(async (prisma_: any) => {
          const newContext = construct({
            prisma: prisma_,
            session,
            sudo,
            req,
            res,
          })

          return await f(newContext)
        }, opts)
      },

      req,
      res,
      // sessionStrategy: config.session,
      ...(session ? { session } : {}),
      withNodeRequest: async (req, res) => {
        return context.withRequest(
          {
            headers: new Headers(
              Object.entries(req.headers).flatMap(([key, value]): [string, string][] =>
                value
                  ? Array.isArray(value)
                    ? value.map(inner => [key, inner])
                    : [[key, value]]
                  : []
              )
            ),
            nodeReq: req,
          },
          res ? { headers: new HeadersWithSettingOnNodeResponse(res) } : undefined
        )
      },
      withRequest: async (newReq, newRes) => {
        const newContext = construct({
          prisma,
          session,
          sudo,
          req: newReq,
          res: newRes,
        })
        return newContext.withSession(
          (await config.session?.({ context: newContext })) ?? undefined
        )
      },

      withSession: session => {
        return construct({ prisma, session, sudo, req, res })
      },

      __internal: {
        lists,
        prisma: {
          ...prismaTypes,
        },
      },
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
    sudo: false,
  })
}

class HeadersWithSettingOnNodeResponse extends Headers {
  #propogateTo: OutgoingMessage
  constructor(propogateTo: OutgoingMessage, init?: HeadersInit) {
    super(init)
    this.#propogateTo = propogateTo
  }
  append(name: string, value: string): void {
    super.append(name, value)
    this.#propogateTo.appendHeader(name, value)
  }
  delete(name: string): void {
    super.delete(name)
    this.#propogateTo.removeHeader(name)
  }
  set(name: string, value: string): void {
    super.set(name, value)
    this.#propogateTo.setHeader(name, value)
  }
}
