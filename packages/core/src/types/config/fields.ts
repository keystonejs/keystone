import { CacheHint } from '@apollo/cache-control-types';
import { FieldTypeFunc } from '../next-fields';
import { BaseListTypeInfo } from '../type-info';
import { KeystoneContextFromListTypeInfo, MaybePromise } from '..';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';
import { FieldHooks } from './hooks';
import { FieldAccessControl } from './access-control';

export type BaseFields<ListTypeInfo extends BaseListTypeInfo> = {
  [key: string]: FieldTypeFunc<ListTypeInfo>;
};

export type FilterOrderArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>;
  session: KeystoneContextFromListTypeInfo<ListTypeInfo>['session'];
  listKey: string;
  fieldKey: string;
};
export type CommonFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {
  access?: FieldAccessControl<ListTypeInfo>;
  hooks?: FieldHooks<ListTypeInfo>;
  label?: string;
  ui?: {
    description?: string;
    views?: string;
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo> };
    itemView?: {
      fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ListTypeInfo>;
      fieldPosition?: MaybeItemFunction<'form' | 'sidebar', ListTypeInfo>;
    };
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo> };
  };
  graphql?: {
    cacheHint?: CacheHint;
    isNonNull?: {
      // should this field be non-nullable on the {List} GraphQL type?
      read?: boolean;
      // should this field be non-nullable on the {List}CreateInput GraphQL type?
      create?: boolean;
      // should this field be non-nullable on the {List}UpdateInput GraphQL type?
      update?: boolean;
    };

    omit?:
      | true
      | {
          // should this field be omitted from the {List} GraphQL type?
          read?: boolean;
          // should this field be omitted from the {List}CreateInput GraphQL type?
          create?: boolean;
          // should this field be omitted from the {List}UpdateInput GraphQL type?
          update?: boolean;
        };
  };
  isFilterable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>);
  isOrderable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>);
};
