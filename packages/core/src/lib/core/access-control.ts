import { assertInputObjectType } from 'graphql'
import {
  type BaseItem,
  type BaseListTypeInfo,
  type CreateListItemAccessControl,
  type DeleteListItemAccessControl,
  type FieldAccessControl,
  type FieldCreateItemAccessArgs,
  type FieldReadItemAccessArgs,
  type FieldUpdateItemAccessArgs,
  type IndividualFieldAccessControl,
  type KeystoneContext,
  type ListAccessControl,
  type ListFilterAccessControl,
  type ListOperationAccessControl,
  type UpdateListItemAccessControl,
} from '../../types'
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput'
import { allowAll } from '../../access'
import { accessReturnError, extensionError } from './graphql-errors'
import { type InitialisedList } from './initialise-lists'
import { type InputFilter } from './where-inputs'

export function cannotForItem (operation: string, list: InitialisedList) {
  if (operation === 'create') return `You cannot ${operation} that ${list.listKey}`
  return `You cannot ${operation} that ${list.listKey} - it may not exist`
}

export function cannotForItemFields (
  operation: string,
  list: InitialisedList,
  fieldsDenied: string[]
) {
  return `You cannot ${operation} that ${
    list.listKey
  } - you cannot ${operation} the fields ${JSON.stringify(fieldsDenied)}`
}

export async function getOperationFieldAccess (
  item: BaseItem,
  list: InitialisedList,
  fieldKey: string,
  context: KeystoneContext,
  operation: 'read' | 'create' | 'update'
) {
  const { listKey } = list
  const access = list.fields[fieldKey].access[operation]
  let result
  try {
    result = await access({
      operation: 'read',
      session: context.session,
      listKey,
      fieldKey,
      context,
      item,
    } as never) // TODO: FIXME
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.${fieldKey}.access.${operation}` },
    ])
  }

  if (typeof result !== 'boolean') {
    throw accessReturnError([
      { tag: `${listKey}.access.operation.${operation}`, returned: typeof result },
    ])
  }

  return result
}

export async function getOperationAccess (
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'query' | 'create' | 'update' | 'delete'
) {
  const { listKey } = list
  const access = list.access.operation[operation]
  let result
  try {
    result = await access({
      operation,
      session: context.session,
      listKey,
      context
    } as never) // TODO: FIXME
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

export async function getAccessFilters (
  list: InitialisedList,
  context: KeystoneContext,
  operation: keyof typeof list.access.filter
): Promise<boolean | InputFilter> {
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

export type ResolvedFieldAccessControl = {
  create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseListTypeInfo>>
  read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>
  update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseListTypeInfo>>
}

export function parseFieldAccessControl (
  access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'function') {
    return {
      read: access,
      create: access,
      update: access
    }
  }

  return {
    read: access?.read ?? allowAll,
    create: access?.create ?? allowAll,
    update: access?.update ?? allowAll,
  }
}

export type ResolvedListAccessControl = {
  operation: {
    query: ListOperationAccessControl<'query', BaseListTypeInfo>
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

export function parseListAccessControl (
  access: ListAccessControl<BaseListTypeInfo>
): ResolvedListAccessControl {
  if (typeof access === 'function') {
    return {
      operation: {
        query: access,
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

  return {
    operation: {
      query: operation.query,
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
