import type { IncomingMessage, ServerResponse } from 'http'
import type { DocumentNode, ExecutionResult, GraphQLSchema } from 'graphql/index.js'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { InitialisedList } from '../lib/core/initialise-lists.ts'
import type { SessionStrategy } from './session.ts'
import type { BaseKeystoneTypeInfo, BaseListTypeInfo } from './type-info.ts'
import type { MaybePromise } from './utils.ts'
import type { FieldSelection, SelectedItem } from './item-selection.ts'

export type KeystoneContext<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  db: KeystoneDbAPI<TypeInfo['lists']>
  query: KeystoneListsAPI<TypeInfo['lists']>
  graphql: KeystoneGraphQLAPI
  prisma: TypeInfo['prisma']
  // note this using the method syntax is important because we want TypeInfo['dbProvider'] to be bivariant, not contravariant
  // essentially so you don't get errors when assigning between contexts, this is technically unsound in the same way arrays in TS are unsound,
  // but not doing this would make things much harder to use
  /**
   * Run operations in an explicit transaction, then await transaction.afterCommit hooks.
   * On rejection, transaction.afterRollback hooks run before the original error is rethrown.
   * Commit-hook errors reject this promise but cannot undo the committed data.
   * Nested transactions/savepoints are not supported; await all operations within `f`.
   */
  transaction<T>(
    f: (context: KeystoneContext<TypeInfo>) => MaybePromise<T>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: {
        sqlite: 'Serializable'
        mysql: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
        postgresql: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
      }[TypeInfo['dbProvider']]
    }
  ): Promise<T>

  req?: IncomingMessage
  res?: ServerResponse
  sessionStrategy?: SessionStrategy<TypeInfo['session'], TypeInfo>
  session?: TypeInfo['session']
  withRequest: (req: IncomingMessage, res?: ServerResponse) => Promise<KeystoneContext<TypeInfo>>
  withSession: (session?: TypeInfo['session']) => KeystoneContext<TypeInfo>

  // privilege escalation
  internal: () => KeystoneContext<TypeInfo> // WARNING: name may change
  sudo: () => KeystoneContext<TypeInfo>

  /**
   * WARNING: may change in patch
   */
  __internal: {
    sudo: boolean
    lists: Record<string, InitialisedList>
    prisma: {
      DbNull: unknown
      JsonNull: unknown
    }
  }
}

// List item API

type UniqueWhereInput<ListTypeInfo extends BaseListTypeInfo> =
  false extends ListTypeInfo['isSingleton']
    ? { readonly where: ListTypeInfo['inputs']['uniqueWhere'] }
    : { readonly where?: ListTypeInfo['inputs']['uniqueWhere'] }

type ListAPI<ListTypeInfo extends BaseListTypeInfo> = {
  findMany(
    args?: {
      readonly where?: ListTypeInfo['inputs']['where']
      readonly take?: number
      readonly skip?: number
      readonly orderBy?:
        | ListTypeInfo['inputs']['orderBy']
        | readonly ListTypeInfo['inputs']['orderBy'][]
      readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
    } & ResolveFields
  ): Promise<readonly Record<string, any>[]>
  findOne(args: UniqueWhereInput<ListTypeInfo> & ResolveFields): Promise<Record<string, any>>
  count(args?: { readonly where?: ListTypeInfo['inputs']['where'] }): Promise<number>
  updateOne(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
    } & ResolveFields
  ): Promise<Record<string, any>>
  updateMany(
    args: {
      readonly data: readonly (UniqueWhereInput<ListTypeInfo> & {
        readonly data: ListTypeInfo['inputs']['update']
      })[]
    } & ResolveFields
  ): Promise<Record<string, any>[]>
  createOne(
    args: { readonly data: ListTypeInfo['inputs']['create'] } & ResolveFields
  ): Promise<Record<string, any>>
  createMany(
    args: {
      readonly data: readonly ListTypeInfo['inputs']['create'][]
    } & ResolveFields
  ): Promise<Record<string, any>[]>
  deleteOne(
    args: UniqueWhereInput<ListTypeInfo> & ResolveFields
  ): Promise<Record<string, any> | null>
  deleteMany(
    args: {
      readonly where: readonly ListTypeInfo['inputs']['uniqueWhere'][]
    } & ResolveFields
  ): Promise<Record<string, any>[]>
}

export type KeystoneListsAPI<ListsTypeInfo extends Record<string, BaseListTypeInfo>> = {
  [Key in keyof ListsTypeInfo]: ListAPI<ListsTypeInfo[Key]>
}

type ResolveFields = {
  /**
   * @default 'id'
   */
  readonly query?: string
}

type DbSelection<Item> = FieldSelection<Item>
type ExactDbSelection<Item, Selection> = Selection extends undefined
  ? undefined
  : Selection & { [Key in Exclude<keyof Selection, keyof Item & string>]: never }
type SelectedDbColumns<Item, Selection> =
  Selection extends DbSelection<Item> ? SelectedItem<Item, Selection> : Item

type DbAPI<ListTypeInfo extends BaseListTypeInfo> = {
  findMany<
    const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined,
  >(args?: {
    readonly where?: ListTypeInfo['inputs']['where']
    readonly take?: number
    readonly skip?: number
    readonly orderBy?:
      | ListTypeInfo['inputs']['orderBy']
      | readonly ListTypeInfo['inputs']['orderBy'][]
    readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
    readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
  }): Promise<readonly SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  findOne<const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection> | null>
  count(args?: { readonly where?: ListTypeInfo['inputs']['where'] }): Promise<number>
  updateOne<const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
      readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  updateMany<
    const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined,
  >(args: {
    readonly data: readonly (UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
    })[]
    readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
  }): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  createOne<
    const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined,
  >(args: {
    readonly data: ListTypeInfo['inputs']['create']
    readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
  }): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  createMany<
    const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined,
  >(args: {
    readonly data: readonly ListTypeInfo['inputs']['create'][]
    readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
  }): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  deleteOne<const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  deleteMany<
    const Selection extends DbSelection<ListTypeInfo['item']> | undefined = undefined,
  >(args: {
    readonly where: readonly ListTypeInfo['inputs']['uniqueWhere'][]
    readonly select?: ExactDbSelection<ListTypeInfo['item'], Selection>
  }): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
}

export type KeystoneDbAPI<ListsTypeInfo extends Record<string, BaseListTypeInfo>> = {
  [Key in keyof ListsTypeInfo]: DbAPI<ListsTypeInfo[Key]>
}

// GraphQL API

export type KeystoneGraphQLAPI = {
  schema: GraphQLSchema
  run: <TData, TVariables extends Record<string, any>>(
    args: GraphQLExecutionArguments<TData, TVariables>
  ) => Promise<TData>
  raw: <TData, TVariables extends Record<string, any>>(
    args: GraphQLExecutionArguments<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>
}

type GraphQLExecutionArguments<TData, TVariables> = {
  query: string | DocumentNode | TypedDocumentNode<TData, TVariables>
  variables?: TVariables
}
