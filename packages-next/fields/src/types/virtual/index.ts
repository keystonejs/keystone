import {
  BaseGeneratedListTypes,
  schema,
  ItemRootValue,
  CommonFieldConfig,
  FieldTypeFunc,
  fieldType,
  ListInfo,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

type VirtualFieldGraphQLField = schema.Field<ItemRootValue, any, any, string>;

export type VirtualFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    field:
      | VirtualFieldGraphQLField
      | ((lists: Record<string, ListInfo>) => VirtualFieldGraphQLField);
    unreferencedConcreteInterfaceImplementations?: schema.ObjectType<any>[];
    graphQLReturnFragment?: string;
  };

export const virtual =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    graphQLReturnFragment = '',
    field,
    ...config
  }: VirtualFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    const usableField = typeof field === 'function' ? field(meta.lists) : field;

    return fieldType({
      kind: 'none',
    })({
      ...config,
      output: schema.field({
        ...(usableField as any),
        resolve({ item }, ...args) {
          return usableField.resolve!(item as any, ...args);
        },
      }),
      views: resolveView('virtual/views'),
      getAdminMeta: () => ({ graphQLReturnFragment }),
    });
  };
