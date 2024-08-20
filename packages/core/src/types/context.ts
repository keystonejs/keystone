import {
  type IncomingMessage,
  type ServerResponse
} from 'http'
import { type Readable } from 'stream'
import {
  type DocumentNode,
  type ExecutionResult,
  type GraphQLSchema,
} from 'graphql'
import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { type InitialisedList } from '../lib/core/initialise-lists'
import { type SessionStrategy } from './session'
import {
  type BaseKeystoneTypeInfo,
  type BaseListTypeInfo,
} from './type-info'
import { type MaybePromise } from './utils'

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

type ListAPI <ListTypeInfo extends BaseListTypeInfo> = {
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
  findOne(
    args: UniqueWhereInput<ListTypeInfo> & ResolveFields
  ): Promise<Record<string, any>>
  count(args?: {
    readonly where?: ListTypeInfo['inputs']['where']
  }): Promise<number>
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

type DbAPI <ListTypeInfo extends BaseListTypeInfo> = {
  findMany(args?: {
    readonly where?: ListTypeInfo['inputs']['where']
    readonly take?: number
    readonly skip?: number
    readonly orderBy?:
      | ListTypeInfo['inputs']['orderBy']
      | readonly ListTypeInfo['inputs']['orderBy'][]
    readonly cursor?: ListTypeInfo['inputs']['uniqueWhere']
  }): Promise<readonly ListTypeInfo['item'][]>
  findOne(
    args: UniqueWhereInput<ListTypeInfo>
  ): Promise<ListTypeInfo['item'] | null>
  count(args?: {
    readonly where?: ListTypeInfo['inputs']['where']
  }): Promise<number>
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
  deleteOne(
    args: UniqueWhereInput<ListTypeInfo>
  ): Promise<ListTypeInfo['item']>
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

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif'

export type ImageMetadata = {
  extension: ImageExtension
  filesize: number
  width: number
  height: number
}

export type ImageData = {
  id: string
} & ImageMetadata

export type ImagesContext = (storage: string) => {
  getUrl: (id: string, extension: ImageExtension) => Promise<string>
  getDataFromStream: (stream: Readable, filename: string) => Promise<ImageData>
  deleteAtSource: (id: string, extension: ImageExtension) => Promise<void>
}
