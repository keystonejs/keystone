import { type CacheHint } from '@apollo/cache-control-types'
import { GraphQLString, isInputObjectType } from 'graphql'
import {
  type BaseItem,
  type BaseListTypeInfo,
  type CacheHintArgs,
  type FindManyArgs,
  type GraphQLTypesForList,
  type ListGraphQLTypes,
  type ListHooks,
  type __ResolvedKeystoneConfig,
  type MaybePromise,
  type NextFieldType,
  type FieldTypeFunc,
  QueryMode
} from '../../types'
import {
  type GraphQLNames,
  __getNames,
} from '../../types/utils'
import { graphql } from '../..'
import {
  type FieldHooks,
  type ResolvedListHooks,
  type ResolvedFieldHooks
} from '../../types/config/hooks'
import {
  Empty,
} from '../../types/schema/graphql-ts-schema'
import {
  type FilterOrderArgs
} from '../../types/config/fields'
import {
  type MaybeItemFunction,
  type MaybeSessionFunction
} from '../../types/config/lists'
import {
  type ResolvedFieldAccessControl,
  type ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control'
import { areArraysEqual } from './utils'
import {
  type ResolvedDBField,
  resolveRelationships
} from './resolve-relationships'
import { outputTypeField } from './queries/output-field'
import { assertFieldsValid } from './field-assertions'

export type InitialisedField = {
  fieldKey: string

  access: ResolvedFieldAccessControl
  dbField: ResolvedDBField
  hooks: ResolvedFieldHooks<BaseListTypeInfo>
  graphql: {
    isEnabled: {
      read: boolean
      create: boolean
      update: boolean
      filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>)
      orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>)
    }
    isNonNull: {
      read: boolean
      create: boolean
      update: boolean
    }
    cacheHint: CacheHint | undefined
  }
  ui: {
    label: string | null
    description: string | null
    views: string | null
    createView: {
      fieldMode: MaybeSessionFunction<'edit' | 'hidden', any>
    }
    itemView: {
      fieldMode: MaybeItemFunction<'read' | 'edit' | 'hidden', any>
      fieldPosition: MaybeItemFunction<'form' | 'sidebar', any>
    }
    listView: {
      fieldMode: MaybeSessionFunction<'read' | 'hidden', any>
    }
  }
} & Pick<
  NextFieldType,
  | 'input'
  | 'output'
  | 'getAdminMeta'
  | 'views'
  | '__ksTelemetryFieldTypeName'
  | 'extraOutputFields'
  | 'unreferencedConcreteInterfaceImplementations'
>

export type InitialisedList = {
  listKey: string

  access: ResolvedListAccessControl

  fields: Record<string, InitialisedField>
  groups: {
    fields: BaseListTypeInfo['fields'][]
    label: string
    description: string | null
  }[]

  hooks: ResolvedListHooks<BaseListTypeInfo>

  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>
  lists: Record<string, InitialisedList>

  graphql: {
    types: GraphQLTypesForList
    names: GraphQLNames
    namePlural: string // TODO: remove
    isEnabled: IsListEnabled
  }

  prisma: {
    types: GraphQLNames // TODO: not completely appropriate, but what is used for now
    listKey: string
    mapping: string | undefined
    extendPrismaSchema: ((schema: string) => string) | undefined
  }

  ui: {
    labels: { label: string, singular: string, plural: string, path: string }
    labelField: string
    searchFields: Set<string>
    searchableFields: Map<string, 'default' | 'insensitive' | null>
  }

  isSingleton: boolean
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined
}

type IsListEnabled = {
  type: boolean
  query: boolean
  create: boolean
  update: boolean
  delete: boolean
  filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>)
  orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>)
}

function throwIfNotAFilter (x: unknown, listKey: string, fieldKey: string) {
  if (['boolean', 'undefined', 'function'].includes(typeof x)) return
  throw new Error(`Configuration option '${listKey}.${fieldKey}' must be either a boolean value or a function. Received '${x}'.`)
}

type ListConfigType = __ResolvedKeystoneConfig['lists'][string]
type FieldConfigType = ReturnType<FieldTypeFunc<any>>
type PartiallyInitialisedList1 = { graphql: { isEnabled: IsListEnabled } }
type PartiallyInitialisedList2 = Omit<InitialisedList, 'lists' | 'resolvedDbFields'>

function getIsEnabled (listKey: string, listConfig: ListConfigType) {
  const omit = listConfig.graphql?.omit ?? false
  const {
    defaultIsFilterable = true,
    defaultIsOrderable = true
  } = listConfig

  // TODO: check types in initConfig
  throwIfNotAFilter(defaultIsFilterable, listKey, 'defaultIsFilterable')
  throwIfNotAFilter(defaultIsOrderable, listKey, 'defaultIsOrderable')

  if (typeof omit === 'boolean') {
    const notOmit = !omit
    return {
      type: notOmit,
      query: notOmit,
      create: notOmit,
      update: notOmit,
      delete: notOmit,
      filter: notOmit ? defaultIsFilterable : false,
      orderBy: notOmit ? defaultIsOrderable : false,
    }
  }

  return {
    type: true,
    query: !omit.query,
    create: !omit.create,
    update: !omit.update,
    delete: !omit.delete,
    filter: defaultIsFilterable,
    orderBy: defaultIsOrderable,
  }
}

function getIsEnabledField (f: FieldConfigType, listKey: string, list: PartiallyInitialisedList1, lists: Record<string, PartiallyInitialisedList1>) {
  const omit = f.graphql?.omit ?? false
  const {
    isFilterable = list.graphql.isEnabled.filter,
    isOrderable = list.graphql.isEnabled.orderBy,
  } = f

  // TODO: check types in initConfig
  throwIfNotAFilter(isFilterable, listKey, 'isFilterable')
  throwIfNotAFilter(isOrderable, listKey, 'isOrderable')

  if (f.dbField.kind === 'relation') {
    if (!lists[f.dbField.list].graphql.isEnabled.type) {
      return {
        type: false,
        read: false,
        create: false,
        update: false,
        filter: false,
        orderBy: false,
      }
    }
  }

  if (typeof omit === 'boolean') {
    const notOmit = !omit
    return {
      type: notOmit,
      read: notOmit,
      create: notOmit,
      update: notOmit,
      filter: notOmit ? isFilterable : false,
      orderBy: notOmit ? isOrderable : false,
    }
  }

  return {
    type: true,
    read: !omit.read,
    create: !omit.create,
    update: !omit.update,
    filter: !omit.read ? isFilterable : false, // prevent filtering if read is false
    orderBy: !omit.read ? isOrderable : false, // prevent ordering if read is false
  }
}

function defaultOperationHook () {}
function defaultListHooksResolveInput ({ resolvedData }: { resolvedData: any }) {
  return resolvedData
}

function parseListHooksResolveInput (f: ListHooks<BaseListTypeInfo>['resolveInput']) {
  if (typeof f === 'function') {
    return {
      create: f,
      update: f,
    }
  }

  const {
    create = defaultListHooksResolveInput,
    update = defaultListHooksResolveInput
  } = f ?? {}
  return { create, update }
}

function parseListHooksValidate (f: ListHooks<BaseListTypeInfo>['validate']) {
  if (typeof f === 'function') {
    return {
      create: f,
      update: f,
      delete: f,
    }
  }

  const {
    create = defaultOperationHook,
    update = defaultOperationHook,
    delete: delete_ = defaultOperationHook,
  } = f ?? {}
  return { create, update, delete: delete_ }
}

function parseListHooksBeforeOperation (f: ListHooks<BaseListTypeInfo>['beforeOperation']) {
  if (typeof f === 'function') {
    return {
      create: f,
      update: f,
      delete: f,
    }
  }

  const {
    create = defaultOperationHook,
    update = defaultOperationHook,
    delete: _delete = defaultOperationHook,
  } = f ?? {}
  return { create, update, delete: _delete }
}

function parseListHooksAfterOperation (f: ListHooks<BaseListTypeInfo>['afterOperation']) {
  if (typeof f === 'function') {
    return {
      create: f,
      update: f,
      delete: f,
    }
  }

  const {
    create = defaultOperationHook,
    update = defaultOperationHook,
    delete: _delete = defaultOperationHook,
  } = f ?? {}
  return { create, update, delete: _delete }
}

function parseListHooks (hooks: ListHooks<BaseListTypeInfo>): ResolvedListHooks<BaseListTypeInfo> {
  return {
    resolveInput: parseListHooksResolveInput(hooks.resolveInput),
    validate: parseListHooksValidate(hooks.validate),
    beforeOperation: parseListHooksBeforeOperation(hooks.beforeOperation),
    afterOperation: parseListHooksAfterOperation(hooks.afterOperation),
  }
}

function defaultFieldHooksResolveInput ({
  resolvedData,
  fieldKey,
}: {
  resolvedData: any
  fieldKey: string
}) {
  return resolvedData[fieldKey]
}

function parseFieldHooks (
  fieldKey: string,
  hooks: FieldHooks<BaseListTypeInfo>,
): ResolvedFieldHooks<BaseListTypeInfo> {
  /** @deprecated, TODO: remove in breaking change */
  if (hooks.validate !== undefined) {
    if (hooks.validateInput !== undefined) throw new TypeError(`"hooks.validate" conflicts with "hooks.validateInput" for the "${fieldKey}" field`)
    if (hooks.validateDelete !== undefined) throw new TypeError(`"hooks.validate" conflicts with "hooks.validateDelete" for the "${fieldKey}" field`)

    if (typeof hooks.validate === 'function') {
      return parseFieldHooks(fieldKey, {
        ...hooks,
        validate: {
          create: hooks.validate,
          update: hooks.validate,
          delete: hooks.validate,
        }
      })
    }
  }

  return {
    resolveInput: {
      create: hooks.resolveInput ?? defaultFieldHooksResolveInput,
      update: hooks.resolveInput ?? defaultFieldHooksResolveInput,
    },
    validate: {
      create: hooks.validate?.create ?? hooks.validateInput ?? defaultOperationHook,
      update: hooks.validate?.update ?? hooks.validateInput ?? defaultOperationHook,
      delete: hooks.validate?.delete ?? hooks.validateDelete ?? defaultOperationHook,
    },
    beforeOperation: {
      create: hooks.beforeOperation ?? defaultOperationHook,
      update: hooks.beforeOperation ?? defaultOperationHook,
      delete: hooks.beforeOperation ?? defaultOperationHook,
    },
    afterOperation: {
      create: hooks.afterOperation ?? defaultOperationHook,
      update: hooks.afterOperation ?? defaultOperationHook,
      delete: hooks.afterOperation ?? defaultOperationHook,
    },
  }
}

function getListsWithInitialisedFields (
  config: __ResolvedKeystoneConfig,
  listsRef: Record<string, InitialisedList>,
) {
  const { storage: configStorage, lists: listsConfig, db: { provider } } = config
  const intermediateLists = Object.fromEntries(Object.values(config.lists).map((listConfig) => [
    listConfig.listKey,
    {
      graphql: {
        isEnabled: getIsEnabled(listConfig.listKey, listConfig)
      }
    },
  ]))

  const listGraphqlTypes: Record<string, ListGraphQLTypes> = {}

  for (const listConfig of Object.values(listsConfig)) {
    const { listKey } = listConfig
    const {
      graphql: { names },
    } = __getNames(listKey, listConfig)

    const output = graphql.object<BaseItem>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' && !intermediateLists[field.dbField.list].graphql.isEnabled.query)
              ) {
                return []
              }

              const outputFieldRoot = graphqlForOutputField(field)
              return [
                [fieldPath, outputFieldRoot] as const,
                ...Object.entries(field.extraOutputFields || {}),
              ].map(([outputTypeFieldName, outputField]) => {
                return [
                  outputTypeFieldName,
                  outputTypeField(
                    outputField,
                    field.dbField,
                    field.graphql?.cacheHint,
                    field.access.read,
                    listKey,
                    fieldPath,
                    listsRef
                  ),
                ]
              })
            })
          ),
        }
      },
    })

    const uniqueWhere = graphql.inputObject({
      name: names.whereUniqueInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([key, field]) => {
              if (
                !field.input?.uniqueWhere?.arg ||
                !field.graphql.isEnabled.read ||
                !field.graphql.isEnabled.filter
              ) {
                return []
              }
              return [[key, field.input.uniqueWhere.arg]] as const
            })
          ),
          // this is exactly what the id field will add
          // but this does it more explicitly so that typescript understands
          id: graphql.arg({ type: graphql.ID }),
        }
      },
    })

    const where: GraphQLTypesForList['where'] = graphql.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return Object.assign(
          {
            AND: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            OR: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            NOT: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
          },
          ...Object.entries(fields).map(
            ([fieldKey, field]) =>
              field.input?.where?.arg &&
              field.graphql.isEnabled.read &&
              field.graphql.isEnabled.filter && { [fieldKey]: field.input?.where?.arg }
          )
        )
      },
    })

    const create = graphql.inputObject({
      name: names.createInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        const ret: Record<keyof typeof fields, graphql.Arg<graphql.InputType>> = {}

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'create', listsRef)
          if (!arg) continue
          ret[key] = arg
        }

        return ret
      },
    })

    const update = graphql.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        const ret: Record<keyof typeof fields, graphql.Arg<graphql.InputType>> = {}

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'update', listsRef)
          if (!arg) continue
          ret[key] = arg
        }

        return ret
      },
    })

    const orderBy = graphql.inputObject({
      name: names.listOrderName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              !field.input?.orderBy?.arg ||
              !field.graphql.isEnabled.read ||
              !field.graphql.isEnabled.orderBy
            ) {
              return []
            }
            return [[key, field.input.orderBy.arg]] as const
          })
        )
      },
    })

    let take: any = graphql.arg({ type: graphql.Int })
    if (listConfig.graphql?.maxTake !== undefined) {
      take = graphql.arg({
        type: graphql.nonNull(graphql.Int),
        // WARNING: used by queries/resolvers.ts to enforce the limit
        defaultValue: listConfig.graphql.maxTake,
      })
    }

    const findManyArgs: FindManyArgs = {
      where: graphql.arg({
        type: graphql.nonNull(where),
        defaultValue: listConfig.isSingleton ? ({ id: { equals: '1' } } as object) : {},
      }),
      orderBy: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(orderBy))),
        defaultValue: [],
      }),
      take,
      skip: graphql.arg({
        type: graphql.nonNull(graphql.Int),
        defaultValue: 0
      }),
      cursor: graphql.arg({ type: uniqueWhere }),
    }

    const relateToOneForCreate = graphql.inputObject({
      name: names.relateToOneForCreateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: graphql.arg({ type: listRef.graphql.types.create })
          }),
          connect: graphql.arg({ type: listRef.graphql.types.uniqueWhere }),
        }
      },
    })

    const relateToOneForUpdate = graphql.inputObject({
      name: names.relateToOneForUpdateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: graphql.arg({ type: listRef.graphql.types.create })
          }),
          connect: graphql.arg({ type: listRef.graphql.types.uniqueWhere }),
          disconnect: graphql.arg({ type: graphql.Boolean }),
        }
      },
    })

    const relateToManyForCreate = graphql.inputObject({
      name: names.relateToManyForCreateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: graphql.arg({
              type: graphql.list(graphql.nonNull(listRef.graphql.types.create))
            }),
          }),
          connect: graphql.arg({
            type: graphql.list(graphql.nonNull(listRef.graphql.types.uniqueWhere))
          }),
        }
      },
    })

    const relateToManyForUpdate = graphql.inputObject({
      name: names.relateToManyForUpdateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          // WARNING: the order of these fields reflects the order of mutations
          disconnect: graphql.arg({
            type: graphql.list(graphql.nonNull(listRef.graphql.types.uniqueWhere))
          }),
          set: graphql.arg({
            type: graphql.list(graphql.nonNull(listRef.graphql.types.uniqueWhere))
          }),
          ...(listRef.graphql.isEnabled.create && {
            create: graphql.arg({ type: graphql.list(graphql.nonNull(listRef.graphql.types.create)) }),
          }),
          connect: graphql.arg({ type: graphql.list(graphql.nonNull(listRef.graphql.types.uniqueWhere)) }),
        }
      },
    })

    listGraphqlTypes[listKey] = {
      types: {
        output,
        uniqueWhere,
        where,
        create,
        orderBy,
        update,
        findManyArgs,
        relateTo: {
          one: {
            create: relateToOneForCreate,
            update: relateToOneForUpdate
          },
          many: {
            where: graphql.inputObject({
              name: `${listKey}ManyRelationFilter`,
              fields: {
                every: graphql.arg({ type: where }),
                some: graphql.arg({ type: where }),
                none: graphql.arg({ type: where }),
              },
            }),
            create: relateToManyForCreate,
            update: relateToManyForUpdate,
          },
        },
      },
    }
  }

  const result: Record<string, PartiallyInitialisedList2> = {}

  for (const listConfig of Object.values(listsConfig)) {
    const { listKey } = listConfig
    const intermediateList = intermediateLists[listKey]
    const resultFields: Record<string, InitialisedField> = {}
    const groups = []
    const fieldKeys = Object.keys(listConfig.fields)

    for (const [idx, [fieldKey, fieldFunc]] of Object.entries(listConfig.fields).entries()) {
      if (fieldKey.startsWith('__group')) {
        const group = fieldFunc as any
        if (
          typeof group === 'object' &&
          group !== null &&
          typeof group.label === 'string' &&
          (group.description === null || typeof group.description === 'string') &&
          Array.isArray(group.fields) &&
          areArraysEqual(group.fields, fieldKeys.slice(idx + 1, idx + 1 + group.fields.length))
        ) {
          groups.push(group)
          continue
        }
        throw new Error(`unexpected value for a group at ${listKey}.${fieldKey}`)
      }

      if (typeof fieldFunc !== 'function') {
        throw new Error(`The field at ${listKey}.${fieldKey} does not provide a function`)
      }

      const f = fieldFunc({
        fieldKey,
        listKey,
        lists: listGraphqlTypes,
        provider,
        getStorage: storage => configStorage?.[storage],
      })

      const isEnabledField = getIsEnabledField(f, listKey, intermediateList, intermediateLists)
      const fieldModes = {
        create: f.ui?.createView?.fieldMode ?? listConfig.ui?.createView?.defaultFieldMode ?? 'edit',
        item: f.ui?.itemView?.fieldMode ?? listConfig.ui?.itemView?.defaultFieldMode ?? 'edit',
        list: f.ui?.listView?.fieldMode ?? listConfig.ui?.listView?.defaultFieldMode ?? 'read',
      }

      resultFields[fieldKey] = {
        fieldKey,

        dbField: f.dbField as ResolvedDBField,
        access: parseFieldAccessControl(f.access),
        hooks: parseFieldHooks(fieldKey, f.hooks ?? {}),
        graphql: {
          cacheHint: f.graphql?.cacheHint,
          isEnabled: isEnabledField,
          isNonNull: {
            read: f.graphql?.isNonNull?.read ?? false,
            create: f.graphql?.isNonNull?.create ?? false,
            update: f.graphql?.isNonNull?.update ?? false,
          },
        },
        ui: {
          label: f.label ?? null,
          description: f.ui?.description ?? null,
          views: f.ui?.views ?? null,
          createView: {
            fieldMode: isEnabledField.create ? fieldModes.create : 'hidden',
          },

          itemView: {
            fieldPosition: f.ui?.itemView?.fieldPosition ?? 'form',
            fieldMode: isEnabledField.update
              ? fieldModes.item
              : isEnabledField.read && fieldModes.item !== 'hidden'
                ? 'read'
                : 'hidden',
          },

          listView: {
            fieldMode: isEnabledField.read ? fieldModes.list : 'hidden',
          },
        },

        // copy
        __ksTelemetryFieldTypeName: f.__ksTelemetryFieldTypeName,
        extraOutputFields: f.extraOutputFields,
        getAdminMeta: f.getAdminMeta,
        input: { ...f.input },
        output: { ...f.output },
        unreferencedConcreteInterfaceImplementations: f.unreferencedConcreteInterfaceImplementations,
        views: f.views,
      }
    }

    // Default the labelField to `name`, `label`, or `title` if they exist; otherwise fall back to `id`
    const labelField =
      listConfig.ui?.labelField ??
      (listConfig.fields.label
        ? 'label'
        : listConfig.fields.name
        ? 'name'
        : listConfig.fields.title
        ? 'title'
        : 'id')

    const searchFields = new Set(listConfig.ui?.searchFields ?? [])
    if (searchFields.has('id')) {
      throw new Error(`${listKey}.ui.searchFields cannot include 'id'`)
    }

    const names = __getNames(listKey, listConfig)
    result[listKey] = {
      access: parseListAccessControl(listConfig.access),

      fields: resultFields,
      groups,

      graphql: {
        types: {
          ...listGraphqlTypes[listKey].types,
        },
        names: {
          ...names.graphql.names,
        },
        namePlural: names.graphql.namePlural, // TODO: remove
        ...intermediateList.graphql,
      },

      prisma: {
        types: {
          ...names.graphql.names,
        },
        listKey: listKey[0].toLowerCase() + listKey.slice(1),
        mapping: listConfig.db?.map,
        extendPrismaSchema: listConfig.db?.extendPrismaSchema,
      },

      ui: {
        labels: names.ui.labels,
        labelField,
        searchFields,
        searchableFields: new Map<string, 'default' | 'insensitive' | null>(),
      },
      hooks: parseListHooks(listConfig.hooks ?? {}),
      listKey,
      cacheHint: (() => {
        const cacheHint = listConfig.graphql?.cacheHint
        if (typeof cacheHint === 'function') return cacheHint
        if (cacheHint !== undefined) return () => cacheHint
        return undefined
      })(),
      isSingleton: listConfig.isSingleton ?? false,
    }
  }

  return result
}

function introspectGraphQLTypes (lists: Record<string, InitialisedList>) {
  for (const list of Object.values(lists)) {
    const {
      listKey,
      ui: { searchFields, searchableFields },
    } = list

    if (searchFields.has('id')) {
      throw new Error(`The ui.searchFields option on the ${listKey} list includes 'id'. Lists can always be searched by an item's id so it must not be specified as a search field`)
    }

    const whereInputFields = list.graphql.types.where.graphQLType.getFields()
    for (const fieldKey of Object.keys(list.fields)) {
      const filterType = whereInputFields[fieldKey]?.type
      const fieldFilterFields = isInputObjectType(filterType) ? filterType.getFields() : undefined
      if (fieldFilterFields?.contains?.type === GraphQLString) {
        searchableFields.set(
          fieldKey,
          fieldFilterFields?.mode?.type === QueryMode.graphQLType ? 'insensitive' : 'default'
        )
      }
    }

    if (searchFields.size === 0) {
      if (searchableFields.has(list.ui.labelField)) {
        searchFields.add(list.ui.labelField)
      }
    }
  }
}

function stripDefaultValue (thing: graphql.Arg<graphql.InputType, boolean>) {
  return graphql.arg({
    ...thing,
    defaultValue: undefined,
  })
}

function graphqlArgForInputField (field: InitialisedField, operation: 'create' | 'update', listsRef: Record<string, InitialisedList>) {
  const input = field.input?.[operation]
  if (!input?.arg || !field.graphql.isEnabled[operation]) return
  if (field.dbField.kind === 'relation') {
    if (!listsRef[field.dbField.list].graphql.isEnabled.type) return
  }
  if (!field.graphql.isNonNull[operation]) return stripDefaultValue(input.arg)
  if (input.arg.type.kind === 'non-null') return input.arg

  return graphql.arg({
    ...input.arg,
    type: graphql.nonNull(input.arg.type),
  })
}

function graphqlForOutputField (field: InitialisedField) {
  const output = field.output
  if (!output || !field.graphql.isEnabled.read) return output
  if (!field.graphql.isNonNull.read) return output
  if (output.type.kind === 'non-null') return output

  return graphql.field({
    ...(output as any),
    type: graphql.nonNull(output.type),
  })
}

export function initialiseLists (config: __ResolvedKeystoneConfig): Record<string, InitialisedList> {
  const listsRef: Record<string, InitialisedList> = {}
  let intermediateLists

  // step 1
  intermediateLists = getListsWithInitialisedFields(config, listsRef)

  // step 2
  const resolvedDBFieldsForLists = resolveRelationships(intermediateLists)
  intermediateLists = Object.fromEntries(Object.values(intermediateLists).map((list) => [
    list.listKey,
    {
      ...list,
      resolvedDbFields: resolvedDBFieldsForLists[list.listKey],
    },
  ]))

  // step 3
  intermediateLists = Object.fromEntries(Object.values(intermediateLists).map((list) => {
    const fields: Record<string, InitialisedField> = {}

    for (const [fieldKey, field] of Object.entries(list.fields)) {
      fields[fieldKey] = {
        ...field,
        dbField: list.resolvedDbFields[fieldKey],
      }
    }

    return [list.listKey, { ...list, fields }]
  }))

  for (const list of Object.values(intermediateLists)) {
    let hasAnEnabledCreateField = false
    let hasAnEnabledUpdateField = false

    for (const field of Object.values(list.fields)) {
      if (field.input?.create?.arg && field.graphql.isEnabled.create) {
        hasAnEnabledCreateField = true
      }
      if (field.input?.update && field.graphql.isEnabled.update) {
        hasAnEnabledUpdateField = true
      }
    }

    if (!hasAnEnabledCreateField) {
      list.graphql.types.create = Empty
      list.graphql.names.createInputName = 'Empty'
    }

    if (!hasAnEnabledUpdateField) {
      list.graphql.types.update = Empty
      list.graphql.names.updateInputName = 'Empty'
    }
  }

  // error checking
  for (const list of Object.values(intermediateLists)) {
    assertFieldsValid(list)
  }

  // fixup the GraphQL refs
  for (const list of Object.values(intermediateLists)) {
    listsRef[list.listKey] = {
      ...list,
      lists: listsRef,
    }
  }

  // do some introspection
  introspectGraphQLTypes(listsRef)

  return listsRef
}
