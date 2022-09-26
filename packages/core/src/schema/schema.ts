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

export function list<
  Fields extends BaseFields<ListTypeInfo>,
  ListTypeInfo extends BaseListTypeInfo
>(config: ListConfig<ListTypeInfo, Fields>): ListConfig<ListTypeInfo, any> {
  return { ...config };
}
