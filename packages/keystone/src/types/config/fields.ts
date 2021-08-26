import type { CacheHint } from '../next-fields';
import { FieldTypeFunc } from '../next-fields';
import type { BaseGeneratedListTypes } from '../utils';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';
import { FieldHooks } from './hooks';
import { FieldAccessControl } from './access-control';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: FieldTypeFunc;
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
    // Setting any of these to `false` will remove the corresponding operations
    // from the GraphQL schema.
    //
    // Default: true
    isEnabled?: {
      // Output Types
      read?: boolean; // Does this field exist on the Item type?

      // Input Types
      create?: boolean; // Does this field exist in the create Input type?
      update?: boolean; // Does this field exist in the update Input type?

      // Disabled by default...
      filter?: boolean; // Does this field exist in the WhereInput for both unique and ... not unique type?
      orderBy?: boolean; // Does this field exist in the OrderBy type?
    };
  };
};
