import type {
  BaseFields,
  BaseListTypeInfo,
  KeystoneConfig,
  BaseKeystoneTypeInfo,
  ListConfig,
} from './types';

export function config<TypeInfo extends BaseKeystoneTypeInfo>(config: KeystoneConfig<TypeInfo>) {
  return config;
}

let i = 0;
export function group<
  __Fields extends BaseFields<ListTypeInfo>, // TODO: remove in breaking change
  ListTypeInfo extends BaseListTypeInfo
>(config: {
  label: string;
  description?: string;
  fields: BaseFields<ListTypeInfo>;
}): BaseFields<ListTypeInfo> {
  const keys = Object.keys(config.fields);
  if (keys.some(key => key.startsWith('__group'))) {
    throw new Error('groups cannot be nested');
  }

  return {
    [`__group${i++}`]: {
      fields: keys,
      label: config.label,
      description: config.description ?? null,
    },
    ...config.fields,
  } as any; // TODO: FIXME, see types-for-lists.ts:getListsWithInitialisedFields
}

export function list<
  __Fields extends BaseFields<ListTypeInfo>, // TODO: remove in breaking change
  ListTypeInfo extends BaseListTypeInfo
>(config: ListConfig<ListTypeInfo>): ListConfig<ListTypeInfo> {
  return { ...config };
}
