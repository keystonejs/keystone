import type { CacheHint } from 'apollo-server-types';
import type { MaybePromise } from '../utils';
import { BaseListTypeInfo, BaseModelTypeInfo } from '../type-info';
import { KeystoneContextFromModelTypeInfo } from '..';
import type { ListHooks } from './hooks';
import type { ListAccessControl } from './access-control';
import type { BaseFields, FilterOrderArgs } from './fields';

export type ModelsConfig = Record<string, ModelConfig>;

export type IdFieldConfig =
  | { kind: 'cuid' | 'uuid' }
  | {
      kind: 'autoincrement';
      /**
       * Configures the database type of the id field. Only `Int` is supported on SQLite.
       * @default 'Int'
       */
      type?: 'Int' | 'BigInt';
    };

export type ModelConfig = ListConfig<any, any> | SingletonConfig;

type CommonModelConfig<
  ModelTypeInfo extends BaseModelTypeInfo,
  Fields extends BaseFields<ModelTypeInfo>
> = {
  fields: Fields;
};

// TODO: make this type use types with good names, generic, doc comments, etc. like the ListConfig
export type SingletonConfig = CommonModelConfig<
  BaseModelTypeInfo,
  BaseFields<BaseModelTypeInfo>
> & {
  kind: 'singleton';
  description?: string;
  ui?: CommonModelAdminUIConfig<BaseModelTypeInfo, any>;
  // TODO: this should not be list access control, singletons have a subset of list access control
  access?: ListAccessControl<BaseListTypeInfo>;
  // TODO: this should not be list hooks, singletons have a subset of list hooks
  hooks?: ListHooks<BaseModelTypeInfo>;
  graphql?: CommonModelGraphQLConfig & {
    omit?: true | readonly ('query' | 'create' | 'update' | 'delete')[];
  };
  db?: CommonModelDBConfig;
};

export type ListConfig<
  ListTypeInfo extends BaseListTypeInfo,
  Fields extends BaseFields<BaseListTypeInfo>
> = CommonModelConfig<ListTypeInfo, Fields> & {
  kind: 'list';

  /**
   * Controls what data users of the Admin UI and GraphQL can access and change
   * @default true
   * @see https://www.keystonejs.com/guides/auth-and-access-control
   */
  access?: ListAccessControl<ListTypeInfo>;

  /** Config for how this model should act in the Admin UI */
  ui?: ListAdminUIConfig<ListTypeInfo, Fields>;

  /**
   * Hooks to modify the behaviour of GraphQL operations at certain points
   * @see https://www.keystonejs.com/guides/hooks
   */
  hooks?: ListHooks<ListTypeInfo>;

  graphql?: ListGraphQLConfig;

  db?: ListDBConfig;

  /**
   * Defaults the Admin UI and GraphQL descriptions
   */
  description?: string; // defaults both { adminUI: { description }, graphQL: { description } }

  // Defaults to apply to all fields.
  defaultIsFilterable?: false | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>); // The default value to use for graphql.isEnabled.filter on all fields for this model
  defaultIsOrderable?: false | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>); // The default value to use for graphql.isEnabled.orderBy on all fields for this model
};

type CommonModelAdminUIConfig<
  ModelTypeInfo extends BaseModelTypeInfo,
  Fields extends BaseFields<ModelTypeInfo>
> = {
  /**
   * The label used to identify the model in navigation and etc.
   * @default modelKey.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
   */
  label?: string;

  /**
   * The singular form of the model key.
   *
   * It is used in sentences like `Are you sure you want to delete these {plural}?`
   * @default pluralize.singular(label)
   */
  singular?: string;

  /**
   * The path segment to identify the model in URLs.
   *
   * It must match the pattern `/^[a-z-_][a-z0-9-_]*$/`.
   * @default label.split(' ').join('-').toLowerCase()
   */
  path?: string;

  /**
   * The description shown on the model page
   * @default modelConfig.description
   */
  description?: string; // the description displayed below the field in the Admin UI

  /**
   * Configuration specific to the item view in the Admin UI
   */
  itemView?: {
    /**
     * The default field mode for fields on the item view for this model.
     * This controls what people can do for fields
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ModelTypeInfo>;
  };

  /**
   * Excludes this model from the Admin UI
   * @default false
   */
  isHidden?: MaybeSessionFunction<boolean, ModelTypeInfo>;
};

export type ListAdminUIConfig<
  ListTypeInfo extends BaseListTypeInfo,
  Fields extends BaseFields<ListTypeInfo>
> = CommonModelAdminUIConfig<ListTypeInfo, Fields> & {
  /**
   * The field to use as a label in the Admin UI. If you want to base the label off more than a single field, use a virtual field and reference that field here.
   * @default 'label', if it exists, falling back to 'name', then 'title', and finally 'id', which is guaranteed to exist.
   */
  labelField?: 'id' | keyof Fields;
  /**
   * The fields used by the Admin UI when searching this model.
   * It is always possible to search by id and `id` should not be specified in this option.
   * @default The `labelField` if it has a string `contains` filter, otherwise none.
   */
  searchFields?: readonly Extract<keyof Fields, string>[];

  /**
   * Hides the create button in the Admin UI.
   * Note that this does **not** disable creating items through the GraphQL API, it only hides the button to create an item for this model in the Admin UI.
   * @default false
   */
  hideCreate?: MaybeSessionFunction<boolean, ListTypeInfo>;
  /**
   * Hides the delete button in the Admin UI.
   * Note that this does **not** disable deleting items through the GraphQL API, it only hides the button to delete an item for this model in the Admin UI.
   * @default false
   */
  hideDelete?: MaybeSessionFunction<boolean, ListTypeInfo>;
  /**
   * Configuration specific to the create view in the Admin UI
   */
  createView?: {
    /**
     * The default field mode for fields on the create view for this model.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo>;
  };

  /**
   * Configuration specific to the list view in the Admin UI
   */
  listView?: {
    /**
     * The default field mode for fields on the list view for this model.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'read'
     */
    defaultFieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo>;
    /**
     * The columns(which refer to fields) that should be shown to users of the Admin UI.
     * Users of the Admin UI can select different columns to show in the UI.
     * @default the first three fields in the model
     */
    initialColumns?: readonly ('id' | keyof Fields)[];
    // was previously top-level defaultSort
    initialSort?: { field: 'id' | keyof Fields; direction: 'ASC' | 'DESC' };
    // was previously defaultPageSize
    pageSize?: number; // default number of items to display per page on the list screen
    // note: we are removing maximumPageSize
  };

  /**
   * The plural form of the model key.
   *
   * It is used in sentences like `Are you sure you want to delete this {singular}?`.
   * @default pluralize.plural(label)
   */
  plural?: string;
};

export type MaybeSessionFunction<
  T extends string | boolean,
  ModelTypeInfo extends BaseModelTypeInfo
> =
  | T
  | ((args: {
      session: any;
      context: KeystoneContextFromModelTypeInfo<ModelTypeInfo>;
    }) => MaybePromise<T>);

export type MaybeItemFunction<T, ModelTypeInfo extends BaseModelTypeInfo> =
  | T
  | ((args: {
      session: any;
      context: KeystoneContextFromModelTypeInfo<ModelTypeInfo>;
      item: ModelTypeInfo['item'];
    }) => MaybePromise<T>);

export type CommonModelGraphQLConfig = {
  /**
   * The description added to the GraphQL schema
   * @default modelConfig.description
   */
  description?: string;
};

export type ListGraphQLConfig = CommonModelGraphQLConfig & {
  /**
   * The plural form of the model key to use in the generated GraphQL schema.
   * Note that there is no singular here because the singular used in the GraphQL schema is the list key.
   */
  // was previously top-level modelQueryName
  plural?: string;
  // was previously top-level queryLimits
  queryLimits?: {
    maxResults?: number; // maximum number of items that can be returned in a query (or subquery)
  };
  cacheHint?: ((args: CacheHintArgs) => CacheHint) | CacheHint;
  // Setting any of these values will remove the corresponding operations from the GraphQL schema.
  // Queries:
  //   'query':  Does item()/items() exist?
  // Mutations:
  //   'create': Does createItem/createItems exist? Does `create` exist on the RelationshipInput types?
  //   'update': Does updateItem/updateItems exist?
  //   'delete': Does deleteItem/deleteItems exist?
  // If `true`, then everything will be omitted, including the output type. This makes it a DB only model,
  // including from the point of view of relationships to this model.
  //
  // Default: undefined
  omit?: true | readonly ('query' | 'create' | 'update' | 'delete')[];
};

export type CacheHintArgs = { results: any; operationName?: string; meta: boolean };

type CommonModelDBConfig = {
  /**
   * Specifies an alternative name name for the table to use, if you don't want
   * the default (derived from the model key)
   */
  map?: string;
};

export type ListDBConfig = CommonModelDBConfig & {
  /**
   * The kind of id to use.
   * @default { kind: "cuid" }
   */
  idField?: IdFieldConfig;
};
