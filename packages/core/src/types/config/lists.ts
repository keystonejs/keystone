import type { CacheHint } from '@apollo/cache-control-types'
import type { MaybePromise } from '../utils'
import type { BaseListTypeInfo } from '../type-info'
import type { KeystoneContext } from '../context'
import type { ListHooks } from './hooks'
import type { ListAccessControl } from './access-control'
import type { BaseFields, FilterOrderArgs } from './fields'

export type ListConfig<ListTypeInfo extends BaseListTypeInfo> = {
  isSingleton?: boolean
  fields: BaseFields<ListTypeInfo>

  /**
   * Controls what data users of the Admin UI and GraphQL can access and change
   * @see https://www.keystonejs.com/guides/auth-and-access-control
   */
  access: ListAccessControl<ListTypeInfo>

  /** Config for how this list should act in the Admin UI */
  ui?: ListAdminUIConfig<ListTypeInfo>

  /**
   * Hooks to modify the behaviour of GraphQL operations at certain points
   * @see https://www.keystonejs.com/guides/hooks
   */
  hooks?: ListHooks<ListTypeInfo>

  graphql?: ListGraphQLConfig

  db?: ListDBConfig

  /**
   * Defaults the Admin UI and GraphQL descriptions
   */
  description?: string // defaults both { adminUI: { description }, graphQL: { description } }

  /**
   * The default value to use for graphql.isEnabled.filter on all fields for this list
   */
  defaultIsFilterable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>)

  /**
   * The default value to use for graphql.isEnabled.orderBy on all fields for this list
   */
  defaultIsOrderable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>)
}

export type ListAdminUIConfig<ListTypeInfo extends BaseListTypeInfo> = {
  /**
   * The field to use as a label in the Admin UI. If you want to base the label off more than a single field, use a virtual field and reference that field here.
   * @default 'label', if it exists, falling back to 'name', then 'title', and finally 'id', which is guaranteed to exist.
   */
  labelField?: 'id' | Exclude<keyof BaseFields<ListTypeInfo>, number>
  /**
   * The fields used by the Admin UI when searching this list.
   * It is always possible to search by id and `id` should not be specified in this option.
   * @default The `labelField` if it has a string `contains` filter, otherwise none.
   */
  searchFields?: readonly Extract<keyof BaseFields<ListTypeInfo>, string>[]

  /** The path that the list should be at in the Admin UI */
  // Not currently used. Should be passed into `keystone.createList()`.
  // path?: string;
  /**
   * The description shown on the list page
   * @default listConfig.description
   */
  description?: string // the description displayed below the field in the Admin UI

  /**
   * Excludes this list from the Admin UI
   * @default false
   */
  isHidden?: MaybeSessionFunction<boolean, ListTypeInfo>
  /**
   * Hides the create button in the Admin UI.
   * Note that this does **not** disable creating items through the GraphQL API, it only hides the button to create an item for this list in the Admin UI.
   * @default false
   */
  hideCreate?: MaybeSessionFunction<boolean, ListTypeInfo>
  /**
   * Hides the delete button in the Admin UI.
   * Note that this does **not** disable deleting items through the GraphQL API, it only hides the button to delete an item for this list in the Admin UI.
   * @default false
   */
  hideDelete?: MaybeSessionFunction<boolean, ListTypeInfo>
  /**
   * Configuration specific to the create view in the Admin UI
   */
  createView?: {
    /**
     * The default field mode for fields on the create view for this list.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo>
  }

  /**
   * Configuration specific to the item view in the Admin UI
   */
  itemView?: {
    /**
     * The default field mode for fields on the item view for this list.
     * This controls what people can do for fields
     * Specific field modes on a per-field basis via a field's config.
     * @default 'edit'
     */
    defaultFieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ListTypeInfo>
  }

  /**
   * Configuration specific to the list view in the Admin UI
   */
  listView?: {
    /**
     * The default field mode for fields on the list view for this list.
     * Specific field modes on a per-field basis via a field's config.
     * @default 'read'
     */
    defaultFieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo>
    /**
     * The columns(which refer to fields) that should be shown to users of the Admin UI.
     * Users of the Admin UI can select different columns to show in the UI.
     * @default the first three fields in the list
     */
    initialColumns?: readonly ('id' | keyof BaseFields<ListTypeInfo>)[]
    // was previously top-level defaultSort
    initialSort?: { field: 'id' | keyof BaseFields<ListTypeInfo>, direction: 'ASC' | 'DESC' }
    // was previously defaultPageSize
    pageSize?: number // default number of items to display per page on the list screen
  }

  /**
   * The label used to identify the list in navigation and etc.
   * @default listKey.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
   */
  label?: string

  /**
   * The singular form of the list key.
   *
   * It is used in sentences like `Are you sure you want to delete these {plural}?`
   * @default pluralize.singular(label)
   */
  singular?: string

  /**
   * The plural form of the list key.
   *
   * It is used in sentences like `Are you sure you want to delete this {singular}?`.
   * @default pluralize.plural(label)
   */
  plural?: string

  /**
   * The path segment to identify the list in URLs.
   *
   * It must match the pattern `/^[a-z-_][a-z0-9-_]*$/`.
   * @default label.split(' ').join('-').toLowerCase()
   */
  path?: string
}

export type MaybeSessionFunction<
  T extends string | boolean,
  ListTypeInfo extends BaseListTypeInfo
> =
  | T
  | ((args: {
      context: KeystoneContext<ListTypeInfo['all']>
      session?: ListTypeInfo['all']['session']
    }) => MaybePromise<T>)

export type MaybeItemFunction<T, ListTypeInfo extends BaseListTypeInfo> =
  | T
  | ((args: {
      context: KeystoneContext<ListTypeInfo['all']>
      session?: ListTypeInfo['all']['session']
      item: ListTypeInfo['item']
    }) => MaybePromise<T>)

export type ListGraphQLConfig = {
  /**
   * The description added to the GraphQL schema
   * @default listConfig.description
   */
  description?: string
  /**
   * The plural form of the list key to use in the generated GraphQL schema.
   * Note that there is no singular here because the singular used in the GraphQL schema is the list key.
   */
  plural?: string
  /**
   * The maximum value for the take parameter when querying this list
   */
  maxTake?: number
  cacheHint?: ((args: CacheHintArgs) => CacheHint) | CacheHint
  // Setting any of these values will remove the corresponding operations from the GraphQL schema.
  // Queries:
  //   'query':  Does item()/items() exist?
  // Mutations:
  //   'create': Does createItem/createItems exist? Does `create` exist on the RelationshipInput types?
  //   'update': Does updateItem/updateItems exist?
  //   'delete': Does deleteItem/deleteItems exist?
  // If `true`, then everything will be omitted, including the output type. This makes it a DB only list,
  // including from the point of view of relationships to this list.
  //
  // Default: undefined
  omit?:
    | boolean
    | {
        query?: boolean
        create?: boolean
        update?: boolean
        delete?: boolean
      }
}

export type CacheHintArgs = { results: any, operationName?: string, meta: boolean }

// TODO: duplicate, merge with next-fields?
export type IdFieldConfig =
  | {
      kind: 'random'
      type?: 'String'
      bytes?: number
      encoding?: 'hex' | 'base64url'
    }
  | { kind: 'cuid' | 'uuid' | 'string', type?: 'String' }
  | { kind: 'autoincrement', type?: 'Int' | 'BigInt' }
  | { kind: 'number', type: 'Int' | 'BigInt' }

export type ListDBConfig = {
  /**
   * The kind of id to use.
   * @default { kind: "cuid" }
   */
  idField?: IdFieldConfig
  /**
   * Specifies an alternative name name for the table to use, if you don't want
   * the default (derived from the list key)
   */
  map?: string
  /**
   * Customise the Prisma Schema for this list. This function is passed the
   * Prisma Model for this list and should return a string containing the valid
   * Prisma Model definition.
   */
  extendPrismaSchema?: (schema: string) => string
}
