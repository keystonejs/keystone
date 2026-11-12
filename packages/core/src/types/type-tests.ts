import type { KeystoneContext } from './context.ts'
import type { BaseKeystoneTypeInfo, BaseListTypeInfo } from './type-info.ts'
import type { DatabaseProvider } from './core.ts'
import type { SimpleFieldTypeInfo } from './next-fields.ts'
import { selectItem } from './item-callback.ts'
import type { FieldHooks, ListHooks, ValidateHook } from './config/hooks.ts'
import type { FieldAccessControl } from './config/access-control.ts'
import type { ListGraphQLConfig } from './config/lists.ts'
import { g } from './schema/g.ts'
import type { GField } from '@graphql-ts/schema'
import type { GraphQLResolveInfo } from 'graphql/index.js'
import { selectFromInfo } from '../lib/core/queries/select.ts'
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

type IsAny<T> = 0 extends 1 & T ? true : false

const callbackWithoutContext = selectItem(arg => {
  // @ts-expect-error Without an annotation or contextual type, the argument is unknown
  arg.title
  return arg
}, {})
false satisfies IsAny<Parameters<typeof callbackWithoutContext>[0]>
false satisfies IsAny<ReturnType<typeof callbackWithoutContext>>
true satisfies unknown extends Parameters<typeof callbackWithoutContext>[0] ? true : false
// @ts-expect-error The unknown result cannot be used as a string
callbackWithoutContext({ title: 'Title' }) satisfies string

const standaloneCallback = ({ item }: { item: Pick<SelectedList['item'], 'id' | 'title'> }) =>
  item.title
const selectedStandaloneCallback = selectItem(standaloneCallback, { title: true })
false satisfies IsAny<Parameters<typeof selectedStandaloneCallback>[0]>
false satisfies IsAny<ReturnType<typeof selectedStandaloneCallback>>
selectedStandaloneCallback({ item: { id: '1', title: 'Title' } }) satisfies string
// @ts-expect-error Selected callbacks accept a single argument
selectedStandaloneCallback({ item: { id: '1', title: 'Title' } }, '!')
// @ts-expect-error The callback's item parameter retains its required columns
selectedStandaloneCallback({ item: { id: '1' } })
// @ts-expect-error Callbacks requiring additional arguments are not supported
selectItem((item: { id: string }, suffix: string) => item.id + suffix, {})
// @ts-expect-error A callback cannot require an unselected column
selectItem(standaloneCallback, {})

const selectedInlineCallback = selectItem(
  ({ item }: { item: Pick<SelectedList['item'], 'id' | 'title'> }) => item.title,
  { title: true }
)
false satisfies IsAny<Parameters<typeof selectedInlineCallback>[0]>
false satisfies IsAny<ReturnType<typeof selectedInlineCallback>>

const selectedAsyncCallback = selectItem(
  async ({ item }: { item: Pick<SelectedList['item'], 'id' | 'title'> }) => item.title,
  { title: true }
)
false satisfies IsAny<Awaited<ReturnType<typeof selectedAsyncCallback>>>
selectedAsyncCallback({ item: { id: '1', title: 'Title' } }) satisfies Promise<string>

function selectGenericCallback<ListTypeInfo extends BaseListTypeInfo>(
  callback: (args: { item: ListTypeInfo['item'] }) => string
) {
  const selected = selectItem(callback, {})
  return selected
}
const selectedGenericCallback = selectGenericCallback<SelectedList>(({ item }) => item.title)
false satisfies IsAny<Parameters<typeof selectedGenericCallback>[0]>
false satisfies IsAny<ReturnType<typeof selectedGenericCallback>>

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
  item!.title satisfies string
  item!.status satisfies string
})
selectedDbContext.db.Post.findMany().then(items => {
  items[0]!.title satisfies string
  items[0]!.status satisfies string
})
selectedDbContext.db.Post.createMany({ data: [] }).then(items => {
  items[0]!.title satisfies string
  items[0]!.status satisfies string
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
const selectionFromInfo = selectFromInfo(selectedDbContext, graphqlInfo, 'Post')
selectionFromInfo satisfies object | undefined
if (selectionFromInfo) {
  // @ts-expect-error Cached GraphQL selections are readonly
  selectionFromInfo.title = true
  selectedDbContext.db.Post.findMany({
    select: { ...selectionFromInfo, title: true },
  }).then(items => {
    items[0]!.title satisfies string
    items[0]!.status satisfies string | undefined
    // @ts-expect-error The GraphQL selection may not include status
    items[0]!.status satisfies string
  })
}
selectedDbContext.db.Post.findMany({
  select: selectionFromInfo === undefined ? undefined : { ...selectionFromInfo, title: true },
}).then(items => {
  items[0]!.id satisfies string
  items[0]!.title satisfies string
  items[0]!.status satisfies string | undefined
  // @ts-expect-error Status is not guaranteed when select is defined
  items[0]!.status satisfies string
})
const optionalSelectionWithTitle =
  selectionFromInfo === undefined ? undefined : { ...selectionFromInfo, title: true as const }
const selectedPostDb = selectedDbContext.db.Post
for (const result of [
  selectedPostDb.findOne({ where: { id: 'post-id' }, select: optionalSelectionWithTitle }),
  selectedPostDb.createOne({ data: {}, select: optionalSelectionWithTitle }),
  selectedPostDb.updateOne({
    where: { id: 'post-id' },
    data: {},
    select: optionalSelectionWithTitle,
  }),
  selectedPostDb.deleteOne({ where: { id: 'post-id' }, select: optionalSelectionWithTitle }),
]) {
  result.then(item => {
    item!.title satisfies string
    // @ts-expect-error An optional selection does not guarantee status
    item!.status satisfies string
  })
}
for (const result of [
  selectedPostDb.findMany({ select: optionalSelectionWithTitle }),
  selectedPostDb.createMany({ data: [], select: optionalSelectionWithTitle }),
  selectedPostDb.updateMany({ data: [], select: optionalSelectionWithTitle }),
  selectedPostDb.deleteMany({ where: [], select: optionalSelectionWithTitle }),
]) {
  result.then(items => {
    items[0]!.title satisfies string
    // @ts-expect-error An optional selection does not guarantee status
    items[0]!.status satisfies string
  })
}
declare const optionalTitleArgs: { select?: { title: true } }
selectedPostDb.findMany(optionalTitleArgs).then(items => {
  items[0]!.title satisfies string
})
declare const invalidOptionalSelection: { title: true; missing: true } | undefined
// @ts-expect-error Undefined does not allow unknown columns in the defined selection
selectedPostDb.findMany({ select: invalidOptionalSelection })
selectedPostDb.findMany({ select: undefined }).then(items => {
  items[0]!.title satisfies string
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
selectedDbContext.db.Post.findOne({
  where: { id: 'post-id' },
  // @ts-expect-error Unknown item columns are not accepted even alongside known columns
  select: { title: true, extra: true },
})
// @ts-expect-error Unknown top-level arguments are not accepted for list queries
selectedDbContext.db.Post.findMany({ select: { title: true }, extra: true })

const selectedHooks: ListHooks<SelectedList> = {
  validate: {
    update: selectItem(
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
    delete: selectItem(
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
    update: selectItem(() => {}, { missing: true }),
  },
}
void invalidSelection

declare const existingValidate: ValidateHook<SelectedList, 'update'> | undefined
const wrappedHooks: ListHooks<SelectedList> = {
  validate: {
    update: selectItem.wrap(
      next => async args => {
        args.item.title
        // @ts-expect-error The wrapper cannot read columns only selected by the wrapped callback
        args.item.status
        await next?.(args)
        // @ts-expect-error A rebuilt item may be missing columns selected by the wrapped callback
        await next?.({ ...args, item: { id: args.item.id, title: args.item.title } })
      },
      { title: true },
      existingValidate
    ),
  },
}
void wrappedHooks

const selectedAccess: FieldAccessControl<SelectedList> = {
  read: {
    item: selectItem(
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
  cacheHint: selectItem(
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

const annotatedItemField = g.itemField({
  select: selection,
  type: g.String,
  resolve(item: Pick<Lists.Post.Item, keyof typeof selection>) {
    return item.title
  },
})
annotatedItemField satisfies GField<Lists.Post.Item, {}, typeof g.String, unknown, KeystoneContext>

const selectedItemField: GField<
  SelectedList['item'],
  {},
  typeof g.String,
  unknown,
  KeystoneContext
> = g.itemField({
  select: { title: true },
  type: g.String,
  resolve(item) {
    item.title
    // @ts-expect-error A GraphQL resolver cannot read an unselected item column
    item.status
    return item.title
  },
})
void selectedItemField

type MultiColumnItem = {
  id: string
  aFile_filename: string | null
  aFile_filesize: number | null
}

g.itemField({
  select: { aFile_filename: true },
  type: g.String,
  resolve: (item: Pick<MultiColumnItem, 'aFile_filename'>) => item.aFile_filename,
})

const invalidMultiColumnField: GField<
  MultiColumnItem,
  {},
  typeof g.String,
  unknown,
  KeystoneContext
> = g.itemField({
  // @ts-expect-error A Keystone field key is not a Prisma item column
  select: { aFile: true },
  type: g.String,
  resolve: () => null,
})
void invalidMultiColumnField

g.itemField({
  // @ts-expect-error GraphQL field requirements must be item keys
  select: { title: true, missing: true },
  type: g.String,
  resolve: (item: Pick<SelectedList['item'], 'title'>) => item.title,
})

const selectedFieldTypeOutput: GField<
  { item: SelectedList['item']; value: { count: number } },
  {},
  typeof g.Int,
  unknown,
  KeystoneContext
> = g.fieldTypeOutput({
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
void selectedFieldTypeOutput

const optionalItemSelection: { title?: true; status: true } = { status: true }
const optionalSelectionHooks: ListHooks<SelectedList> = {
  validate: {
    update: selectItem(({ item }) => {
      item.id satisfies string
      item.status satisfies string
      item.title satisfies string | undefined
      // @ts-expect-error An optionally selected column may be absent
      item.title satisfies string
    }, optionalItemSelection),
  },
}
void optionalSelectionHooks

const optionalSelectionField: GField<
  SelectedList['item'],
  {},
  typeof g.String,
  unknown,
  KeystoneContext
> = g.itemField({
  select: optionalItemSelection,
  type: g.String,
  resolve(item) {
    item.id satisfies string
    item.status satisfies string
    item.title satisfies string | undefined
    // @ts-expect-error An optionally selected column may be absent
    item.title satisfies string
    return item.title ?? item.status
  },
})
void optionalSelectionField

const optionalSelectionOutput: GField<
  { item: SelectedList['item']; value: string },
  {},
  typeof g.String,
  unknown,
  KeystoneContext
> = g.fieldTypeOutput({
  select: optionalItemSelection,
  type: g.String,
  resolve({ item, value }) {
    item.id satisfies string
    item.status satisfies string
    item.title satisfies string | undefined
    // @ts-expect-error An optionally selected column may be absent
    item.title satisfies string
    return item.title ?? value
  },
})
void optionalSelectionOutput

// Callbacks without item arguments preserve required context and optional session.
type Session = { userId: string }
type Context<Session> = { session?: Session; query: () => boolean }
type NoItemArgs = { session?: Session; context: Context<Session> }
const noItemCallback = selectItem(async ({ session, context }: NoItemArgs) => {
  session satisfies Session | undefined
  return context.query()
}, {})
noItemCallback({ context: { query: () => true } }) satisfies Promise<boolean>
// @ts-expect-error Context is required
noItemCallback({})
// @ts-expect-error Session retains its type
noItemCallback({ context: { query: () => true }, session: 'invalid' })
const wrappedNoItemCallback = selectItem.wrap(
  next => async (args: NoItemArgs) => {
    args.context.query()
    args.session satisfies Session | undefined
    return next(args)
  },
  {},
  noItemCallback
)
wrappedNoItemCallback({ context: { query: () => true } }) satisfies Promise<boolean>
// @ts-expect-error Context is still required after wrapping
wrappedNoItemCallback({})
const noItemProperties = selectItem((args: { title: string; optional?: number }) => args, {})
noItemProperties({ title: 'Title' }).title satisfies string
// @ts-expect-error Ordinary properties are not selected item columns
noItemProperties({})

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
