import type { ListHooks } from './hooks';
import type { ListAccessControl, FieldAccessControl } from './access-control';

import { AdminMetaRootVal } from '../admin-meta';
import type { BaseGeneratedListTypes, MaybePromise, JSONValue } from '../utils';

export type ListSchemaConfig = Record<string, ListConfig<BaseGeneratedListTypes, any>>;

export type ListConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes,
  Fields extends BaseFields<TGeneratedListTypes>
> = {
  /*
      A note on defaults: several options default based on the listKey, including label, path,
      singular, plural, itemQueryName and listQueryName. All these options default independently, so
      changing the singular or plural will not change the label or queryName options (and vice-versa)
      Note from Mitchell: The above is incorrect based on Keystone's current implementation.
    */
  fields: Fields;

  idField?: FieldType<TGeneratedListTypes>;

  /**
   * Controls what data users of the Admin UI and GraphQL can access and change
   * @default true
   * @see https://www.keystonejs.com/guides/access-control
   */
  access?: ListAccessControl<TGeneratedListTypes> | boolean;

  /** Config for how this list should act in the Admin UI */
  ui?: ListAdminUIConfig<TGeneratedListTypes, Fields>;

  /**
   * Hooks to modify the behaviour of GraphQL operations at certain points
   * @see https://www.keystonejs.com/guides/hooks
   */
  hooks?: ListHooks<TGeneratedListTypes>;

  /**
   * Defaults the Admin UI and GraphQL descriptions
   */
  description?: string; // defaults both { adminUI: { description }, graphQL: { description } }

  graphql?: ListGraphQLConfig;

  // Not currently supported
  // plugins?: any[]; // array of plugins that can modify the list config

  /**
   * The label used for the list
   * @default listKey.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
   */
  // Not currently supported
  // label?: string;

  /**
   * The singular form of the list key
   * @default pluralize.singular(label)
   */
  // Not currently supported
  // singular?: string;

  /**
   * The plural form of the list key
   * @default pluralize.plural(label)
   */
  // Not currently supported
  // plural?: string;

  // TODO: Come back to how we can facilitate unique fields and combinations of fields (for
  // queries, upserts, etc, in particular follow Prisma's design)
};

export type ListAdminUIConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes,
  Fields extends BaseFields<TGeneratedListTypes>
> = {
  /**
   * The field to use as a label in the Admin UI. If you want to base the label off more than a single field, use a virtual field and reference that field here.
   * @default 'name' if it exists, otherwise 'id'
   */
  labelField?: keyof Fields; // path of the field to use as the label for items in the list, defaults to 'name' or 'id'

  /**
   * Excludes this list from the Admin UI
   * @default false
   */
  isHidden?: MaybeSessionFunction<boolean>;
  /** The path that the list should be at in the Admin UI */
  path?: string;
  /**
   * The description shown on the list page
   * @default listConfig.description
   */
  description?: string; // the description displayed below the field in the Admin UI
  /**
   * Hides the create button in the Admin UI.
   * Note that this does **not** disable creating items through the GraphQL API, it only hides the button to create an item for this list in the Admin UI.
   * @default false
   */
  hideCreate?: MaybeSessionFunction<boolean>;
  /**
   * Hides the delete button in the Admin UI.
   * Note that this does **not** disable deleting items through the GraphQL API, it only hides the button to delete an item for this list in the Admin UI.
   * @default false
   */
  hideDelete?: MaybeSessionFunction<boolean>;
  /**
   * Configuration specific to the create view in the Admin UI
   */
  createView?: {
    /**
     * The default field mode for fields on the create view for this list.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeSessionFunction<'edit' | 'hidden'>;
  };
  /**
   * Configuration specific to the list view in the Admin UI
   */
  listView?: {
    /**
     * The default field mode for fields on the create view for this list.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'read'
     */
    defaultFieldMode?: MaybeSessionFunction<'read' | 'hidden'>;
    /**
     * The columns(which refer to fields) that should be shown to users of the Admin UI.
     * Users of the Admin UI can select different columns to show in the UI.
     * @default the first three fields in the list
     */
    initialColumns?: (keyof Fields)[];
    // was previously top-level defaultSort
    initialSort?: { field: keyof Fields; direction: 'ASC' | 'DESC' };
    // was previously defaultPageSize
    pageSize?: number; // default number of items to display per page on the list screen
    // note: we are removing maximumPageSize
  };
  /**
   * Configuration specific to the item view in the Admin UI
   */
  itemView?: {
    /**
     * The default field mode for fields on the create view for this list.
     * This controls what people can do for fields
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'>;
  };
};

export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: FieldType<TGeneratedListTypes>;
};

export type FieldType<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  /**
   * The real keystone type for the field
   */
  type: any;
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
  hooks?: ListHooks<TGeneratedListTypes>;
  label?: string;
  ui?: {
    views?: string;
    description?: string;
    createView?: {
      fieldMode?: MaybeSessionFunction<'edit' | 'hidden'>;
    };
    listView?: {
      fieldMode?: MaybeSessionFunction<'read' | 'hidden'>;
    };
    itemView?: {
      fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'>;
    };
  };
};

export type MaybeSessionFunction<T extends string | boolean> =
  | T
  | ((args: { session: any }) => MaybePromise<T>);

export type MaybeItemFunction<T> =
  | T
  | ((args: {
      session: any;
      item: { id: string | number; [path: string]: any };
    }) => MaybePromise<T>);

export type ListGraphQLConfig = {
  // was previously top-level cacheHint
  cacheHint?: CacheHint;
  /**
   * The description added to the GraphQL schema
   * @default listConfig.description
   */
  description?: string;
  // was previously top-level itemQueryName
  itemQueryName?: string; // the name of the graphql query for getting a single item
  // was previously top-level itemQueryName
  listQueryName?: string; // the name of the graphql query for getting multiple items
  // was previously top-level queryLimits
  queryLimits?: {
    maxResults?: number; // maximum number of items that can be returned in a query (or subquery)
  };
};

export type CacheHint = { scope: 'PRIVATE' | 'PUBLIC'; maxAge: number };
