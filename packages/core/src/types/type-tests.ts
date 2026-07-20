import type { KeystoneContext } from './context'
import type { BaseListTypeInfo } from './type-info'
import type { DatabaseProvider } from './core'

const someContext: KeystoneContext<{
  lists: {
    Singleton: BaseListTypeInfo & { isSingleton: true }
    List: BaseListTypeInfo & { isSingleton: false }
    ListOrSingleton: BaseListTypeInfo
  }
  prisma: any
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
