import { assertInputObjectType } from 'graphql/index.js'

import { allowAll } from '../../access'
import type {
  ActionAccessControlFunction,
  BaseItem,
  BaseListTypeInfo,
  CreateListItemAccessControl,
  DeleteListItemAccessControl,
  FieldAccessControl,
  FieldAccessControlFunction,
  FieldCreateItemAccessArgs,
  FieldFilterItemAccessArgs,
  FieldOrderItemAccessArgs,
  FieldReadItemAccessArgs,
  FieldUpdateItemAccessArgs,
  KeystoneContext,
  ListAccessControl as ListAccessControlPre,
  ListFilterAccessControl,
  ListOperationAccessControl,
  ListQueryAccessControl,
  QueryOperationKind,
  UpdateListItemAccessControl,
} from '../../types'
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput'
import { accessDeniedError, accessReturnError, extensionError, formatKeys } from './graphql-errors'
import type { InitialisedAction, InitialisedList } from './initialise-lists'
import { type InputFilter, type UniqueInputFilter, resolveUniqueWhereInput } from './where-inputs'

export function cannotForItem(operation: string, list: InitialisedList) {
  if (operation === 'create')
    return `You cannot ${operation} that ${list.graphql.names.outputTypeName}`
  return `You cannot ${operation} that ${list.graphql.names.outputTypeName} - it may not exist`
}

export function cannotActionForItem(action: InitialisedAction, list: InitialisedList) {
  return `You cannot execute action "${action.actionKey}" for that ${list.graphql.names.outputTypeName}`
}

export function cannotForItemFields(
  operation: string,
  list: InitialisedList,
  fieldsDenied: string[]
) {
  return `You cannot ${operation} that ${list.graphql.names.outputTypeName} - you cannot ${operation} the fields ${formatKeys(fieldsDenied)}`
}

export async function getOperationFieldAccess(
  item: BaseItem,
  list: InitialisedList,
  fieldKey: string,
  context: KeystoneContext,
  operation: 'read'
): Promise<boolean> {
  if (context.__internal.sudo) return true

  const { listKey } = list
  let result
  try {
    result = await list.fields[fieldKey].access.read.item({
      operation: 'read',
      kind: 'item',
      session: context.session,
      listKey,
      fieldKey,
      context,
      item,
    })
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.${fieldKey}.access.${operation}.item` },
    ])
  }

  if (typeof result !== 'boolean') {
    throw accessReturnError([
      { tag: `${listKey}.${fieldKey}.access.${operation}.item`, returned: typeof result },
    ])
  }

  return result
}

export async function getOperationAccess(
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'create' | 'update' | 'delete'
) {
  if (context.__internal.sudo) return true

  const { listKey } = list
  let result
  try {
    if (operation === 'create') {
      result = await list.access.operation.create({
        operation,
        session: context.session,
        listKey,
        context,
      })
    } else if (operation === 'update') {
      result = await list.access.operation.update({
        operation,
        session: context.session,
        listKey,
        context,
      })
    } else if (operation === 'delete') {
      result = await list.access.operation.delete({
        operation,
        session: context.session,
        listKey,
        context,
      })
    }
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${listKey}.access.operation.${operation}` },
    ])
  }

  if (typeof result !== 'boolean') {
    throw accessReturnError([
      { tag: `${listKey}.access.operation.${operation}`, returned: typeof result },
    ])
  }

  return result
}

export async function getOperationQueryAccess(
  list: InitialisedList,
  context: KeystoneContext,
  kind: QueryOperationKind
) {
  if (context.__internal.sudo) return true

  const { listKey } = list
  let result
  try {
    const args = {
      operation: 'query' as const,
      session: context.session,
      listKey,
      context,
    }
    if (kind === 'one') {
      result = await list.access.operation.query.one({ ...args, kind })
    } else if (kind === 'many') {
      result = await list.access.operation.query.many({ ...args, kind })
    } else {
      result = await list.access.operation.query.count({ ...args, kind })
    }
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${listKey}.access.operation.query.${kind}` },
    ])
  }

  if (typeof result !== 'boolean') {
    throw accessReturnError([
      { tag: `${listKey}.access.operation.query.${kind}`, returned: typeof result },
    ])
  }

  return result
}

export async function getAccessFilters(
  list: InitialisedList,
  context: KeystoneContext,
  operation: keyof typeof list.access.filter
): Promise<boolean | InputFilter> {
  if (context.__internal.sudo) return true

  try {
    let filters
    if (operation === 'query') {
      filters = await list.access.filter.query({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      })
    } else if (operation === 'update') {
      filters = await list.access.filter.update({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      })
    } else if (operation === 'delete') {
      filters = await list.access.filter.delete({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      })
    }

    if (typeof filters === 'boolean') return filters
    if (!filters) return false // shouldn't happen, but, Typescript

    const schema = context.sudo().graphql.schema
    const whereInput = assertInputObjectType(schema.getType(list.graphql.names.whereInputName))
    const result = coerceAndValidateForGraphQLInput(schema, whereInput, filters)
    if (result.kind === 'valid') return result.value
    throw result.error
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.filter.${operation}` },
    ])
  }
}

export async function enforceListLevelAccessControl(
  context: KeystoneContext,
  operation: 'create' | 'update' | 'delete',
  list: InitialisedList,
  inputData: Record<string, unknown>,
  item: BaseItem | undefined
) {
  if (context.__internal.sudo) return

  let accepted: unknown // should be boolean, but dont trust, it might accidentally be a filter
  try {
    // apply access.item.* controls
    if (operation === 'create') {
      const itemAccessControl = list.access.item[operation]
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        inputData,
      })
    } else if (operation === 'update' && item !== undefined) {
      const itemAccessControl = list.access.item[operation]
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item,
        inputData,
      })
    } else if (operation === 'delete' && item !== undefined) {
      const itemAccessControl = list.access.item[operation]
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item,
      })
    }
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.item.${operation}` },
    ])
  }

  // short circuit the safe path
  if (accepted === true) return

  if (typeof accepted !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof accepted,
      },
    ])
  }

  throw accessDeniedError(cannotForItem(operation, list))
}

export async function enforceFieldLevelAccessControl(
  context: KeystoneContext,
  operation: 'create' | 'update',
  list: InitialisedList,
  inputData: Record<string, unknown>,
  item: BaseItem | undefined
) {
  if (context.__internal.sudo) return

  const nonBooleans: { tag: string; returned: string }[] = []
  const fieldsDenied: string[] = []
  const accessErrors: { error: Error; tag: string }[] = []

  await Promise.allSettled(
    Object.keys(inputData).map(async fieldKey => {
      let accepted: unknown // should be boolean, but dont trust
      try {
        // apply fields.[fieldKey].access.* controls
        if (operation === 'create') {
          const fieldAccessControl = list.fields[fieldKey].access[operation]
          accepted = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            inputData: inputData as any, // FIXME
          })
        } else if (operation === 'update' && item !== undefined) {
          const fieldAccessControl = list.fields[fieldKey].access[operation]
          accepted = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            item,
            inputData,
          })
        }
      } catch (error: any) {
        accessErrors.push({ error, tag: `${list.listKey}.${fieldKey}.access.${operation}` })
        return
      }

      // short circuit the safe path
      if (accepted === true) return
      fieldsDenied.push(fieldKey)

      // wrong type?
      if (typeof accepted !== 'boolean') {
        nonBooleans.push({
          tag: `${list.listKey}.${fieldKey}.access.${operation}`,
          returned: typeof accepted,
        })
      }
    })
  )

  if (nonBooleans.length) {
    throw accessReturnError(nonBooleans)
  }

  if (accessErrors.length) {
    throw extensionError('Access control', accessErrors)
  }

  if (fieldsDenied.length) {
    throw accessDeniedError(cannotForItemFields(operation, list, fieldsDenied))
  }
}

export async function checkFilterOrderAccess(
  things: { fieldKey: string; list: InitialisedList }[],
  context: KeystoneContext,
  kind: 'filter' | 'order'
) {
  if (context.__internal.sudo) return

  const accessErrors: { error: Error; tag: string }[] = []

  for (const { fieldKey, list } of things) {
    const field = list.fields[fieldKey]
    let accepted: unknown

    try {
      const args = {
        context,
        session: context.session,
        listKey: list.listKey,
        operation: 'read' as const,
        fieldKey,
      }
      if (kind === 'filter') {
        accepted = await field.access.read.filter({ ...args, kind })
      } else if (kind === 'order') {
        accepted = await field.access.read.order({ ...args, kind })
      }
    } catch (error: any) {
      accessErrors.push({ error, tag: `${list.listKey}.${fieldKey}.access.read.${kind}` })
      continue
    }

    // short circuit the safe path
    if (accepted === true) continue

    // wrong type?
    if (typeof accepted !== 'boolean') {
      throw accessReturnError([
        {
          tag: `${list.listKey}.${fieldKey}.access.read.${kind}`,
          returned: typeof accepted,
        },
      ])
    }

    // only the first
    throw accessDeniedError(cannotForItemFields(kind, list, [fieldKey]))
  }

  if (accessErrors.length) {
    throw extensionError('Access control', accessErrors)
  }
}

export type ResolvedFieldAccessControl = {
  read: {
    item: FieldAccessControlFunction<FieldReadItemAccessArgs<BaseListTypeInfo>>
    filter: FieldAccessControlFunction<FieldFilterItemAccessArgs<BaseListTypeInfo>>
    order: FieldAccessControlFunction<FieldOrderItemAccessArgs<BaseListTypeInfo>>
  }
  create: FieldAccessControlFunction<FieldCreateItemAccessArgs<BaseListTypeInfo>>
  update: FieldAccessControlFunction<FieldUpdateItemAccessArgs<BaseListTypeInfo>>
  // delete: not supported
}

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseListTypeInfo> | undefined,
  defaultAccess: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  const defaultResolvedAccess = defaultAccess
    ? parseFieldAccessControl(defaultAccess, undefined)
    : {
        read: {
          item: allowAll,
          filter: allowAll,
          order: allowAll,
        },
        create: allowAll,
        update: allowAll,
      }

  if (!access) {
    return defaultResolvedAccess
  }

  if (typeof access === 'function') {
    return {
      read: {
        item: access,
        filter: access,
        order: access,
      },
      create: access,
      update: access,
    }
  }

  let read = defaultResolvedAccess.read
  if (typeof access.read === 'function') {
    read = {
      item: access.read,
      filter: access.read,
      order: access.read,
    }
  } else if (access.read !== undefined) {
    read = access.read
  }

  return {
    read,
    create: access.create ?? defaultResolvedAccess.create,
    update: access.update ?? defaultResolvedAccess.update,
  }
}

export type ResolvedActionAccessControl = ActionAccessControlFunction<BaseListTypeInfo>

export type ResolvedListAccessControl = {
  operation: {
    query: {
      one: ListQueryAccessControl<'one', BaseListTypeInfo>
      many: ListQueryAccessControl<'many', BaseListTypeInfo>
      count: ListQueryAccessControl<'count', BaseListTypeInfo>
    }
    create: ListOperationAccessControl<'create', BaseListTypeInfo>
    update: ListOperationAccessControl<'update', BaseListTypeInfo>
    delete: ListOperationAccessControl<'delete', BaseListTypeInfo>
  }
  filter: {
    query: ListFilterAccessControl<'query', BaseListTypeInfo>
    // create: not supported
    update: ListFilterAccessControl<'update', BaseListTypeInfo>
    delete: ListFilterAccessControl<'delete', BaseListTypeInfo>
  }
  item: {
    // query: not supported
    create: CreateListItemAccessControl<BaseListTypeInfo>
    update: UpdateListItemAccessControl<BaseListTypeInfo>
    delete: DeleteListItemAccessControl<BaseListTypeInfo>
  }
}

export function parseListAccessControl(
  access: ListAccessControlPre<BaseListTypeInfo>
): ResolvedListAccessControl {
  if (typeof access === 'function') {
    return {
      operation: {
        query: {
          one: access,
          many: access,
          count: access,
        },
        create: access,
        update: access,
        delete: access,
      },
      filter: {
        query: allowAll,
        update: allowAll,
        delete: allowAll,
      },
      item: {
        create: allowAll,
        update: allowAll,
        delete: allowAll,
      },
    }
  }

  let { operation, filter, item } = access
  if (typeof operation === 'function') {
    operation = {
      query: operation,
      create: operation,
      update: operation,
      delete: operation,
    }
  }

  const query =
    typeof operation.query === 'function'
      ? { one: operation.query, many: operation.query, count: operation.query }
      : operation.query

  return {
    operation: {
      query,
      create: operation.create,
      update: operation.update,
      delete: operation.delete,
    },
    filter: {
      query: filter?.query ?? allowAll,
      // create: not supported
      update: filter?.update ?? allowAll,
      delete: filter?.delete ?? allowAll,
    },
    item: {
      // query: not supported
      create: item?.create ?? allowAll,
      update: item?.update ?? allowAll,
      delete: item?.delete ?? allowAll,
    },
  }
}

export async function checkUniqueItemExists(
  uniqueInput: UniqueInputFilter,
  foreignList: InitialisedList,
  context: KeystoneContext,
  operation: string
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList, context)

  // Check whether the item exists (from this users POV).
  try {
    const item = await context.db[foreignList.listKey].findOne({ where: uniqueInput })
    if (item !== null) return uniqueWhere
  } catch (err) {}

  throw accessDeniedError(cannotForItem(operation, foreignList))
}
