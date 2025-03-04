import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  fieldType,
} from '../../../types'
import { g } from '../../..'
import {
  type ListMetaSource,
  getAdminMetaForRelationshipField,
} from '../../../lib/create-admin-meta'
import { type controller } from './views'

// This is the default display mode for Relationships
type SelectDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a Select field
    displayMode?: 'select'
    /**
     * The path of the field to use from the related list for item labels in the select.
     * Defaults to the labelField configured on the related list.
     */
    labelField?: string
    searchFields?: string[]
  }
}

type CountDisplayConfig = {
  many: true
  ui?: {
    // Sets the relationship to display as a count
    displayMode: 'count'
    itemView: {
      fieldMode: 'read'
    }
  }
}

type TableDisplayConfig = {
  ref: `${string}.${string}`
  many: true
  ui?: {
    displayMode: 'table'
    itemView: {
      fieldMode: 'read'
    }
    initialSort?: { field: string; direction: 'ASC' | 'DESC' }
    columns?: string[]
  }
}

type OneDbConfig = {
  many?: false
  db?: {
    extendPrismaSchema?: (field: string) => string
    foreignKey?:
      | true
      | {
          map: string
        }
  }
}

type ManyDbConfig = {
  many: true
  db?: {
    relationName?: string
    extendPrismaSchema?: (field: string) => string
  }
}

function throwIfMissingFields(
  localListMeta: ListMetaSource,
  foreignListMeta: ListMetaSource,
  refLabelField: string,
  refSearchFields: string[],
  fieldKey: string
) {
  if (!(refLabelField in foreignListMeta.fieldsByKey)) {
    throw new Error(
      `"${refLabelField}" is not a field of list "${foreignListMeta.key}", configured as labelField for "${localListMeta.key}.${fieldKey}"`
    )
  }

  for (const searchFieldKey of refSearchFields) {
    const field = foreignListMeta.fieldsByKey[searchFieldKey]
    if (!field)
      throw new Error(
        `"${searchFieldKey}" is not a field of list "${foreignListMeta.key}", configured as searchField for "${localListMeta.key}.${fieldKey}"`
      )

    if (field.search === null)
      throw new Error(
        `"${searchFieldKey}" is not a searchable field of list "${foreignListMeta.key}", configured as searchField for "${localListMeta.key}.${fieldKey}"`
      )
  }
}

export type RelationshipFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    many?: boolean
    ref: string
    ui?: {
      hideCreate?: boolean
    }
  } & (OneDbConfig | ManyDbConfig) &
    (SelectDisplayConfig | CountDisplayConfig | TableDisplayConfig)

export function relationship<ListTypeInfo extends BaseListTypeInfo>({
  ref,
  ...config
}: RelationshipFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  const { many = false } = config
  const [foreignListKey, foreignFieldKey] = ref.split('.') as [string, string | undefined]

  return ({ fieldKey, listKey, lists }) => {
    const foreignList = lists[foreignListKey]
    if (!foreignList)
      throw new Error(`${listKey}.${fieldKey} points to ${ref}, but ${ref} doesn't exist`)

    const foreignListTypes = foreignList.types
    const commonConfig = {
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/relationship',
      views: '@keystone-6/core/fields/types/relationship/views',
      getAdminMeta: (): Parameters<typeof controller>[0]['fieldMeta'] => {
        const adminMetaRoot = getAdminMetaForRelationshipField()
        const localListMeta = adminMetaRoot.listsByKey[listKey]
        const foreignListMeta = adminMetaRoot.listsByKey[foreignListKey]

        if (!foreignListMeta) {
          throw new Error(`The ref [${ref}] on relationship [${listKey}.${fieldKey}] is invalid`)
        }

        const refLabelField = foreignListMeta.labelField
        const refSearchFields = foreignListMeta.initialSearchFields

        const hasOmittedCreate =
          !lists[foreignListKey].types.relateTo[
            many ? 'many' : 'one'
          ].create.graphQLType.getFields().create
        const hideCreate = config.ui?.hideCreate ?? hasOmittedCreate
        if (!hideCreate && hasOmittedCreate) {
          throw new Error(
            `${listKey}.${fieldKey} has ui.hideCreate: false, but the related list ${foreignListKey} has graphql.omit.create: true`
          )
        }

        if (config.ui?.displayMode === 'count') {
          if (config.ui.itemView?.fieldMode !== 'read') {
            throw new Error(
              `displayMode: 'count' on relationship fields requires itemView.fieldMode to be 'read' but ${listKey}.${fieldKey} does not have this set`
            )
          }
          return {
            displayMode: 'count',
            refListKey: foreignListKey,
            refFieldKey: foreignFieldKey,
            many,
            hideCreate,
            refLabelField,
            refSearchFields,
          }
        }

        if (config.ui?.displayMode === 'table') {
          if (!foreignFieldKey) {
            throw new Error(
              `Using a two-sided relationship (\`ref\` must specify "List.fieldKey", not just "List") is required when using displayMode: 'table' for relationship fields but ${listKey}.${fieldKey} has \`ref: ${JSON.stringify(ref)}\``
            )
          }
          if (config.ui.itemView?.fieldMode !== 'read') {
            throw new Error(
              `displayMode: 'table' on relationship fields currently requires itemView.fieldMode to be 'read' but ${listKey}.${fieldKey} does not have this set`
            )
          }
          for (const key of config.ui.columns ?? []) {
            if (!(key in foreignListMeta.fieldsByKey)) {
              throw new Error(
                `The field "${foreignListMeta.key}.${key}" does not exist, configured as a column for "${localListMeta.key}.${fieldKey}"`
              )
            }
          }
          if (config.ui.initialSort) {
            const field = foreignListMeta.fieldsByKey[config.ui.initialSort.field]
            if (!field) {
              throw new Error(
                `The field "${foreignListMeta.key}.${config.ui.initialSort.field}" does not exist, configured as the initialSort field for "${localListMeta.key}.${fieldKey}"`
              )
            }
            if (!field.isOrderable) {
              throw new Error(
                `The field "${foreignListMeta.key}.${config.ui.initialSort.field}" is not orderable, configured as the initialSort field for "${localListMeta.key}.${fieldKey}"`
              )
            }
          }
          return {
            displayMode: 'table',
            refListKey: foreignListKey,
            refFieldKey: foreignFieldKey,
            initialSort: config.ui.initialSort ?? foreignListMeta.initialSort ?? null,
            columns: config.ui.columns ?? null,
            many,
            hideCreate,
            refLabelField,
            refSearchFields,
          }
        }

        // prefer the local definition to the foreign list, if provided
        const specificRefLabelField = config.ui?.labelField || refLabelField
        const specificRefSearchFields = config.ui?.searchFields || refSearchFields
        throwIfMissingFields(
          localListMeta,
          foreignListMeta,
          specificRefLabelField,
          specificRefSearchFields,
          fieldKey
        )
        return {
          displayMode: 'select',
          refListKey: foreignListKey,
          refFieldKey: foreignFieldKey,
          many,
          hideCreate,
          refLabelField: specificRefLabelField,
          refSearchFields: specificRefSearchFields,
        }
      },
    }

    if (config.many) {
      return fieldType({
        kind: 'relation',
        mode: 'many',
        list: foreignListKey,
        field: foreignFieldKey,
        relationName: config.db?.relationName,
        extendPrismaSchema: config.db?.extendPrismaSchema,
      })({
        ...commonConfig,
        input: {
          where: {
            arg: g.arg({ type: foreignListTypes.relateTo.many.where }),
            resolve(value, context, resolve) {
              return resolve(value)
            },
          },
          create: {
            arg: g.arg({ type: foreignListTypes.relateTo.many.create }),
            async resolve(value, context, resolve) {
              return resolve(value)
            },
          },
          update: {
            arg: g.arg({ type: foreignListTypes.relateTo.many.update }),
            async resolve(value, context, resolve) {
              return resolve(value)
            },
          },
        },
        output: g.field({
          args: foreignListTypes.findManyArgs,
          type: g.list(g.nonNull(foreignListTypes.output)),
          resolve({ value }, args) {
            return value.findMany(args)
          },
        }),
        extraOutputFields: {
          [`${fieldKey}Count`]: g.field({
            type: g.Int,
            args: {
              where: g.arg({
                type: g.nonNull(foreignListTypes.where),
                defaultValue: {},
              }),
            },
            resolve({ value }, args) {
              return value.count({
                where: args.where,
              })
            },
          }),
        },
      })
    }

    return fieldType({
      kind: 'relation',
      mode: 'one',
      list: foreignListKey,
      field: foreignFieldKey,
      foreignKey: config.db?.foreignKey,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...commonConfig,
      input: {
        where: {
          arg: g.arg({ type: foreignListTypes.where }),
          resolve(value, context, resolve) {
            return resolve(value)
          },
        },
        create: foreignListTypes.relateTo.one.create && {
          arg: g.arg({ type: foreignListTypes.relateTo.one.create }),
          async resolve(value, context, resolve) {
            return resolve(value)
          },
        },

        update: foreignListTypes.relateTo.one.update && {
          arg: g.arg({ type: foreignListTypes.relateTo.one.update }),
          async resolve(value, context, resolve) {
            return resolve(value)
          },
        },
      },
      output: g.field({
        type: foreignListTypes.output,
        resolve({ value }) {
          return value()
        },
      }),
    })
  }
}
