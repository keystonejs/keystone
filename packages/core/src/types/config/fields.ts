import { CacheHint } from 'apollo-server-types';
import { FieldTypeFunc } from '../next-fields';
import { BaseModelTypeInfo } from '../type-info';
import { KeystoneContextFromModelTypeInfo, MaybePromise } from '..';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';
import { FieldHooks } from './hooks';
import { FieldAccessControl } from './access-control';

export type BaseFields<ModelTypeInfo extends BaseModelTypeInfo> = {
  [key: string]: FieldTypeFunc<ModelTypeInfo>;
};

export type FilterOrderArgs<ModelTypeInfo extends BaseModelTypeInfo> = {
  context: KeystoneContextFromModelTypeInfo<ModelTypeInfo>;
  session: KeystoneContextFromModelTypeInfo<ModelTypeInfo>['session'];
  modelKey: string;
  fieldKey: string;
};
export type CommonFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> = {
  access?: FieldAccessControl<ModelTypeInfo>;
  hooks?: FieldHooks<ModelTypeInfo>;
  label?: string;
  ui?: {
    description?: string;
    views?: string;
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden', ModelTypeInfo> };
    itemView?: { fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ModelTypeInfo> };
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden', ModelTypeInfo> };
  };
  graphql?: {
    cacheHint?: CacheHint;
    // Setting any of these values will remove the corresponding input/output types from the GraphQL schema.
    // Output Types
    //   'read': Does this field exist on the Item type? Will also disable filtering/ordering/admimMeta
    // Input Types
    //   'create': Does this field exist in the create Input type?
    //   'update': Does this field exist in the update Input type?
    //
    // If `true` then the field will be completely removed from all types.
    //
    // Default: undefined
    omit?: true | readonly ('read' | 'create' | 'update')[];
  };
  // Disabled by default...
  isFilterable?: boolean | ((args: FilterOrderArgs<ModelTypeInfo>) => MaybePromise<boolean>);
  isOrderable?: boolean | ((args: FilterOrderArgs<ModelTypeInfo>) => MaybePromise<boolean>);
};
