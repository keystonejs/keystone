import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields';
import { AdminMetaRootVal } from '../admin-meta';
import type { BaseGeneratedListTypes, JSONValue } from '../utils';
import type { ListHooks } from './hooks';
import type { FieldAccessControl } from './access-control';
import type { MaybeSessionFunction, MaybeItemFunction } from './lists';

export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: FieldType<TGeneratedListTypes>;
};

export type FieldType<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  /**
   * The real keystone type for the field
   */
  type: {
    type: string;
    implementation: typeof Implementation;
    adapter: typeof PrismaFieldAdapter;
    isRelationship?: boolean;
  };
  /**
   * The config for the field
   */
  config: FieldConfig<TGeneratedListTypes>;
  /**
   * The resolved path to the views for the field type
   */
  views: string;
  getAdminMeta?: (listKey: string, path: string, adminMeta: AdminMetaRootVal) => JSONValue;
};

export type FieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  access?: FieldAccessControl<TGeneratedListTypes>;
  hooks?: ListHooks<TGeneratedListTypes>; // really? ListHooks?
  label?: string;
  ui?: {
    views?: string;
    description?: string;
    createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden'> };
    listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden'> };
    itemView?: { fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'> };
  };
};
