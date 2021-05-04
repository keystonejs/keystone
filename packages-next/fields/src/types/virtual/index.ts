import {
  BaseGeneratedListTypes,
  types,
  tsgql,
  ItemRootValue,
  KeystoneContext,
  FieldTypeFunc,
  fieldType,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type VirtualFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  field: tsgql.OutputField<ItemRootValue, any, any, string, KeystoneContext>;
  unreferencedConcreteInterfaceImplementations?: tsgql.ObjectType<any, string, KeystoneContext>[];
  graphQLReturnFragment?: string;
};

export const virtual = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  graphQLReturnFragment = '',
  field,
  ...config
}: VirtualFieldConfig<TGeneratedListTypes>): FieldTypeFunc => () =>
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
