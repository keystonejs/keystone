import { CacheHint } from 'apollo-server-types';
import { FieldTypeFunc } from '../next-fields';
import type { BaseGeneratedListTypes } from '../utils';
import { KeystoneContext, MaybePromise } from '..';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';
import { FieldHooks } from './hooks';
import { FieldAccessControl } from './access-control';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: FieldTypeFunc;
};

export type FilterOrderArgs = {
  context: KeystoneContext;
  session: KeystoneContext['session'];
  listKey: string;
  fieldKey: string;
};
export type CommonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  access?: FieldAccessControl<TGeneratedListTypes>;
  hooks?: FieldHooks<TGeneratedListTypes>;
  label?: string;
  ui?: {
    views?: string;
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden'> };
    itemView?: { fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'> };
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden'> };
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
    omit?: true | ('read' | 'create' | 'update')[];
  };
  // Disabled by default...
  isFilterable?: boolean | ((args: FilterOrderArgs) => MaybePromise<boolean>);
  isOrderable?: boolean | ((args: FilterOrderArgs) => MaybePromise<boolean>);
};
