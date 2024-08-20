import { type BaseItem } from './next-fields'
import { type KeystoneContext } from '../types'

type GraphQLInput = Record<string, any>

export type BaseListTypeInfo<Session = any> = {
  key: string
  isSingleton: boolean
  fields: string
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
    create: Record<string, any>
    update: Record<string, any>
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
