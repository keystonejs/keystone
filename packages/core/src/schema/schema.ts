import type { FieldGroupConfig } from '../lib/core/types-for-lists';
import type {
  BaseFields,
  BaseListTypeInfo,
  KeystoneConfig,
  BaseKeystoneTypeInfo,
  ListConfig,
} from '../types';

export function config<TypeInfo extends BaseKeystoneTypeInfo>(config: KeystoneConfig<TypeInfo>) {
  return config;
}

let i = 0;
export function group<
  Fields extends BaseFields<ListTypeInfo>,
  ListTypeInfo extends BaseListTypeInfo
>(config: { label: string; description?: string; fields: Fields }): Fields {
  const keys = Object.keys(config.fields);
  if (keys.some(key => key.startsWith('__group'))) {
    throw new Error('groups cannot be nested');
  }
  const groupConfig: FieldGroupConfig = {
    fields: keys,
    label: config.label,
    description: config.description ?? null,
  };
  return {
    [`__group${i++}`]: groupConfig,
    ...config.fields,
  };
}

export function list<
  Fields extends BaseFields<ListTypeInfo>,
  ListTypeInfo extends BaseListTypeInfo
>(config: ListConfig<ListTypeInfo, Fields>): ListConfig<ListTypeInfo, any> {
  return { ...config };
}
