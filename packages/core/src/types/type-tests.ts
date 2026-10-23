import type { KeystoneContext } from './context.ts'
import type { BaseKeystoneTypeInfo, BaseListTypeInfo } from './type-info.ts'
import type { DatabaseProvider } from './core.ts'
import type { SimpleFieldTypeInfo } from './next-fields.ts'
import type { FieldHooks, ListHooks } from './config/hooks.ts'

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

type TransactionListInfo = Omit<
  BaseListTypeInfo,
  'key' | 'fields' | 'item' | 'inputs' | 'prisma' | 'all'
> & {
  key: 'Entry'
  fields: 'name'
  item: { id: string; name: string }
  inputs: BaseListTypeInfo['inputs'] & { create: { name: string }; update: { name?: string } }
  prisma: { create: { name: string }; update: { name?: string } }
  all: BaseKeystoneTypeInfo<{ actor: string }>
}

function expectType<T>(value: T) {
  void value
}

const transactionListHooks: ListHooks<TransactionListInfo> = {
  transaction: {
    afterCommit(args) {
      expectType<'Entry'>(args.listKey)
      expectType<string | undefined>(args.context.session?.actor)
      // @ts-expect-error Only rollback callbacks receive the transaction failure.
      args.error
      if (args.operation === 'create') {
        expectType<undefined>(args.originalItem)
        expectType<string>(args.item.name)
        expectType<string>(args.inputData.name)
      } else if (args.operation === 'update') {
        expectType<string>(args.originalItem.name)
        expectType<string>(args.item.name)
        expectType<string | undefined>(args.resolvedData.name)
      } else {
        expectType<undefined>(args.item)
        expectType<undefined>(args.inputData)
        expectType<undefined>(args.resolvedData)
        expectType<string>(args.originalItem.name)
      }
    },
    afterRollback: {
      create(args) {
        expectType<'create'>(args.operation)
        expectType<string>(args.item.name)
        expectType<unknown>(args.error)
        // @ts-expect-error Transaction failures can be any thrown value, not only Error.
        args.error.message
      },
      update(args) {
        expectType<string>(args.originalItem.name)
      },
      delete(args) {
        expectType<undefined>(args.item)
      },
    },
  },
}
expectType<ListHooks<TransactionListInfo>>(transactionListHooks)
// @ts-expect-error The public hook is named afterCommit, not commit.
transactionListHooks.transaction!.commit
// @ts-expect-error The public hook is named afterRollback, not rollback.
transactionListHooks.transaction!.rollback

const transactionFieldHooks: FieldHooks<TransactionListInfo, SimpleFieldTypeInfo<'String'>> = {
  transaction: {
    afterCommit: {
      create(args) {
        expectType<'create'>(args.operation)
        expectType<'name'>(args.fieldKey)
        expectType<string | null>(args.itemField)
        expectType<undefined>(args.originalItemField)
      },
      update(args) {
        expectType<string | null>(args.originalItemField)
      },
      delete(args) {
        expectType<undefined>(args.itemField)
      },
    },
    afterRollback(args) {
      if (args.operation === 'delete') {
        expectType<undefined>(args.inputFieldData)
        expectType<undefined>(args.resolvedFieldData)
        expectType<string | null>(args.originalItemField)
      }
    },
  },
}
expectType<FieldHooks<TransactionListInfo, SimpleFieldTypeInfo<'String'>>>(transactionFieldHooks)
// @ts-expect-error Field hooks use the same afterCommit name as list hooks.
transactionFieldHooks.transaction!.commit
// @ts-expect-error Field hooks use the same afterRollback name as list hooks.
transactionFieldHooks.transaction!.rollback
