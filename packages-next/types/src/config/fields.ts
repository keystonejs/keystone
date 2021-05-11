import type { BaseGeneratedListTypes } from '../utils';
import { FieldTypeFunc } from '../next-fields';
import { FieldAccessControl } from './access-control';
import { FieldHooks } from './hooks';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';

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
};
