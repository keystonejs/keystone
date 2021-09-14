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
  graphql?: { cacheHint?: CacheHint };
};
