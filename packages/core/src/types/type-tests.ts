import type { KeystoneContext } from './context.ts'
import type { BaseListTypeInfo } from './type-info.ts'
import type { DatabaseProvider } from './core.ts'
import { selectFields } from './item-callback.ts'
import type { ListHooks } from './config/hooks.ts'
import type { FieldAccessControl } from './config/access-control.ts'
import type { ListGraphQLConfig } from './config/lists.ts'
import { g } from './schema/g.ts'
import type { GField } from '@graphql-ts/schema'
import type { GraphQLResolveInfo } from 'graphql/index.js'
import { getSelectionFromInfo } from '../lib/core/queries/select.ts'
import type { Lists } from '../../../../examples/custom-output-paths/my-types.ts'

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

type SelectedList = Omit<BaseListTypeInfo, 'item'> & {
  item: { id: string; title: string; status: string }
}

const selectedDbContext: KeystoneContext<{
  lists: { Post: SelectedList }
  prisma: any
  session: any
  dbProvider: 'sqlite'
}> = undefined!
selectedDbContext.db.Post.findOne({
  where: { id: 'post-id' },
  select: { status: true },
}).then(item => {
  item?.status
  // @ts-expect-error An unselected property is absent
  item?.title
})
selectedDbContext.db.Post.findOne({ where: { id: 'post-id' } }).then(item => {
  item?.title satisfies string | undefined
})
selectedDbContext.db.Post.findMany().then(items => {
  items[0]?.title satisfies string | undefined
})
const dynamicDbSelection: Partial<Record<'title' | 'status', true>> = {}
selectedDbContext.db.Post.findOne({
  where: { id: 'post-id' },
  select: dynamicDbSelection,
}).then(item => {
  item!.id satisfies string
  item!.title satisfies string | undefined
})
selectedDbContext.db.Post.findMany({
  select: { ...dynamicDbSelection, title: true },
}).then(items => {
  items[0]!.title satisfies string
})
declare const graphqlInfo: GraphQLResolveInfo
const selectionFromInfo = getSelectionFromInfo(selectedDbContext, graphqlInfo, 'Post')
selectionFromInfo satisfies object
selectedDbContext.db.Post.findMany({
  select: { ...selectionFromInfo, title: true },
}).then(items => {
  items[0]!.title satisfies string
  items[0]!.status satisfies string | undefined
  // @ts-expect-error The GraphQL selection may not include status
  items[0]!.status satisfies string
})
selectedDbContext.db.Post.findMany({ select: { title: true } }).then(items => {
  // @ts-expect-error A fixed selection does not include unselected fields
  items[0]!.status
})
// @ts-expect-error Selection values must be true
selectedDbContext.db.Post.findOne({ where: { id: 'post-id' }, select: { title: false } })
// @ts-expect-error Selection values must be true
selectedDbContext.db.Post.findOne({ where: { id: 'post-id' }, select: { title: 'true' } })
// @ts-expect-error Unknown top-level arguments are not accepted
selectedDbContext.db.Post.findOne({ where: { id: 'post-id' }, extra: true })
// @ts-expect-error Unknown item columns are not accepted even alongside known columns
selectedDbContext.db.Post.findOne({
  where: { id: 'post-id' },
  select: { title: true, extra: true },
})
// @ts-expect-error Unknown top-level arguments are not accepted for list queries
selectedDbContext.db.Post.findMany({ select: { title: true }, extra: true })

const selectedHooks: ListHooks<SelectedList> = {
  validate: {
    update: selectFields(
      ({ item, operation, addValidationError }) => {
        item.title
        operation satisfies 'update'
        addValidationError('error')
        // @ts-expect-error Unselected item columns are not available to the callback
        item.status
      },
      { title: true }
    ),
  },
  afterOperation: {
    delete: selectFields(
      ({ originalItem, item }) => {
        originalItem.status
        item satisfies undefined
        // @ts-expect-error Unselected original item columns are unavailable
        originalItem.title
      },
      { status: true }
    ),
  },
}
void selectedHooks

const invalidSelection: ListHooks<SelectedList> = {
  validate: {
    // @ts-expect-error Selection keys must exist on the Prisma item
    update: selectFields(() => {}, { missing: true }),
  },
}
void invalidSelection

const selectedAccess: FieldAccessControl<SelectedList> = {
  read: {
    item: selectFields(
      ({ item }) => {
        item.title
        // @ts-expect-error Access cannot read an unselected item column
        item.status
        return true
      },
      { title: true }
    ),
    filter: () => true,
    order: () => true,
  },
}
void selectedAccess

const selectedCacheHint: Pick<ListGraphQLConfig<SelectedList>, 'cacheHint'> = {
  cacheHint: selectFields(
    ({ results, meta }) => {
      if (!meta) {
        results[0].title
        // @ts-expect-error Cache hints cannot read an unselected item column
        results[0].status
      }
      return { maxAge: 1 }
    },
    { title: true }
  ),
}
void selectedCacheHint

const selection = {
  title: true,
} as const

const annotatedListItemField = g.listItemField({
  select: selection,
  type: g.String,
  resolve(item: Pick<Lists.Post.Item, keyof typeof selection>) {
    return item.title
  },
})
annotatedListItemField satisfies GField<
  Lists.Post.Item,
  {},
  typeof g.String,
  unknown,
  KeystoneContext
>

const selectedListItemField: GField<
  SelectedList['item'],
  {},
  typeof g.String,
  unknown,
  KeystoneContext
> = g.listItemField({
  select: { title: true },
  type: g.String,
  resolve(item) {
    item.title
    // @ts-expect-error A GraphQL resolver cannot read an unselected item column
    item.status
    return item.title
  },
})
void selectedListItemField

type MultiColumnItem = {
  id: string
  aFile_filename: string | null
  aFile_filesize: number | null
}

g.listItemField({
  select: { aFile_filename: true },
  type: g.String,
  resolve: (item: Pick<MultiColumnItem, 'aFile_filename'>) => item.aFile_filename,
})

g.listItemField({
  // @ts-expect-error A Keystone field key is not a Prisma item column
  select: { aFile: true },
  type: g.String,
  resolve: (item: Pick<MultiColumnItem, 'aFile_filename'>) => item.aFile_filename,
})

g.listItemField({
  // @ts-expect-error GraphQL field requirements must be item keys
  select: { title: true, missing: true },
  type: g.String,
  resolve: (item: Pick<SelectedList['item'], 'title'>) => item.title,
})

const selectedKeystoneOutput: GField<
  { item: SelectedList['item']; value: { count: number } },
  {},
  typeof g.Int,
  unknown,
  KeystoneContext
> = g.keystoneOutputField({
  select: { title: true },
  type: g.Int,
  resolve({ item, value }) {
    value.count
    item.title
    // @ts-expect-error A Keystone field resolver cannot read an unselected item column
    item.status
    return value.count
  },
})
void selectedKeystoneOutput
