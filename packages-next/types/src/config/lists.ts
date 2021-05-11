import type { BaseGeneratedListTypes, MaybePromise } from '../utils';
import { FieldTypeFunc } from '../next-fields';
import type { ListHooks } from './hooks';
import type { ListAccessControl } from './access-control';
import type { BaseFields } from './fields';

export type ListSchemaConfig = Record<
  string,
  ListConfig<BaseGeneratedListTypes, BaseFields<BaseGeneratedListTypes>>
>;

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

  idField?: FieldTypeFunc;

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

  graphql?: ListGraphQLConfig;

  db?: ListDBConfig;

  /**
   * Defaults the Admin UI and GraphQL descriptions
   */
  description?: string; // defaults both { adminUI: { description }, graphQL: { description } }

  /**
   * The label used for the list
   * @default listKey.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
   */
  label?: string;

  /**
   * The singular form of the list key
   * @default pluralize.singular(label)
   */
  singular?: string;

  /**
   * The plural form of the list key
   * @default pluralize.plural(label)
   */
  plural?: string;

  /**
   * The path used in the Admin UI
   */
  // (should be in ui?)
  path?: string;

  // TODO: Come back to how we can facilitate unique fields and combinations of fields (for
  // queries, upserts, etc, in particular follow Prisma's design)
};

export type ListAdminUIConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes,
  Fields extends BaseFields<TGeneratedListTypes>
> = {
  /**
   * The field to use as a label in the Admin UI. If you want to base the label off more than a single field, use a virtual field and reference that field here.
   * @default 'label', if it exists, falling back to 'name', then 'title', and finally 'id', which is guaranteed to exist.
   */
  labelField?: keyof Fields;

  /** The path that the list should be at in the Admin UI */
  // Not currently used. Should be passed into `keystone.createList()`.
  // path?: string;
  /**
   * The description shown on the list page
   * @default listConfig.description
   */
  description?: string; // the description displayed below the field in the Admin UI

  /**
   * Excludes this list from the Admin UI
   * @default false
   */
  isHidden?: MaybeSessionFunction<boolean>;
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
  // cacheHint?: CacheHint;
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

export type ListDBConfig = {
  /**
   * The name of the field to use for `search` filter operations.
   * @default "name""
   */
  searchField?: string;
};

// export type CacheHint = { scope: 'PRIVATE' | 'PUBLIC'; maxAge: number };
