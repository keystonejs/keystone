import {
  BaseGeneratedListTypes,
  types,
  ItemRootValue,
  CommonFieldConfig,
  FieldTypeFunc,
  fieldType,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type VirtualFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    field: types.Field<ItemRootValue, any, any, string>;
    unreferencedConcreteInterfaceImplementations?: types.ObjectType<any>[];
    graphQLReturnFragment?: string;
  };

export const virtual =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    graphQLReturnFragment = '',
    field,
    ...config
  }: VirtualFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  () =>
    fieldType({
      kind: 'none',
    })({
      ...config,
      output: types.field({
        ...(field as any),
        resolve({ item }, ...args) {
          return field.resolve!(item as any, ...args);
        },
      }),
      views: resolveView('virtual/views'),
      getAdminMeta: () => ({ graphQLReturnFragment }),
    });
