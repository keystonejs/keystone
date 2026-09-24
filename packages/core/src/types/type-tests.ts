import type { KeystoneContext } from './context.ts'
import type { BaseListTypeInfo } from './type-info.ts'
import type { DatabaseProvider } from './core.ts'
import { fieldType } from './next-fields.ts'
import { g } from './schema/index.ts'

const someContext: KeystoneContext<{
  lists: {
    Singleton: BaseListTypeInfo & { isSingleton: true }
    List: BaseListTypeInfo & { isSingleton: false }
    ListOrSingleton: BaseListTypeInfo
  }
  prisma: any
  prismaClientOptions: any
  session: any
  dbProvider: 'sqlite'
}> = undefined!

someContext.query.Singleton.findOne({})
someContext.query.Singleton.findOne({ where: { id: '1' } })
// @ts-expect-error
someContext.query.List.findOne({})
someContext.query.List.findOne({ where: { id: '1' } })
// @ts-expect-error
someContext.query.ListOrSingleton.findOne({})
someContext.query.ListOrSingleton.findOne({ where: { id: '1' } })

type TypeInfoForProvider<Provider extends DatabaseProvider> = {
  lists: Record<string, BaseListTypeInfo>
  prisma: any
  session: any
  dbProvider: Provider
}

const postgresContext: KeystoneContext<TypeInfoForProvider<'postgresql'>> = undefined!
postgresContext.transaction(async () => {}, { isolationLevel: 'ReadCommitted' })

const mysqlContext: KeystoneContext<TypeInfoForProvider<'mysql'>> = undefined!
mysqlContext.transaction(async () => {}, { isolationLevel: 'RepeatableRead' })

const sqliteContext: KeystoneContext<TypeInfoForProvider<'sqlite'>> = undefined!
sqliteContext.transaction(async () => {}, { isolationLevel: 'Serializable' })
// @ts-expect-error SQLite only supports Serializable transactions
sqliteContext.transaction(async () => {}, { isolationLevel: 'ReadCommitted' })

// Exact selector conversion has its own input type and stored-value contract;
// it does not need a mutation resolver or an independently unique database field.
fieldType({ kind: 'scalar', scalar: 'Int', mode: 'optional' })({
  views: '',
  output: g.field({ type: g.Int }),
  input: {
    uniqueWhereValue: {
      arg: g.arg({ type: g.String }),
      resolve(value) {
        const input: string = value
        // @ts-expect-error the GraphQL string argument is not a number
        const invalid: number = value
        return Number(input)
      },
    },
  },
})

fieldType({ kind: 'scalar', scalar: 'Int', mode: 'optional' })({
  views: '',
  output: g.field({ type: g.Int }),
  input: {
    uniqueWhereValue: {
      arg: g.arg({ type: g.String }),
      // @ts-expect-error return an exact stored integer, not a filter
      resolve: value => ({ equals: Number(value) }),
    },
  },
})

fieldType({ kind: 'scalar', scalar: 'Int', mode: 'optional' })({
  views: '',
  output: g.field({ type: g.Int }),
  input: {
    uniqueWhereValue: {
      arg: g.arg({ type: g.String }),
      // @ts-expect-error nullable database columns still require non-null selector values
      resolve: () => null,
    },
  },
})
