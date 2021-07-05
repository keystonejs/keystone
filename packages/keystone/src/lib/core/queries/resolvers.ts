import { GraphQLResolveInfo } from 'graphql';
import { FindManyArgsValue, ItemRootValue, KeystoneContext, OrderDirection } from '../../../types';
import { getOperationAccess, getAccessFilters } from '../access-control';
import {
  PrismaFilter,
  UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
  InputFilter,
} from '../where-inputs';
import { limitsExceededError, userInputError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { getDBFieldKeyForFieldOnMultiField, runWithPrisma } from '../utils';
import { checkFilterOrderAccess } from '../filter-order-access';

// doing this is a result of an optimisation to skip doing a findUnique and then a findFirst(where the second one is done with access control)
// we want to do this explicit mapping because:
// - we are passing the values into a normal where filter and we want to ensure that fields cannot do non-unique filters(we don't do validation on non-unique wheres because prisma will validate all that)
// - for multi-field unique indexes, we need to a mapping because iirc findFirst/findMany won't understand the syntax for filtering by multi-field unique indexes(which makes sense and is correct imo)
export function mapUniqueWhereToWhere(uniqueWhere: UniquePrismaFilter): PrismaFilter {
  // inputResolvers.uniqueWhere validates that there is only one key
  const key = Object.keys(uniqueWhere)[0];
  return { [key]: uniqueWhere[key] };
}

function traverseQuery(
  list: InitialisedList,
  context: KeystoneContext,
  inputFilter: InputFilter,
  filterFields: Record<string, { fieldKey: string; list: InitialisedList }>
) {
  // Recursively traverse a where filter to find all the fields which are being
  // filtered on.
  Object.entries(inputFilter).forEach(([fieldKey, value]) => {
    if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
      value.forEach((value: any) => {
        traverseQuery(list, context, value, filterFields);
      });
    } else if (fieldKey === 'some' || fieldKey === 'none' || fieldKey === 'every') {
      traverseQuery(list, context, value, filterFields);
    } else {
      filterFields[`${list.listKey}.${fieldKey}`] = { fieldKey, list };
      // If it's a relationship, check the nested filters.
      const field = list.fields[fieldKey];
      if (field.dbField.kind === 'relation' && value !== null) {
        const foreignList = field.dbField.list;
        traverseQuery(list.lists[foreignList], context, value, filterFields);
      }
    }
  });
}

export async function checkFilterAccess(
  list: InitialisedList,
  context: KeystoneContext,
  inputFilter: InputFilter
) {
  if (!inputFilter) return;
  const filterFields: Record<string, { fieldKey: string; list: InitialisedList }> = {};
  traverseQuery(list, context, inputFilter, filterFields);
  await checkFilterOrderAccess(Object.values(filterFields), context, 'filter');
}

export async function accessControlledFilter(
  list: InitialisedList,
  context: KeystoneContext,
  resolvedWhere: PrismaFilter,
  accessFilters: boolean | InputFilter
) {
  // Merge the filter access control
  if (typeof accessFilters === 'object') {
    resolvedWhere = { AND: [resolvedWhere, await resolveWhereInput(accessFilters, list, context)] };
  }

  return resolvedWhere;
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return null;
  }

  const accessFilters = await getAccessFilters(list, context, 'query');
  if (accessFilters === false) {
    return null;
  }

  // maybe KS_USER_INPUT_ERROR
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list.fields, context);

  // No expected errors
  const resolvedWhere = mapUniqueWhereToWhere(uniqueWhere);

  // Maybe KS_ACCESS_DENIED, KS_SYSTEM_ERROR
  const filter = await accessControlledFilter(list, context, resolvedWhere);

  // Maybe KS_PRISMA_ERROR
  return runWithPrisma(context, list, model => model.findFirst({ where: filter }));
}

export async function findMany(
  { where, take, skip, orderBy: rawOrderBy }: FindManyArgsValue,
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
): Promise<ItemRootValue[]> {
  // Maybe KS_BAD_USER_INPUT
  // Would we like to check anything else here for user input? first/skip non-negative?
  const orderBy = await resolveOrderBy(rawOrderBy, list, context);

  // Check operation permission, throw access denied if not allowed
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return [];
  }

  const accessFilters = await getAccessFilters(list, context, 'query');
  if (accessFilters === false) {
    return [];
  }

  // Maybe KS_LIMITS_EXCEEDED
  applyEarlyMaxResults(take, list);

  // No expected errors
  let resolvedWhere = await resolveWhereInput(where || {}, list, context);

  // Maybe KS_ACCESS_DENIED, KS_SYSTEM_ERROR
  let filter = await accessControlledFilter(list, context, resolvedWhere);

  // Inject the extra filter if we're coming from a relationship query
  if (extraFilter) {
    filter = { AND: [filter, extraFilter] };
  }

  // Maybe KS_PRISMA_ERROR
  const results = await runWithPrisma(context, list, model =>
    model.findMany({ where: filter, orderBy, take: take ?? undefined, skip })
  );

  // Maybe KS_LIMITS_EXCEEDED
  applyMaxResults(results, list, context);

  if (info.cacheControl && list.cacheHint) {
    info.cacheControl.setCacheHint(
      list.cacheHint({ results, operationName: info.operation.name?.value, meta: false }) as any
    );
  }
  // Result gets passed to field resolvers
  return results;
}

async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  // Check input format. FIXME: Group all errors
  orderBy.forEach(orderBySelection => {
    const keys = Object.keys(orderBySelection);
    if (keys.length !== 1) {
      throw userInputError(
        `Only a single key must be passed to ${list.types.orderBy.graphQLType.name}`
      );
    }

    const fieldKey = keys[0];
    const value = orderBySelection[fieldKey];
    if (value === null) {
      throw userInputError('null cannot be passed as an order direction');
    }
  });

  // Check orderBy access
  const orderByKeys = orderBy.map(orderBySelection => ({
    fieldKey: Object.keys(orderBySelection)[0],
    list,
  }));
  await checkFilterOrderAccess(orderByKeys, context, 'orderBy');

  return await Promise.all(
    orderBy.map(async orderBySelection => {
      const keys = Object.keys(orderBySelection);
      const fieldKey = keys[0];
      const value = orderBySelection[fieldKey];
      const field = list.fields[fieldKey];
      const resolve = field.input!.orderBy!.resolve;
      const resolvedValue = resolve ? await resolve(value, context) : value;
      if (field.dbField.kind === 'multi') {
        // Note: no built-in field types support multi valued database fields *and* orderBy.
        // This code path is only relevent to custom fields which fit that criteria.
        const keys = Object.keys(resolvedValue);
        if (keys.length !== 1) {
          throw userInputError(
            `Only a single key must be returned from an orderBy input resolver for a multi db field`
          );
        }
        const innerKey = keys[0];
        return {
          [getDBFieldKeyForFieldOnMultiField(fieldKey, innerKey)]: resolvedValue[innerKey],
        };
      } else {
        return { [fieldKey]: resolvedValue };
      }
    })
  );
}

export async function count(
  { where }: { where: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
) {
  // Check operation permission, return zero if not allowed
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return 0;
  }
  // No expected errors
  let resolvedWhere = await resolveWhereInput(where || {}, list, context);

  // Maybe KS_ACCESS_DENIED, KS_SYSTEM_ERROR
  let filter = await accessControlledFilter(list, context, resolvedWhere);

  // Inject the extra filter if we're coming from a relationship query
  if (extraFilter) {
    filter = { AND: [filter, extraFilter] };
  }

  // Maybe KS_PRISMA_ERROR
  const count = await runWithPrisma(context, list, model => model.count({ where: filter }));

  if (info.cacheControl && list.cacheHint) {
    info.cacheControl.setCacheHint(
      list.cacheHint({
        results: count,
        operationName: info.operation.name?.value,
        meta: true,
      }) as any
    );
  }
  return count;
}

function applyEarlyMaxResults(_take: number | null | undefined, list: InitialisedList) {
  const take = Math.abs(_take ?? Infinity);
  // We want to help devs by failing fast and noisily if limits are violated.
  // Unfortunately, we can't always be sure of intent.
  // E.g., if the query has a "take: 10", is it bad if more results could come back?
  // Maybe yes, or maybe the dev is just paginating posts.
  // But we can be sure there's a problem in two cases:
  // * The query explicitly has a "take" that exceeds the limit
  // * The query has no "take", and has more results than the limit
  if (take < Infinity && take > list.maxResults) {
    throw limitsExceededError({
      listKey: list.listKey,
      type: 'maxResults',
      limit: list.maxResults,
    });
  }
}

function applyMaxResults(results: unknown[], list: InitialisedList, context: KeystoneContext) {
  if (results.length > list.maxResults) {
    throw limitsExceededError({
      listKey: list.listKey,
      type: 'maxResults',
      limit: list.maxResults,
    });
  }
  if (context) {
    context.totalResults += results.length;
    if (context.totalResults > context.maxTotalResults) {
      throw limitsExceededError({
        listKey: list.listKey,
        type: 'maxTotalResults',
        limit: context.maxTotalResults,
      });
    }
  }
}
