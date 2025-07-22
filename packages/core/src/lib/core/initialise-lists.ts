import type { CacheHint } from '@apollo/cache-control-types'
import type { GArg, GInputType } from '@graphql-ts/schema'
import { GNonNull } from '@graphql-ts/schema'
import { GraphQLString, isInputObjectType } from 'graphql'
import { g } from '../..'
import { expandVoidHooks } from '../../fields/resolve-hooks'
import type { GroupInfo } from '../../schema'
import type {
  BaseFieldTypeInfo,
  BaseItem,
  BaseListTypeInfo,
  CacheHintArgs,
  FieldTypeFunc,
  FindManyArgs,
  GraphQLTypesForList,
  KeystoneConfig,
  ListGraphQLTypes,
  ListHooks,
  MaybeFieldFunction,
  NextFieldType,
} from '../../types'
import { QueryMode } from '../../types'
import type { FieldHooks, ResolvedFieldHooks, ResolvedListHooks } from '../../types/config/hooks'
import type {
  MaybeBooleanItemFunctionWithFilter,
  MaybeBooleanSessionFunctionWithFilter,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybeSessionFunction,
  MaybeSessionFunctionWithFilter,
} from '../../types/config/lists'
import { type GraphQLNames, __getNames } from '../../types/utils'
import {
  type ResolvedFieldAccessControl,
  type ResolvedListAccessControl,
  parseFieldAccessControl,
  parseListAccessControl,
} from './access-control'
import { assertFieldsValid } from './field-assertions'
import { outputTypeField } from './queries/output-field'
import { type ResolvedDBField, resolveRelationships } from './resolve-relationships'
import { areArraysEqual } from './utils'

export type InitialisedField = {
  fieldKey: string

  access: ResolvedFieldAccessControl
  dbField: ResolvedDBField
  hooks: ResolvedFieldHooks<BaseListTypeInfo, BaseFieldTypeInfo>
  graphql: {
    isEnabled: {
      read: boolean
      create: boolean
      update: boolean
      filter: MaybeFieldFunction<BaseListTypeInfo>
      orderBy: MaybeFieldFunction<BaseListTypeInfo>
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
      fieldMode: MaybeSessionFunctionWithFilter<'edit' | 'hidden', BaseListTypeInfo>
      isRequired: MaybeBooleanSessionFunctionWithFilter<BaseListTypeInfo>
    }
    itemView: {
      fieldMode: MaybeItemFieldFunctionWithFilter<
        'read' | 'edit' | 'hidden',
        BaseListTypeInfo,
        BaseFieldTypeInfo
      >
      fieldPosition: MaybeItemFieldFunction<'form' | 'sidebar', BaseListTypeInfo, BaseFieldTypeInfo>
      isRequired: MaybeBooleanItemFunctionWithFilter<BaseListTypeInfo, BaseFieldTypeInfo>
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
  groups: GroupInfo<BaseListTypeInfo>[]

  hooks: ResolvedListHooks<BaseListTypeInfo>

  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>
  lists: Record<string, InitialisedList>

  graphql: {
    types: GraphQLTypesForList
    names: GraphQLNames
    isEnabled: {
      type: boolean
      query: boolean
      create: boolean
      update: boolean
      delete: boolean
      filter: MaybeFieldFunction<BaseListTypeInfo>
      orderBy: MaybeFieldFunction<BaseListTypeInfo>
    }
  }

  prisma: {
    types: GraphQLNames // TODO: not completely appropriate, but what is used for now
    listKey: string
    mapping: string | undefined
    extendPrismaSchema: ((schema: string) => string) | undefined
  }

  ui: {
    labels: { label: string; singular: string; plural: string; path: string }
    labelField: string
    searchFields: Set<string>
    searchableFields: Map<string, 'default' | 'insensitive' | null>
    triviallySearchableFields: Set<string>
  }

  isSingleton: boolean
  cacheHint: ((args: CacheHintArgs<BaseListTypeInfo>) => CacheHint) | undefined
}

function throwIfNotAFilter(x: unknown, listKey: string, fieldKey: string) {
  if (['boolean', 'undefined', 'function'].includes(typeof x)) return
  throw new Error(
    `Configuration option '${listKey}.${fieldKey}' must be either a boolean value or a function. Received '${x}'.`
  )
}

type ListConfigType = KeystoneConfig['lists'][string]
type FieldConfigType = ReturnType<FieldTypeFunc<any>>
type PartiallyInitialisedList1 = { graphql: { isEnabled: InitialisedList['graphql']['isEnabled'] } }
type PartiallyInitialisedList2 = Omit<InitialisedList, 'lists' | 'resolvedDbFields'>

function getIsEnabled(listKey: string, listConfig: ListConfigType) {
  const omit = listConfig.graphql?.omit ?? false
  const { defaultIsFilterable = true, defaultIsOrderable = true } = listConfig

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

function getIsEnabledField(
  f: FieldConfigType,
  listKey: string,
  list: PartiallyInitialisedList1,
  lists: Record<string, PartiallyInitialisedList1>
) {
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

function defaultListHooksResolveInput({ resolvedData }: { resolvedData: any }) {
  return resolvedData
}

function parseListHooks(hooks: ListHooks<BaseListTypeInfo>): ResolvedListHooks<BaseListTypeInfo> {
  return {
    resolveInput: {
      create:
        typeof hooks.resolveInput === 'function'
          ? hooks.resolveInput
          : (hooks.resolveInput?.create ?? defaultListHooksResolveInput),
      update:
        typeof hooks.resolveInput === 'function'
          ? hooks.resolveInput
          : (hooks.resolveInput?.update ?? defaultListHooksResolveInput),
    },
    validate: expandVoidHooks(hooks.validate),
    beforeOperation: expandVoidHooks(hooks.beforeOperation),
    afterOperation: expandVoidHooks(hooks.afterOperation),
  }
}

function defaultFieldHooksResolveInput({
  resolvedData,
  fieldKey,
}: {
  resolvedData: any
  fieldKey: string
}) {
  return resolvedData[fieldKey]
}

function parseFieldHooks(
  hooks: FieldHooks<BaseListTypeInfo, BaseFieldTypeInfo>
): ResolvedFieldHooks<BaseListTypeInfo, BaseFieldTypeInfo> {
  return {
    resolveInput: {
      create:
        typeof hooks.resolveInput === 'function'
          ? hooks.resolveInput
          : (hooks.resolveInput?.create ?? defaultFieldHooksResolveInput),
      update:
        typeof hooks.resolveInput === 'function'
          ? hooks.resolveInput
          : (hooks.resolveInput?.update ?? defaultFieldHooksResolveInput),
    },
    validate: expandVoidHooks(hooks.validate),
    beforeOperation: expandVoidHooks(hooks.beforeOperation),
    afterOperation: expandVoidHooks(hooks.afterOperation),
  }
}

function getListsWithInitialisedFields(
  config: KeystoneConfig,
  listsRef: Record<string, InitialisedList>
) {
  const {
    lists: listsConfig,
    db: { provider },
  } = config
  const intermediateLists = Object.fromEntries(
    Object.values(config.lists).map(listConfig => [
      listConfig.listKey,
      {
        graphql: {
          isEnabled: getIsEnabled(listConfig.listKey, listConfig),
        },
      },
    ])
  )

  const listGraphqlTypes: Record<string, ListGraphQLTypes<BaseListTypeInfo>> = {}

  for (const listConfig of Object.values(listsConfig)) {
    const { listKey } = listConfig
    const {
      graphql: { names },
    } = __getNames(listKey, listConfig)

    const output = g.object<BaseItem>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' &&
                  !intermediateLists[field.dbField.list].graphql.isEnabled.query)
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

    const uniqueWhere = g.inputObject({
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

              // only 1-to-1 relationships can have a uniqueWhere filter on relations
              if (field.dbField.kind === 'relation') {
                const remoteField =
                  listsRef[field.dbField.list].resolvedDbFields[field.dbField.field]
                if (
                  field.dbField.mode === 'one' &&
                  remoteField.kind === 'relation' &&
                  remoteField.mode === 'one'
                ) {
                  return [[key, field.input.uniqueWhere.arg]] as const
                }
                return []
              }

              return [[key, field.input.uniqueWhere.arg]] as const
            })
          ),
          // this is exactly what the id field will add
          // but this does it more explicitly so that typescript understands
          id: g.arg({ type: g.ID }),
        }
      },
    })

    const where: GraphQLTypesForList['where'] = g.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        return Object.assign(
          {
            AND: g.arg({ type: g.list(g.nonNull(where)) }),
            OR: g.arg({ type: g.list(g.nonNull(where)) }),
            NOT: g.arg({ type: g.list(g.nonNull(where)) }),
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

    const create = g.inputObject({
      name: names.createInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        const ret: Record<keyof typeof fields, GArg<GInputType>> = {}

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'create', listsRef)
          if (!arg) continue
          ret[key] = arg
        }

        return ret
      },
    })

    const update = g.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = listsRef[listKey]
        const ret: Record<keyof typeof fields, GArg<GInputType>> = {}

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'update', listsRef)
          if (!arg) continue
          ret[key] = arg
        }

        return ret
      },
    })

    const orderBy = g.inputObject({
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

    let take: any = g.arg({ type: g.Int })
    if (listConfig.graphql?.maxTake !== undefined) {
      take = g.arg({
        type: g.nonNull(g.Int),
        // WARNING: used by queries/resolvers.ts to enforce the limit
        defaultValue: listConfig.graphql.maxTake,
      })
    }

    const findManyArgs: FindManyArgs = {
      where: g.arg({
        type: g.nonNull(where),
        defaultValue: listConfig.isSingleton ? { id: { equals: '1' } } : {},
      }),
      orderBy: g.arg({
        type: g.nonNull(g.list(g.nonNull(orderBy))),
        defaultValue: [],
      }),
      take,
      skip: g.arg({
        type: g.nonNull(g.Int),
        defaultValue: 0,
      }),
      cursor: g.arg({ type: uniqueWhere }),
    }

    const relateToOneForCreate = g.inputObject({
      name: names.relateToOneForCreateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: g.arg({ type: listRef.graphql.types.create }),
          }),
          connect: g.arg({ type: listRef.graphql.types.uniqueWhere }),
        }
      },
    })

    const relateToOneForUpdate = g.inputObject({
      name: names.relateToOneForUpdateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: g.arg({ type: listRef.graphql.types.create }),
          }),
          connect: g.arg({ type: listRef.graphql.types.uniqueWhere }),
          disconnect: g.arg({ type: g.Boolean }),
        }
      },
    })

    const relateToManyForCreate = g.inputObject({
      name: names.relateToManyForCreateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          ...(listRef.graphql.isEnabled.create && {
            create: g.arg({
              type: g.list(g.nonNull(listRef.graphql.types.create)),
            }),
          }),
          connect: g.arg({
            type: g.list(g.nonNull(listRef.graphql.types.uniqueWhere)),
          }),
          set: g.arg({
            type: g.list(g.nonNull(listRef.graphql.types.uniqueWhere)),
          }),
        }
      },
    })

    const relateToManyForUpdate = g.inputObject({
      name: names.relateToManyForUpdateInputName,
      fields: () => {
        const listRef = listsRef[listKey]
        return {
          // WARNING: the order of these fields reflects the order of mutations
          disconnect: g.arg({
            type: g.list(g.nonNull(listRef.graphql.types.uniqueWhere)),
          }),
          set: g.arg({
            type: g.list(g.nonNull(listRef.graphql.types.uniqueWhere)),
          }),
          ...(listRef.graphql.isEnabled.create && {
            create: g.arg({ type: g.list(g.nonNull(listRef.graphql.types.create)) }),
          }),
          connect: g.arg({ type: g.list(g.nonNull(listRef.graphql.types.uniqueWhere)) }),
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
            update: relateToOneForUpdate,
          },
          many: {
            where: g.inputObject({
              name: `${listKey}ManyRelationFilter`,
              fields: {
                every: g.arg({ type: where }),
                some: g.arg({ type: where }),
                none: g.arg({ type: where }),
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
    const groups: GroupInfo<BaseListTypeInfo>[] = []
    const fieldKeys = Object.keys(listConfig.fields)

    const fieldKeysToGroup: Record<string, GroupInfo<BaseListTypeInfo>> = {}
    for (const [idx, [fieldKey, fieldFunc]] of Object.entries(listConfig.fields).entries()) {
      if (fieldKey.startsWith('__group')) {
        const _group = fieldFunc as any
        if (
          typeof _group === 'object' &&
          _group !== null &&
          typeof _group.label === 'string' &&
          (_group.description === null || typeof _group.description === 'string') &&
          Array.isArray(_group.fields) &&
          areArraysEqual(_group.fields, fieldKeys.slice(idx + 1, idx + 1 + _group.fields.length))
        ) {
          const group: GroupInfo<BaseListTypeInfo> = _group
          groups.push(group)
          for (const field of group.fields) {
            fieldKeysToGroup[field] = group
          }
          continue
        }
        throw new Error(`unexpected value for a group at ${listKey}.${fieldKey}`)
      }
      if (typeof fieldFunc !== 'function') {
        throw new Error(`The field at ${listKey}.${fieldKey} does not provide a function`)
      }

      const group = fieldKeysToGroup[fieldKey]

      const f = fieldFunc({
        fieldKey,
        listKey,
        lists: listGraphqlTypes,
        provider,
      })

      const isEnabledField = getIsEnabledField(f, listKey, intermediateList, intermediateLists)
      resultFields[fieldKey] = {
        fieldKey,

        dbField: f.dbField as ResolvedDBField,
        access: parseFieldAccessControl(f.access),
        hooks: parseFieldHooks(f.hooks ?? {}),
        graphql: {
          cacheHint: f.graphql?.cacheHint,
          isEnabled: isEnabledField,
          isNonNull: {
            read:
              typeof f.graphql?.isNonNull === 'boolean'
                ? f.graphql.isNonNull
                : (f.graphql?.isNonNull?.read ?? false),
            create:
              typeof f.graphql?.isNonNull === 'boolean'
                ? f.graphql.isNonNull
                : (f.graphql?.isNonNull?.create ?? false),
            update:
              typeof f.graphql?.isNonNull === 'boolean'
                ? f.graphql.isNonNull
                : (f.graphql?.isNonNull?.update ?? false),
          },
        },
        ui: {
          label: f.ui?.label ?? null,
          description: f.ui?.description ?? null,
          views: f.ui?.views ?? null,
          createView: {
            isRequired: f.ui?.createView?.isRequired ?? false,
            fieldMode: isEnabledField.create
              ? (f.ui?.createView?.fieldMode ??
                group?.ui?.createView?.defaultFieldMode ??
                listConfig.ui?.createView?.defaultFieldMode ??
                'edit')
              : 'hidden',
          },

          itemView: {
            isRequired: f.ui?.itemView?.isRequired ?? false,
            fieldPosition: f.ui?.itemView?.fieldPosition ?? 'form',
            fieldMode: isEnabledField.update
              ? (f.ui?.itemView?.fieldMode ??
                group?.ui?.itemView?.defaultFieldMode ??
                listConfig.ui?.itemView?.defaultFieldMode ??
                'edit')
              : isEnabledField.read
                ? (f.ui?.itemView?.fieldMode ??
                  group?.ui?.itemView?.defaultFieldMode ??
                  listConfig.ui?.itemView?.defaultFieldMode ??
                  'read')
                : 'hidden',
          },

          listView: {
            fieldMode: isEnabledField.read
              ? (f.ui?.listView?.fieldMode ??
                group?.ui?.listView?.defaultFieldMode ??
                listConfig.ui?.listView?.defaultFieldMode ??
                'read')
              : 'hidden',
          },
        },

        // copy
        __ksTelemetryFieldTypeName: f.__ksTelemetryFieldTypeName,
        extraOutputFields: f.extraOutputFields,
        getAdminMeta: f.getAdminMeta,
        input: { ...f.input },
        output: { ...f.output },
        unreferencedConcreteInterfaceImplementations:
          f.unreferencedConcreteInterfaceImplementations,
        views: f.views,
      }
    }

    // default labelField to `name`, `label`, or `title`; fallback to `id`
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
        triviallySearchableFields: new Set<string>(),
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

function introspectGraphQLTypes(lists: Record<string, InitialisedList>) {
  const namesOfRelationInputs = new Set<string>()
  for (const list of Object.values(lists)) {
    const { types } = list.graphql
    namesOfRelationInputs.add(types.where.name)
    namesOfRelationInputs.add(types.relateTo.many.where.name)
  }
  for (const list of Object.values(lists)) {
    const {
      listKey,
      ui: { searchFields, searchableFields, triviallySearchableFields },
    } = list

    if (searchFields.has('id')) {
      throw new Error(
        `The ui.searchFields option on the ${listKey} list includes 'id'. Lists can always be searched by an item's id so it must not be specified as a search field`
      )
    }

    const whereInputFields = list.graphql.types.where.getFields()
    for (const [fieldKey, field] of Object.entries(list.fields)) {
      const filterType = whereInputFields[fieldKey]?.type
      const fieldFilterFields = isInputObjectType(filterType) ? filterType.getFields() : undefined
      const filterTypeName = isInputObjectType(filterType) ? filterType.name : undefined
      if (fieldFilterFields?.contains?.type === GraphQLString) {
        searchableFields.set(
          fieldKey,
          fieldFilterFields?.mode?.type === QueryMode ? 'insensitive' : 'default'
        )
        triviallySearchableFields.add(fieldKey)
      } else if (
        field.dbField.kind === 'relation' &&
        filterTypeName !== undefined &&
        namesOfRelationInputs.has(filterTypeName)
      ) {
        searchableFields.set(fieldKey, 'default')
      }
    }

    if (searchFields.size === 0) {
      if (searchableFields.has(list.ui.labelField)) {
        searchFields.add(list.ui.labelField)
      }
    }
  }
}

function stripDefaultValue(thing: GArg<GInputType, boolean>) {
  return g.arg({
    ...thing,
    defaultValue: undefined,
  })
}

function graphqlArgForInputField(
  field: InitialisedField,
  operation: 'create' | 'update',
  listsRef: Record<string, InitialisedList>
) {
  const input = field.input?.[operation]
  if (!input?.arg || !field.graphql.isEnabled[operation]) return
  if (field.dbField.kind === 'relation') {
    if (!listsRef[field.dbField.list].graphql.isEnabled.type) return
  }
  if (!field.graphql.isNonNull[operation]) return stripDefaultValue(input.arg)
  if (input.arg.type instanceof GNonNull) return input.arg

  return g.arg({
    ...input.arg,
    type: g.nonNull(input.arg.type),
  })
}

function graphqlForOutputField(field: InitialisedField) {
  const output = field.output
  if (!output || !field.graphql.isEnabled.read) return output
  if (!field.graphql.isNonNull.read) return output
  if (output.type instanceof GNonNull) return output

  return g.field({
    ...(output as any),
    type: g.nonNull(output.type),
  })
}

export function initialiseLists(config: KeystoneConfig): Record<string, InitialisedList> {
  const listsRef: Record<string, InitialisedList> = {}
  let intermediateLists

  // step 1
  intermediateLists = getListsWithInitialisedFields(config, listsRef)

  // step 2
  const resolvedDBFieldsForLists = resolveRelationships(intermediateLists)
  intermediateLists = Object.fromEntries(
    Object.values(intermediateLists).map(list => [
      list.listKey,
      {
        ...list,
        resolvedDbFields: resolvedDBFieldsForLists[list.listKey],
      },
    ])
  )

  // step 3
  intermediateLists = Object.fromEntries(
    Object.values(intermediateLists).map(list => {
      const fields: Record<string, InitialisedField> = {}

      for (const [fieldKey, field] of Object.entries(list.fields)) {
        fields[fieldKey] = {
          ...field,
          dbField: list.resolvedDbFields[fieldKey],
        }
      }

      return [list.listKey, { ...list, fields }]
    })
  )

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
      list.graphql.types.create = g.Empty
      list.graphql.names.createInputName = 'Empty'
    }

    if (!hasAnEnabledUpdateField) {
      list.graphql.types.update = g.Empty
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
