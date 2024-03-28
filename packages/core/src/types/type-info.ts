import {
  type KeystoneContext
} from './context'
import { type BaseItem } from './next-fields'

type GraphQLInput = Record<string, any>

export type BaseListTypeInfo<Session = any, FieldKey extends string = keyof {}> = {
  key: string
  isSingleton: boolean
  fields: FieldKey
  item: BaseItem
  inputs: {
    create: GraphQLInput
    update: GraphQLInput
    where: GraphQLInput
    uniqueWhere: { readonly id?: string | number | null } & GraphQLInput
    orderBy: Record<string, 'asc' | 'desc' | null>
  }

  /**
   * WARNING: may change in patch
   */
  prisma: {
    create: Record<FieldKey, any>
    update: Record<FieldKey, any>
  }
  all: BaseKeystoneTypeInfo<Session>
}

export type KeystoneContextFromListTypeInfo<ListTypeInfo extends BaseListTypeInfo> =
  KeystoneContext<ListTypeInfo['all']>

export type BaseKeystoneTypeInfo<Session = any> = {
  lists: Record<string, BaseListTypeInfo<Session>>
  prisma: any
  session: any
}
