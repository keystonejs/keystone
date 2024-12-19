import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  fieldType
} from '../../../types'
import { graphql } from '../../..'
import {
  type ListMetaRootVal,
  getAdminMetaForRelationshipField
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

function throwIfMissingFields (
  localListMeta: ListMetaRootVal,
  foreignListMeta: ListMetaRootVal,
  refLabelField: string,
  refSearchFields: string[]
) {
  if (!(refLabelField in foreignListMeta.fieldsByKey)) {
    throw new Error(`"${refLabelField}" is not a field of list "${foreignListMeta.key}"`)
  }

  for (const searchFieldKey of refSearchFields) {
    if (searchFieldKey in foreignListMeta.fieldsByKey) continue
    throw new Error(`"${refSearchFields}" is not a field of list "${foreignListMeta.key}"`)
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
    (SelectDisplayConfig | CountDisplayConfig)

export function relationship <ListTypeInfo extends BaseListTypeInfo>({
  ref,
  ...config
}: RelationshipFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return ({ fieldKey, listKey, lists }) => {
    const { many = false } = config
    const [foreignListKey, foreignFieldKey] = ref.split('.')
    const foreignList = lists[foreignListKey]
    if (!foreignList) throw new Error(`${listKey}.${fieldKey} points to ${ref}, but ${ref} doesn't exist`)

    const foreignListTypes = foreignList.types
    const commonConfig = {
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/relationship',
      views: '@keystone-6/core/fields/types/relationship/views',
      getAdminMeta: (): Parameters<typeof controller>[0]['fieldMeta'] => {
        const adminMetaRoot = getAdminMetaForRelationshipField()
        const localListMeta = adminMetaRoot.listsByKey[foreignListKey]
        const foreignListMeta = adminMetaRoot.listsByKey[foreignListKey]

        if (!foreignListMeta) {
          throw new Error(`The ref [${ref}] on relationship [${listKey}.${fieldKey}] is invalid`)
        }

        const refLabelField = foreignListMeta.labelField
        const refSearchFields = foreignListMeta.initialSearchFields
        const hideCreate = config.ui?.hideCreate ?? false

        if (config.ui?.displayMode === 'count') {
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

        // prefer the local definition to the foreign list, if provided
        const specificRefLabelField = config.ui?.labelField || refLabelField
        const specificRefSearchFields = config.ui?.searchFields || refSearchFields
        throwIfMissingFields(localListMeta, foreignListMeta, specificRefLabelField, specificRefSearchFields)
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
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.where }),
            resolve (value, context, resolve) {
              return resolve(value)
            },
          },
          create: {
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.create }),
            async resolve (value, context, resolve) {
              return resolve(value)
            },
          },
          update: {
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.update }),
            async resolve (value, context, resolve) {
              return resolve(value)
            },
          },
        },
        output: graphql.field({
          args: foreignListTypes.findManyArgs,
          type: graphql.list(graphql.nonNull(foreignListTypes.output)),
          resolve ({ value }, args) {
            return value.findMany(args)
          },
        }),
        extraOutputFields: {
          [`${fieldKey}Count`]: graphql.field({
            type: graphql.Int,
            args: {
              where: graphql.arg({
                type: graphql.nonNull(foreignListTypes.where),
                defaultValue: {},
              }),
            },
            resolve ({ value }, args) {
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
          arg: graphql.arg({ type: foreignListTypes.where }),
          resolve (value, context, resolve) {
            return resolve(value)
          },
        },
        create: foreignListTypes.relateTo.one.create && {
          arg: graphql.arg({ type: foreignListTypes.relateTo.one.create }),
          async resolve (value, context, resolve) {
            return resolve(value)
          },
        },

        update: foreignListTypes.relateTo.one.update && {
          arg: graphql.arg({ type: foreignListTypes.relateTo.one.update }),
          async resolve (value, context, resolve) {
            return resolve(value)
          },
        },
      },
      output: graphql.field({
        type: foreignListTypes.output,
        resolve ({ value }) {
          return value()
        },
      }),
    })
  }
}
