import type { IncomingMessage, ServerResponse } from 'http'
import type { Readable } from 'stream'
import type { DocumentNode, ExecutionResult, GraphQLSchema } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { InitialisedList } from '../lib/core/initialise-lists'
import type { SessionStrategy } from './session'
import type { BaseKeystoneTypeInfo, BaseListTypeInfo } from './type-info'
import type { MaybePromise } from './utils'
import type { ResolveFieldsQuery } from './query-fields-base'

export type KeystoneContext<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  req?: IncomingMessage
  res?: ServerResponse
  db: KeystoneDbAPI<TypeInfo['lists']>
  query: KeystoneListsAPI<TypeInfo['lists']>
  graphql: KeystoneGraphQLAPI
  sudo: () => KeystoneContext<TypeInfo>
  withSession: (session?: TypeInfo['session']) => KeystoneContext<TypeInfo>
  withRequest: (req: IncomingMessage, res?: ServerResponse) => Promise<KeystoneContext<TypeInfo>>
  prisma: TypeInfo['prisma']
  transaction: <T>(
    f: (context: KeystoneContext<TypeInfo>) => MaybePromise<T>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: {
        Serializable: 'Serializable'
      }
    }
  ) => Promise<T>

  files: FilesContext
  images: ImagesContext
  sessionStrategy?: SessionStrategy<TypeInfo['session'], TypeInfo>
  session?: TypeInfo['session']

  /**
   * WARNING: may change in patch
   */
  __internal: {
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
  findMany<Result extends Record<string, any>>(
    args?: {
      readonly where?: ListTypeInfo['inputs']['where']
      readonly take?: number
      readonly skip?: number
      readonly orderBy?:
        | ListTypeInfo['inputs']['orderBy']
        | readonly ListTypeInfo['inputs']['orderBy'][]
      readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
    } & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<readonly Result[]>
  findOne<Result extends Record<string, any>>(
    args: UniqueWhereInput<ListTypeInfo> & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result | null>
  count(args?: { readonly where?: ListTypeInfo['inputs']['where'] }): Promise<number>
  updateOne<Result extends Record<string, any>>(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
    } & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result>
  updateMany<Result extends Record<string, any>>(
    args: {
      readonly data: readonly (UniqueWhereInput<ListTypeInfo> & {
        readonly data: ListTypeInfo['inputs']['update']
      })[]
    } & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result[]>
  createOne<Result extends Record<string, any>>(
    args: { readonly data: ListTypeInfo['inputs']['create'] } & ResolveFields<
      Result,
      ListTypeInfo['key']
    >
  ): Promise<Result>
  createMany<Result extends Record<string, any>>(
    args: {
      readonly data: readonly ListTypeInfo['inputs']['create'][]
    } & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result[]>
  deleteOne<Result extends Record<string, any>>(
    args: UniqueWhereInput<ListTypeInfo> & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result | null>
  deleteMany<Result extends Record<string, any>>(
    args: {
      readonly where: readonly ListTypeInfo['inputs']['uniqueWhere'][]
    } & ResolveFields<Result, ListTypeInfo['key']>
  ): Promise<Result[]>
}

export type KeystoneListsAPI<ListsTypeInfo extends Record<string, BaseListTypeInfo>> = {
  [Key in keyof ListsTypeInfo]: ListAPI<ListsTypeInfo[Key]>
}

type ResolveFields<Result, ListKey extends string> = {
  /**
   * @default 'id'
   */
  readonly query?: ResolveFieldsQuery<Result, ListKey>
}

type DbAPI<ListTypeInfo extends BaseListTypeInfo> = {
  findMany(args?: {
    readonly where?: ListTypeInfo['inputs']['where']
    readonly take?: number
    readonly skip?: number
    readonly orderBy?:
      | ListTypeInfo['inputs']['orderBy']
      | readonly ListTypeInfo['inputs']['orderBy'][]
    readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
  }): Promise<readonly ListTypeInfo['item'][]>
  findOne(args: UniqueWhereInput<ListTypeInfo>): Promise<ListTypeInfo['item'] | null>
  count(args?: { readonly where?: ListTypeInfo['inputs']['where'] }): Promise<number>
  updateOne(
    args: UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
    }
  ): Promise<ListTypeInfo['item']>
  updateMany(args: {
    readonly data: readonly (UniqueWhereInput<ListTypeInfo> & {
      readonly data: ListTypeInfo['inputs']['update']
    })[]
  }): Promise<ListTypeInfo['item'][]>
  createOne(args: {
    readonly data: ListTypeInfo['inputs']['create']
  }): Promise<ListTypeInfo['item']>
  createMany(args: {
    readonly data: readonly ListTypeInfo['inputs']['create'][]
  }): Promise<ListTypeInfo['item'][]>
  deleteOne(args: UniqueWhereInput<ListTypeInfo>): Promise<ListTypeInfo['item']>
  deleteMany(args: {
    readonly where: readonly ListTypeInfo['inputs']['uniqueWhere'][]
  }): Promise<ListTypeInfo['item'][]>
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

// Files API

export type FileMetadata = {
  filename: string
  filesize: number
}

export type FileData = {
  filename: string
} & FileMetadata

export type FilesContext = (storage: string) => {
  getUrl: (filename: string) => Promise<string>
  getDataFromStream: (stream: Readable, filename: string) => Promise<FileData>
  deleteAtSource: (filename: string) => Promise<void>
}

// Images API

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif' // TODO: remove in breaking change
export type ImageData = {
  id: string
  extension: ImageExtension
  filesize: number
  width: number
  height: number
}

export type ImagesContext = (storage: string) => {
  getUrl: (id: string, extension: ImageExtension) => Promise<string>
  getDataFromStream: (stream: Readable, filename: string) => Promise<ImageData>
  deleteAtSource: (id: string, extension: ImageExtension) => Promise<void>
}
