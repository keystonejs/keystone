import {
  type BaseFields,
  type BaseKeystoneTypeInfo,
  type BaseListTypeInfo,
  type KeystoneConfig,
  type ListConfig,
} from './types'

export function config<TypeInfo extends BaseKeystoneTypeInfo> (config: KeystoneConfig<TypeInfo>) {
  return config
}

let i = 0
export function group<ListTypeInfo extends BaseListTypeInfo> (config: {
  label: string
  description?: string
  fields: BaseFields<ListTypeInfo>
}) {
  const keys = Object.keys(config.fields)
  if (keys.some(key => key.startsWith('__group'))) {
    throw new Error('groups cannot be nested')
  }

  return {
    [`__group${i++}`]: {
      fields: keys,
      label: config.label,
      description: config.description ?? null,
    },
    ...config.fields,
  } as BaseFields<ListTypeInfo> // TODO: FIXME, see initialise-lists.ts:getListsWithInitialisedFields
}

export function list<ListTypeInfo extends BaseListTypeInfo> (config: ListConfig<ListTypeInfo>) {
  return { ...config }
}
