import {
  getNamedType,
  isObjectType,
  type GraphQLResolveInfo,
  type GraphQLNamedOutputType,
  type SelectionSetNode,
} from 'graphql/index.js'

import { getCallbackSelection } from '../../../types/item-callback.ts'
import { fieldItemRequirements } from '../../../types/item-field.ts'
import type { KeystoneContext } from '../../../types/context.ts'
import type { BaseKeystoneTypeInfo } from '../../../types/type-info.ts'
import type { NextFieldType } from '../../../types/next-fields.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import type { ResolvedDBField } from '../resolve-relationships.ts'
import { getDBFieldKeyForFieldOnMultiField, weakMemoize } from '../utils.ts'

/** Selection supplied by context.db, whose raw result has no GraphQL item fields. */
export const contextDbSelection = Symbol('contextDbSelection')

type SelectionInfo = Pick<GraphQLResolveInfo, 'fieldNodes' | 'fragments' | 'returnType'>

// note keystone list items will never have any interfaces so we don't need to do any type condition handling
function selectedGraphQLFields(info: SelectionInfo) {
  const fields = new Set<string>()
  const visitedFragments = new Set<string>()

  function visit(selectionSet: SelectionSetNode) {
    for (const node of selectionSet.selections) {
      if (node.kind === 'Field') {
        fields.add(node.name.value)
      } else if (node.kind === 'InlineFragment') {
        visit(node.selectionSet)
      } else {
        if (visitedFragments.has(node.name.value)) continue
        visitedFragments.add(node.name.value)
        const fragment = info.fragments[node.name.value]
        if (fragment) visit(fragment.selectionSet)
      }
    }
  }

  for (const node of info.fieldNodes) {
    if (node.selectionSet) visit(node.selectionSet)
  }
  return fields
}

export function addCallbackFields(
  select: Record<string, true>,
  callback: Function,
  list: InitialisedList
) {
  const fields = getCallbackSelection(callback)
  if (fields === 'all') return false
  return addItemRequirements(select, fields, list)
}

export function addItemField(
  select: Record<string, true>,
  fieldKey: string,
  list: InitialisedList
) {
  const columns = list.itemFieldColumns.get(fieldKey)
  if (!columns) return false
  for (const column of columns) select[column] = true
  return true
}

export function addItemRequirements(
  select: Record<string, true>,
  requirements: Readonly<Record<string, true | undefined>> | null | undefined,
  list: InitialisedList
) {
  if (!requirements) return false
  for (const [key, enabled] of Object.entries(requirements)) {
    if (!enabled) continue
    // Validate against the generated Prisma client once schema extensions have been applied.
    list.itemSelectionColumns.add(key)
    select[key] = true
  }
  return true
}

export function itemFieldColumns(dbFields: Record<string, ResolvedDBField>) {
  const columns = new Map<string, string[]>([['id', ['id']]])
  for (const [key, field] of Object.entries(dbFields)) {
    if (key === 'id') continue
    if (field.kind === 'scalar' || field.kind === 'enum') columns.set(key, [key])
    else if (field.kind === 'multi') {
      columns.set(
        key,
        Object.keys(field.fields).map(inner => getDBFieldKeyForFieldOnMultiField(key, inner))
      )
    } else if (field.kind === 'relation') {
      columns.set(
        key,
        field.mode === 'one' && field.foreignIdField.kind !== 'none' ? [`${key}Id`] : []
      )
    } else {
      columns.set(key, [])
    }
  }
  // Add the Prisma columns of multi-fields and relationships for declared item selections.
  for (const [key, field] of Object.entries(dbFields)) {
    if (field.kind === 'multi') {
      for (const inner of Object.keys(field.fields)) {
        const column = getDBFieldKeyForFieldOnMultiField(key, inner)
        if (!columns.has(column)) columns.set(column, [column])
      }
    } else if (
      field.kind === 'relation' &&
      field.mode === 'one' &&
      field.foreignIdField.kind !== 'none'
    ) {
      const column = `${key}Id`
      if (!columns.has(column)) columns.set(column, [column])
    }
  }
  return columns
}

export function addSelection(
  select: Record<string, true>,
  fields: Record<string, true> | undefined
) {
  if (!fields) return false
  Object.assign(select, fields)
  return true
}

/** Generated fields declare their owner's Prisma columns as well as callback dependencies. */
export function getOutputFieldRequirements(
  list: InitialisedList,
  ownerKey: string,
  output: NextFieldType['output']
) {
  const readAccess = list.fields[ownerKey].access.read.item
  const readFields = getCallbackSelection(readAccess)
  const resolverFields = output?.resolve ? fieldItemRequirements(output) : {}
  if (readFields === 'all' || !resolverFields) return undefined

  const requirements: Record<string, true> = {}
  for (const column of list.itemFieldColumns.get(ownerKey) ?? []) requirements[column] = true
  for (const fields of [readFields, resolverFields]) {
    for (const [key, enabled] of Object.entries(fields)) {
      if (enabled) requirements[key] = true
    }
  }
  return requirements
}

// Cache by the identities shared by sibling resolvers, including fragment definitions
// and the output type so distinct executions and schemas cannot share stale selections.
const cachedGraphQLSelection = weakMemoize((list: InitialisedList) =>
  weakMemoize((outputType: GraphQLNamedOutputType) =>
    weakMemoize((fragments: SelectionInfo['fragments']) =>
      weakMemoize((fieldNodes: SelectionInfo['fieldNodes']) => {
        const select: Record<string, true> = { id: true }
        const graphqlFields = isObjectType(outputType) ? outputType.getFields() : undefined
        for (const fieldKey of selectedGraphQLFields({
          fieldNodes,
          fragments,
          returnType: outputType,
        })) {
          if (fieldKey === '__typename') continue
          const graphqlField = graphqlFields?.[fieldKey]
          if (
            addItemRequirements(select, graphqlField && fieldItemRequirements(graphqlField), list)
          )
            continue
          return undefined
        }
        return Object.freeze(select)
      })
    )
  )
)

/** Undefined means that a callback or field needs the full Prisma item. */
export function selectFromInfoForList(
  list: InitialisedList,
  info: SelectionInfo
): Readonly<Record<string, true>> | undefined {
  if (contextDbSelection in info) {
    const requested = (
      info as GraphQLResolveInfo & {
        [contextDbSelection]?: Record<string, true>
      }
    )[contextDbSelection]
    if (!requested) return undefined
    return Object.freeze({ ...requested, id: true })
  }
  const outputType = getNamedType(info.returnType)
  if (outputType.name !== list.graphql.types.output.name) {
    throw new Error(`${list.listKey} does not match GraphQL return type ${outputType.name}`)
  }
  return cachedGraphQLSelection(list)(outputType)(info.fragments)(info.fieldNodes)
}

/** Get the Prisma columns needed by a resolver returning items from a Keystone list.
 * An undeclared callback or resolver selects every Prisma item column.
 * The returned selection is shared and frozen; spread it into a new object to add columns.
 */
export function selectFromInfo<
  TypeInfo extends BaseKeystoneTypeInfo,
  ListKey extends keyof TypeInfo['lists'] & string,
>(
  context: KeystoneContext<TypeInfo>,
  info: GraphQLResolveInfo,
  listKey: ListKey
): Readonly<Partial<Record<keyof TypeInfo['lists'][ListKey]['item'] & string, true>>> {
  const list = context.__internal.lists[listKey]
  if (!list) throw new Error(`No Keystone list for key ${listKey}`)
  const select = selectFromInfoForList(list, info)
  if (select)
    return select as Readonly<
      Partial<Record<keyof TypeInfo['lists'][ListKey]['item'] & string, true>>
    >

  const allColumns = context.__internal.prismaModelSelections[listKey]
  if (!allColumns) {
    throw new Error(`Cannot select all Prisma fields for ${listKey}: scalar fields are unavailable`)
  }
  return allColumns as Readonly<
    Partial<Record<keyof TypeInfo['lists'][ListKey]['item'] & string, true>>
  >
}
