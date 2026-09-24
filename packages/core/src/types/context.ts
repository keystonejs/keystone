import type { IncomingMessage, ServerResponse } from 'http'
import type { DocumentNode, ExecutionResult, GraphQLSchema } from 'graphql/index.js'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { InitialisedList } from '../lib/core/initialise-lists.ts'
import type { SessionStrategy } from './session.ts'
import type { BaseKeystoneTypeInfo, BaseListTypeInfo } from './type-info.ts'
import type { MaybePromise } from './utils.ts'

export type KeystoneContext<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  db: KeystoneDbAPI<TypeInfo['lists']>
  query: KeystoneListsAPI<TypeInfo['lists']>
  graphql: KeystoneGraphQLAPI
  prisma: TypeInfo['prisma']
  // note this using the method syntax is important because we want TypeInfo['dbProvider'] to be bivariant, not contravariant
  // essentially so you don't get errors when assigning between contexts, this is technically unsound in the same way arrays in TS are unsound,
  // but not doing this would make things much harder to use
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
    prismaModelSelections: Record<string, Record<string, true>>
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

type DbSelection<Item> = { [Key in keyof Item & string]?: true }
type ExactDbSelection<Item, Selection> = Selection & {
  [Key in Exclude<keyof Selection, keyof Item & string>]: never
}
type RequiredDbColumns<Item, Selection> = {
  [Key in keyof Item as Key extends 'id'
    ? Key
    : Key extends keyof Selection
      ? Selection[Key] extends true
        ? Key
        : never
      : never]: Item[Key]
}
type OptionalDbColumns<Item, Selection> = {
  [Key in keyof Item as Key extends 'id'
    ? never
    : Key extends keyof Selection
      ? true extends Selection[Key]
        ? Selection[Key] extends true
          ? never
          : Key
        : never
      : never]?: Item[Key]
}
type SelectedDbColumns<Item, Selection> =
  Selection extends DbSelection<Item>
    ? RequiredDbColumns<Item, Selection> & OptionalDbColumns<Item, Selection>
    : Item

type DbFindManyArgs<ListTypeInfo extends BaseListTypeInfo> = {
  readonly where?: ListTypeInfo['inputs']['where']
  readonly take?: number
  readonly skip?: number
  readonly orderBy?:
    | ListTypeInfo['inputs']['orderBy']
    | readonly ListTypeInfo['inputs']['orderBy'][]
  readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
}
type DbUpdateOneArgs<ListTypeInfo extends BaseListTypeInfo> = UniqueWhereInput<ListTypeInfo> & {
  readonly data: ListTypeInfo['inputs']['update']
}
type DbUpdateManyArgs<ListTypeInfo extends BaseListTypeInfo> = {
  readonly data: readonly (UniqueWhereInput<ListTypeInfo> & {
    readonly data: ListTypeInfo['inputs']['update']
  })[]
}
type DbCreateOneArgs<ListTypeInfo extends BaseListTypeInfo> = {
  readonly data: ListTypeInfo['inputs']['create']
}
type DbCreateManyArgs<ListTypeInfo extends BaseListTypeInfo> = {
  readonly data: readonly ListTypeInfo['inputs']['create'][]
}
type DbDeleteManyArgs<ListTypeInfo extends BaseListTypeInfo> = {
  readonly where: readonly ListTypeInfo['inputs']['uniqueWhere'][]
}

type DbAPI<ListTypeInfo extends BaseListTypeInfo> = {
  findMany(
    args?: DbFindManyArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<readonly ListTypeInfo['item'][]>
  findMany<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbFindManyArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<readonly SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  findMany(
    args: DbFindManyArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<readonly SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>[]>
  findOne(
    args: UniqueWhereInput<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item'] | null>
  findOne<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection> | null>
  findOne(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>> | null>
  count(args?: { readonly where?: ListTypeInfo['inputs']['where'] }): Promise<number>
  updateOne(
    args: DbUpdateOneArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item']>
  updateOne<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbUpdateOneArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  updateOne(
    args: DbUpdateOneArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>>
  updateMany(
    args: DbUpdateManyArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item'][]>
  updateMany<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbUpdateManyArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  updateMany(
    args: DbUpdateManyArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>[]>
  createOne(
    args: DbCreateOneArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item']>
  createOne<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbCreateOneArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  createOne(
    args: DbCreateOneArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>>
  createMany(
    args: DbCreateManyArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item'][]>
  createMany<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbCreateManyArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  createMany(
    args: DbCreateManyArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>[]>
  deleteOne(
    args: UniqueWhereInput<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item']>
  deleteOne<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>>
  deleteOne(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>>
  deleteMany(
    args: DbDeleteManyArgs<ListTypeInfo> & { readonly select?: undefined }
  ): Promise<ListTypeInfo['item'][]>
  deleteMany<const Selection extends DbSelection<ListTypeInfo['item']>>(
    args: DbDeleteManyArgs<ListTypeInfo> & {
      readonly select: ExactDbSelection<ListTypeInfo['item'], Selection>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], Selection>[]>
  deleteMany(
    args: DbDeleteManyArgs<ListTypeInfo> & {
      readonly select?: DbSelection<ListTypeInfo['item']>
    }
  ): Promise<SelectedDbColumns<ListTypeInfo['item'], DbSelection<ListTypeInfo['item']>>[]>
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
