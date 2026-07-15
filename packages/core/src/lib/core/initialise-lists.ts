import type { CacheHint } from '@apollo/cache-control-types'
import type { GInputObjectType, GArg, GInputType } from '@graphql-ts/schema'
import { GNonNull } from '@graphql-ts/schema'
import {
  GraphQLList,
  type GraphQLNamedType,
  GraphQLNonNull,
  GraphQLString,
  isInputObjectType,
  type GraphQLType,
} from 'graphql'

import { g } from '../..'
import { expandVoidHooks } from '../../fields/resolve-hooks'
import { humanize } from '../../lib/utils'
import type { GroupInfo } from '../../schema'
import type {
  ActionArgumentSourceMeta,
  ActionMeta,
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
  NextFieldType,
} from '../../types'
import { QueryMode } from '../../types'
import type { FieldHooks, ResolvedFieldHooks, ResolvedListHooks } from '../../types/config/hooks'
import type {
  BaseActions,
  MaybeBooleanItemFunctionWithFilter,
  MaybeBooleanSessionFunctionWithFilter,
  MaybeItemActionFunctionWithFilter,
  MaybeItemFieldFunction,
  MaybeItemFieldFunctionWithFilter,
  MaybeSessionFunction,
  MaybeSessionFunctionWithFilter,
} from '../../types/config/lists'
import { type GraphQLNames, __getNames } from '../../types/utils'
import {
  type ResolvedActionAccessControl,
  type ResolvedFieldAccessControl,
  type ResolvedListAccessControl,
  parseFieldAccessControl,
  parseListAccessControl,
} from './access-control'
import { assertFieldsValid } from './field-assertions'
import { outputTypeField } from './queries/output-field'
import { type ResolvedDBField, resolveRelationships } from './resolve-relationships'
import { areArraysEqual } from './utils'

export type InitialisedAction = {
  actionKey: string

  access: ResolvedActionAccessControl
  resolve: BaseActions<BaseListTypeInfo>[keyof BaseActions<BaseListTypeInfo>]['resolve']
  graphql: {
    arguments: {
      name: string
      type: string
      source: ActionArgumentSourceMeta<InitialisedField>
    }[]
    names: {
      one: string
      many: string
      args: string
    }
    types: {
      arguments: Record<string, GArg<GInputType>>
      args: GInputObjectType<Record<string, GArg<GInputType>>>
    }
  }
  otel: string
  ui: {
    label: ActionMeta['label']
    icon: ActionMeta['icon']
    messages: ActionMeta['messages']
    itemView: Omit<ActionMeta['itemView'], 'actionMode'> & {
      actionMode: MaybeItemActionFunctionWithFilter<
        'enabled' | 'disabled' | 'hidden',
        'disabled' | 'hidden',
        BaseListTypeInfo
      >
    }
    listView: {
      actionMode: MaybeSessionFunctionWithFilter<
        'enabled' | 'disabled' | 'hidden',
        'disabled' | 'hidden',
        BaseListTypeInfo
      >
    }
    argSources: Record<string, { itemField: string }>
  }
}

function printGraphQLType(type: GraphQLType): string {
  if (type instanceof GraphQLNonNull) return `${printGraphQLType(type.ofType)}!`
  if (type instanceof GraphQLList) return `[${printGraphQLType(type.ofType)}]`
  return type.name
}

function getArgSources(
  action: NonNullable<KeystoneConfig['lists'][string]['actions']>[string]
): Record<string, { itemField: string }> {
  return Object.fromEntries(
    Object.entries(action.args ?? {}).flatMap(([arg, value]) => {
      const field = value.ui?.source?.itemField
      if (!field) return []
      return [[arg, { itemField: field }]]
    })
  )
}

function getArgFieldSources(
  action: NonNullable<KeystoneConfig['lists'][string]['actions']>[string]
): Record<string, FieldTypeFunc<BaseListTypeInfo>> {
  return Object.fromEntries(
    Object.entries(action.args ?? {}).flatMap(([arg, value]) => {
      const field = value.ui?.source?.field
      if (!field) return []
      return [[arg, field as FieldTypeFunc<BaseListTypeInfo>]]
    })
  )
}

function unwrapNonNullGraphQLType(type: GraphQLType): GraphQLType {
  return type instanceof GraphQLNonNull ? unwrapNonNullGraphQLType(type.ofType) : type
}

function isGraphQLInputTypeAssignable(source: GraphQLType, target: GraphQLType): boolean {
  source = unwrapNonNullGraphQLType(source)
  target = unwrapNonNullGraphQLType(target)

  if (source instanceof GraphQLList || target instanceof GraphQLList) {
    return (
      source instanceof GraphQLList &&
      target instanceof GraphQLList &&
      isGraphQLInputTypeAssignable(source.ofType, target.ofType)
    )
  }

  return (source as GraphQLNamedType).name === (target as GraphQLNamedType).name
}

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
      filter: boolean
      order: boolean
    }
    isNonNull: {
      read: boolean
      create: boolean
      update: boolean
    }
    cacheHint: CacheHint | undefined
  }
  ui: {
    label: string
    description: string
    views: string | null
    createView: {
      fieldMode: MaybeSessionFunctionWithFilter<'edit' | 'hidden', 'hidden', BaseListTypeInfo>
      isRequired: MaybeBooleanSessionFunctionWithFilter<BaseListTypeInfo>
    }
    itemView: {
      fieldMode: MaybeItemFieldFunctionWithFilter<
        'read' | 'edit' | 'hidden',
        'read' | 'hidden',
        BaseListTypeInfo,
        BaseFieldTypeInfo
      >
      fieldPosition: MaybeItemFieldFunction<'form' | 'sidebar', BaseListTypeInfo, BaseFieldTypeInfo>
      isRequired: MaybeBooleanItemFunctionWithFilter<BaseListTypeInfo, BaseFieldTypeInfo>
    }
    listView: {
      fieldMode: MaybeSessionFunction<'read' | 'hidden', BaseListTypeInfo>
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
  actions: InitialisedAction[]
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
      query: {
        one: boolean
        many: boolean
        count: boolean
      }
      create: boolean
      update: boolean
      delete: boolean
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

type ListConfigType = KeystoneConfig['lists'][string]
type FieldConfigType = ReturnType<FieldTypeFunc<any>>
type PartiallyInitialisedList1 = { graphql: { isEnabled: InitialisedList['graphql']['isEnabled'] } }
type PartiallyInitialisedList2 = Omit<InitialisedList, 'lists' | 'resolvedDbFields'>
type FieldOmit = NonNullable<NonNullable<FieldConfigType['graphql']>['omit']>
type ResolvedFieldOmit = {
  type: boolean
  read: { item: boolean; filter: boolean; order: boolean }
  create: boolean
  update: boolean
}

function normalizeFieldOmit(omit: FieldOmit | undefined): ResolvedFieldOmit {
  if (typeof omit === 'boolean') {
    return {
      type: omit,
      read: { item: omit, filter: omit, order: omit },
      create: omit,
      update: omit,
    }
  }

  const read = omit?.read
  return {
    type: false,
    read:
      typeof read === 'boolean'
        ? { item: read, filter: read, order: read }
        : {
            item: read?.item ?? false,
            filter: read?.filter ?? false,
            order: read?.order ?? false,
          },
    create: omit?.create ?? false,
    update: omit?.update ?? false,
  }
}

function resolveFieldOmit(
  fieldOmit: FieldOmit | undefined,
  defaultOmit: FieldOmit | undefined
): ResolvedFieldOmit {
  const resolvedDefault = normalizeFieldOmit(defaultOmit)
  if (fieldOmit === undefined) return resolvedDefault
  if (typeof fieldOmit === 'boolean') return normalizeFieldOmit(fieldOmit)

  const read = fieldOmit.read
  return {
    type: false,
    read:
      read === undefined
        ? resolvedDefault.read
        : typeof read === 'boolean'
          ? { item: read, filter: read, order: read }
          : read,
    create: fieldOmit.create ?? resolvedDefault.create,
    update: fieldOmit.update ?? resolvedDefault.update,
  }
}

// TODO: move to defaultLists?
function getIsEnabled(listConfig: ListConfigType) {
  const omit = listConfig.graphql?.omit ?? false

  if (typeof omit === 'boolean') {
    const notOmit = !omit
    return {
      type: notOmit,
      query: { one: notOmit, many: notOmit, count: notOmit },
      create: notOmit,
      update: notOmit,
      delete: notOmit,
    }
  }

  const queryOmit = omit.query
  const query =
    typeof queryOmit === 'boolean'
      ? { one: !queryOmit, many: !queryOmit, count: !queryOmit }
      : {
          one: !(queryOmit?.one ?? false),
          many: !(queryOmit?.many ?? false),
          count: !(queryOmit?.count ?? false),
        }

  return {
    type: true,
    query,
    create: !omit.create,
    update: !omit.update,
    delete: !omit.delete,
  }
}

function getIsEnabledField(
  f: FieldConfigType,
  lists: Record<string, PartiallyInitialisedList1>,
  defaultOmit: FieldOmit | undefined
) {
  const omit = resolveFieldOmit(f.graphql?.omit, defaultOmit)

  if (f.dbField.kind === 'relation') {
    if (!lists[f.dbField.list].graphql.isEnabled.type) {
      return {
        type: false,
        read: false,
        create: false,
        update: false,
        filter: false,
        order: false,
      }
    }
  }

  return {
    type: !omit.type,
    read: !omit.read.item,
    create: !omit.create,
    update: !omit.update,
    filter: !omit.read.filter,
    order: !omit.read.order,
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
          isEnabled: getIsEnabled(listConfig),
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
              if (!field.output || !field.graphql.isEnabled.read) {
                return []
              }

              const outputFieldRoot = graphqlForOutputField(field)
              let outputFields = [
                [fieldPath, outputFieldRoot] as const,
                ...Object.entries(field.extraOutputFields || {}),
              ]

              if (field.dbField.kind === 'relation') {
                const relation = field.dbField
                const query = intermediateLists[field.dbField.list].graphql.isEnabled.query
                outputFields = outputFields.filter(([outputTypeFieldName]) =>
                  outputTypeFieldName === fieldPath ? query[relation.mode] : query.count
                )
              }

              return outputFields.map(([outputTypeFieldName, outputField]) => {
                return [
                  outputTypeFieldName,
                  outputTypeField(
                    outputField,
                    field.dbField,
                    field.graphql?.cacheHint,
                    field.access.read.item,
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
              if (!field.input?.uniqueWhere?.arg || !field.graphql.isEnabled.filter) {
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
            if (!field.input?.orderBy?.arg || !field.graphql.isEnabled.order) {
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
    const fieldAccessDefault = listConfig.fieldDefaults?.access
    const resultFields: Record<string, InitialisedField> = {}
    const groups: GroupInfo<BaseListTypeInfo>[] = []
    const fieldKeys = Object.keys(listConfig.fields)

    const fieldKeysToGroup: Record<string, GroupInfo<BaseListTypeInfo>> = {}
    for (const [idx, [fieldKey, fieldFunc]] of Object.entries(listConfig.fields).entries()) {
      if (fieldKey.startsWith('__group')) {
        const group__ = fieldFunc as any
        if (
          typeof group__ === 'object' &&
          group__ !== null &&
          typeof group__.label === 'string' &&
          (group__.description === null || typeof group__.description === 'string') &&
          Array.isArray(group__.fields) &&
          areArraysEqual(group__.fields, fieldKeys.slice(idx + 1, idx + 1 + group__.fields.length))
        ) {
          groups.push(group__)
          for (const field of group__.fields) {
            fieldKeysToGroup[field] = group__
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
        provider,
        lists: listGraphqlTypes,
        listKey,
        fieldKey,
      })

      const isEnabledField = getIsEnabledField(
        f,
        intermediateLists,
        listConfig.fieldDefaults?.graphql?.omit
      )
      resultFields[fieldKey] = {
        fieldKey,

        dbField: f.dbField as ResolvedDBField,
        access: parseFieldAccessControl(f.access, fieldAccessDefault),
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
          label: f.ui?.label || humanize(fieldKey),
          description: f.ui?.description ?? '',
          views: f.ui?.views ?? null,
          createView: {
            isRequired: f.ui?.createView?.isRequired ?? false,
            fieldMode: isEnabledField.create
              ? (f.ui?.createView?.fieldMode ??
                group?.fieldDefaults?.ui?.createView?.fieldMode ??
                listConfig.fieldDefaults?.ui?.createView?.fieldMode ??
                'edit')
              : 'hidden',
          },

          itemView: {
            isRequired: f.ui?.itemView?.isRequired ?? false,
            fieldPosition: f.ui?.itemView?.fieldPosition ?? 'form',
            fieldMode: isEnabledField.update
              ? (f.ui?.itemView?.fieldMode ??
                group?.fieldDefaults?.ui?.itemView?.fieldMode ??
                listConfig.fieldDefaults?.ui?.itemView?.fieldMode ??
                'edit')
              : isEnabledField.read
                ? (f.ui?.itemView?.fieldMode ??
                  group?.fieldDefaults?.ui?.itemView?.fieldMode ??
                  listConfig.fieldDefaults?.ui?.itemView?.fieldMode ??
                  'read')
                : 'hidden',
          },

          listView: {
            fieldMode: isEnabledField.read
              ? (f.ui?.listView?.fieldMode ??
                group?.fieldDefaults?.ui?.listView?.fieldMode ??
                listConfig.fieldDefaults?.ui?.listView?.fieldMode ??
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
      listConfig.ui.labelField ??
      (listConfig.fields.label
        ? 'label'
        : listConfig.fields.name
          ? 'name'
          : listConfig.fields.title
            ? 'title'
            : 'id')

    const searchFields = new Set(listConfig.ui.searchFields ?? [])
    if (searchFields.has('id')) {
      throw new Error(`${listKey}.ui.searchFields cannot include 'id'`)
    }

    const names = __getNames(listKey, listConfig)
    result[listKey] = {
      access: parseListAccessControl(listConfig.access),

      fields: resultFields,
      groups,
      actions: [],

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
        mapping: listConfig.db.map,
        extendPrismaSchema: listConfig.db.extendPrismaSchema,
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
        const cacheHint = listConfig.graphql.cacheHint
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

function initialiseActionArgField(
  listKey: string,
  actionKey: string,
  argKey: string,
  fieldFunc: FieldTypeFunc<BaseListTypeInfo>,
  provider: KeystoneConfig['db']['provider'],
  listsRef: Record<string, InitialisedList>
): InitialisedField {
  const f = fieldFunc({
    provider,
    lists: Object.fromEntries(
      Object.entries(listsRef).map(([listKey, list]) => [listKey, { types: list.graphql.types }])
    ),
    listKey,
    fieldKey: argKey,
  })
  const path = `${listKey}.${actionKey}.${argKey}`

  if (f.access !== undefined) {
    throw new Error(`${path} cannot define field access control`)
  }
  if (f.hooks?.resolveInput || f.hooks?.beforeOperation || f.hooks?.afterOperation) {
    throw new Error(`${path} cannot define field hooks`)
  }
  if (f.ui?.createView?.fieldMode !== undefined) {
    throw new Error(`${path} cannot define createView.fieldMode`)
  }
  if (f.ui?.itemView?.fieldPosition !== undefined) {
    throw new Error(`${path} cannot define itemView.fieldPosition`)
  }
  if (f.ui?.itemView?.fieldMode !== undefined || f.ui?.listView?.fieldMode !== undefined) {
    throw new Error(`${path} cannot define itemView or listView field modes`)
  }
  const typeName = f.__ksTelemetryFieldTypeName ?? 'unknown'

  const createIsNonNull =
    typeof f.graphql?.isNonNull === 'boolean'
      ? f.graphql.isNonNull
      : (f.graphql?.isNonNull?.create ?? false)
  const createIsOmitted =
    typeof f.graphql?.omit === 'boolean' ? f.graphql.omit : (f.graphql?.omit?.create ?? false)

  const field: InitialisedField = {
    fieldKey: argKey,
    dbField: f.dbField as ResolvedDBField,
    access: parseFieldAccessControl(undefined, undefined),
    hooks: parseFieldHooks(f.hooks ?? {}),
    graphql: {
      cacheHint: undefined,
      isEnabled: {
        read: false,
        create: !createIsOmitted,
        update: false,
        filter: false,
        order: false,
      },
      isNonNull: {
        read: false,
        create: createIsNonNull,
        update: false,
      },
    },
    ui: {
      label: f.ui?.label || humanize(argKey),
      description: f.ui?.description ?? '',
      views: f.ui?.views ?? null,
      createView: {
        isRequired: f.ui?.createView?.isRequired ?? false,
        fieldMode: 'edit',
      },
      itemView: {
        isRequired: false,
        fieldPosition: 'form',
        fieldMode: 'hidden',
      },
      listView: {
        fieldMode: 'hidden',
      },
    },
    __ksTelemetryFieldTypeName: typeName,
    extraOutputFields: undefined,
    getAdminMeta: f.getAdminMeta,
    input: { ...f.input },
    output: undefined as any,
    unreferencedConcreteInterfaceImplementations: undefined,
    views: f.views ?? '',
  }

  const arg = graphqlArgForInputField(field, 'create', listsRef)
  if (!arg) {
    throw new Error(`${path} does not provide a create GraphQL input`)
  }

  return field
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

function getInitialisedActionGraphql(
  list: Pick<InitialisedList, 'graphql' | 'listKey'>,
  listGraphqlNames: { singular: string; plural: string },
  actionKey: string,
  action: NonNullable<KeystoneConfig['lists'][string]['actions']>[string],
  provider: KeystoneConfig['db']['provider'],
  listsRef: Record<string, InitialisedList>
): InitialisedAction['graphql'] {
  const actionArgFields = new Map<string, InitialisedField>()
  const graphqlNames = {
    one: action.graphql?.singular ?? `${actionKey}${listGraphqlNames.singular}`,
    many: action.graphql?.plural ?? `${actionKey}${listGraphqlNames.plural}`,
  }
  const argsName = `${graphqlNames.one[0].toUpperCase()}${graphqlNames.one.slice(1)}Args`
  const argSources = getArgSources(action)
  const argFieldSources = getArgFieldSources(action)
  const argumentFields = Object.fromEntries(
    Object.entries(action.args ?? {}).map(([arg, value]) => {
      if (value.ui?.source?.itemField && value.ui.source.field) {
        throw new Error(
          `${list.listKey}.${actionKey}.${arg} cannot define both ui.source.itemField and ui.source.field`
        )
      }
      const fieldSource = argFieldSources[arg]
      if (fieldSource) {
        const field = initialiseActionArgField(
          list.listKey,
          actionKey,
          arg,
          fieldSource,
          provider,
          listsRef
        )
        const fieldArg = graphqlArgForInputField(field, 'create', listsRef)!
        if (
          !isGraphQLInputTypeAssignable(
            fieldArg.type as unknown as GraphQLType,
            value.graphql.type as unknown as GraphQLType
          )
        ) {
          throw new Error(
            `${list.listKey}.${actionKey}.${arg} field-rendered UI source type ${printGraphQLType(
              fieldArg.type as unknown as GraphQLType
            )} is not assignable to GraphQL arg type ${printGraphQLType(
              value.graphql.type as unknown as GraphQLType
            )}`
          )
        }
        actionArgFields.set(arg, field)
      }
      return [arg, value.graphql]
    })
  )

  return {
    arguments: Object.entries(argumentFields).map(([name, arg]) => ({
      name,
      type: printGraphQLType(arg.type as unknown as GraphQLType),
      source: actionArgFields.has(name)
        ? { field: actionArgFields.get(name)! }
        : argSources[name]
          ? { itemField: argSources[name].itemField }
          : null,
    })),
    names: {
      ...graphqlNames,
      args: argsName,
    },
    types: {
      arguments: argumentFields,
      args: g.inputObject({
        name: argsName,
        isOneOf: false,
        fields: {
          where: g.arg({
            type: g.nonNull(list.graphql.types.uniqueWhere),
          }),
          ...argumentFields,
        },
      }),
    },
  }
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

  // fixup the GraphQL refs
  for (const list of Object.values(intermediateLists)) {
    listsRef[list.listKey] = {
      ...list,
      lists: listsRef,
    }
  }

  for (const list of Object.values(listsRef)) {
    const listConfig = config.lists[list.listKey]
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

    list.actions = Object.entries(listConfig.actions ?? {}).map(
      ([actionKey, action]): InitialisedAction => {
        const { label } = action.ui
        const hasFieldArgs = Object.values(action.args ?? {}).some(value => value.ui?.source?.field)
        if (hasFieldArgs && action.ui.itemView?.hidePrompt === true) {
          throw new Error(
            `${list.listKey}.${actionKey} cannot set ui.itemView.hidePrompt when using field-rendered action arguments`
          )
        }
        const graphql = getInitialisedActionGraphql(
          list,
          __getNames(list.listKey, listConfig).graphql,
          actionKey,
          action,
          config.db.provider,
          listsRef
        )

        return {
          ...action,
          actionKey,
          graphql,
          otel: humanize(graphql.names.one, true).toLowerCase(),
          ui: {
            label,
            icon: action.ui.icon ?? null,
            messages: {
              promptTitle: `{Label} {singular}`,
              promptTitleMany: `{Label} {count} {singular|plural}`,
              prompt: `Are you sure you want to {label} {singular} "{itemLabel}"?`,
              promptMany: `Are you sure you want to {label} {count} {singular|plural}?`,
              promptConfirmLabel: `Yes, {label} this {singular}`,
              promptConfirmLabelMany: `Yes, {label} {count} {singular|plural}`,
              fail: `Could not {label} {singular}`,
              failMany: `Could not {label} {countFail} {singular|plural}`,
              success: `Completed {label} action for {singular}`,
              successMany: `Completed {label} action for {countSuccess} {singular|plural}`,
              ...action.ui.messages,
            },
            itemView: {
              actionMode: action.ui.itemView?.actionMode ?? 'enabled',
              navigation: action.ui.itemView?.navigation ?? 'follow',
              hidePrompt: action.ui.itemView?.hidePrompt ?? false,
              hideToast: action.ui.itemView?.hideToast ?? false,
            },
            listView: {
              actionMode: action.ui.listView?.actionMode ?? 'enabled',
            },
            argSources: getArgSources(action),
          },
        }
      }
    )
  }

  // error checking
  for (const list of Object.values(listsRef)) {
    assertFieldsValid(list)
  }

  // do some introspection
  introspectGraphQLTypes(listsRef)

  return listsRef
}
