import type { BaseGeneratedListTypes } from '../utils';
import { NextFieldType } from '../next-fields';
import { FieldAccessControl } from './access-control';
import { FieldHooks } from './hooks';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';

export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: NextFieldType;
};

export type CommonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  access?: FieldAccessControl<TGeneratedListTypes>;
  hooks?: FieldHooks<TGeneratedListTypes>;
  label?: string;
  ui?: {
    views?: string;
    description?: string;
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden'> };
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden'> };
    itemView?: { fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'> };
  };
};
