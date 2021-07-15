import {
  FindManyArgsValue,
  ItemRootValue,
  KeystoneContext,
  OrderDirection,
} from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateNonCreateListAccessControl } from '../access-control';
import {
  InputFilter,
  PrismaFilter,
  UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
} from '../where-inputs';
import { accessDeniedError, LimitsExceededError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { getPrismaModelForList, getDBFieldKeyForFieldOnMultiField } from '../utils';

export async function findManyFilter(
  list: InitialisedList,
  context: KeystoneContext,
  where: InputFilter,
  search: string | null | undefined
): Promise<false | PrismaFilter> {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: { context, listKey: list.listKey, operation: 'read', session: context.session },
  });
  if (!access) {
    return false;
  }
  let resolvedWhere = await resolveWhereInput(where || {}, list);
  if (typeof access === 'object') {
    resolvedWhere = { AND: [resolvedWhere, await resolveWhereInput(access, list)] };
  }

  return list.applySearchField(resolvedWhere, search);
}

// doing this is a result of an optimisation to skip doing a findUnique and then a findFirst(where the second one is done with access control)
// we want to do this explicit mapping because:
// - we are passing the values into a normal where filter and we want to ensure that fields cannot do non-unique filters(we don't do validation on non-unique wheres because prisma will validate all that)
// - for multi-field unique indexes, we need to a mapping because iirc findFirst/findMany won't understand the syntax for filtering by multi-field unique indexes(which makes sense and is correct imo)
export function mapUniqueWhereToWhere(
  list: InitialisedList,
  uniqueWhere: UniquePrismaFilter
): PrismaFilter {
  // inputResolvers.uniqueWhere validates that there is only one key
  const key = Object.keys(uniqueWhere)[0];
  const dbField = list.fields[key].dbField;
  if (dbField.kind !== 'scalar' || (dbField.scalar !== 'String' && dbField.scalar !== 'Int')) {
    throw new Error(
      'Currently only String and Int scalar db fields can provide a uniqueWhere input'
    );
  }
  const val = uniqueWhere[key];
  if (dbField.scalar === 'Int' && typeof val !== 'number') {
    throw new Error('uniqueWhere inputs must return an integer for Int db fields');
  }
  if (dbField.scalar === 'String' && typeof val !== 'string') {
    throw new Error('uniqueWhere inputs must return an string for String db fields');
  }
  return { [key]: val };
}

async function findOneFilter(
  uniqueWhere: UniquePrismaFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: { context, listKey: list.listKey, operation: 'read', session: context.session },
  });
  if (access === false) {
    return false;
  }

  const wherePrismaFilter = mapUniqueWhereToWhere(list, uniqueWhere);
  return access === true
    ? wherePrismaFilter
    : { AND: [wherePrismaFilter, await resolveWhereInput(access, list)] };
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list.fields, context);
  // Apply access control
  const filter = await findOneFilter(uniqueWhere, list, context);
  if (filter === false) {
    throw accessDeniedError('query');
  }
  const item = await getPrismaModelForList(context.prisma, list.listKey).findFirst({
    where: filter,
  });
  if (item === null) {
    throw accessDeniedError('query');
  }
  return item;
}

export async function findMany(
  { where, first, skip, orderBy: rawOrderBy, search, sortBy }: FindManyArgsValue,
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
): Promise<ItemRootValue[]> {
  const orderBy = await resolveOrderBy(rawOrderBy, sortBy, list, context);

  applyEarlyMaxResults(first, list);

  const resolvedWhere = await findManyFilter(list, context, where || {}, search);
  if (resolvedWhere === false) {
    throw accessDeniedError('query');
  }

  const results = await getPrismaModelForList(context.prisma, list.listKey).findMany({
    where: extraFilter === undefined ? resolvedWhere : { AND: [resolvedWhere, extraFilter] },
    orderBy,
    take: first ?? undefined,
    skip,
  });

  applyMaxResults(results, list, context);

  if (info.cacheControl && list.cacheHint) {
    info.cacheControl.setCacheHint(
      list.cacheHint({ results, operationName: info.operation.name?.value, meta: false }) as any
    );
  }
  return results;
}

async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  sortBy: readonly string[] | null | undefined,
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  return (
    await Promise.all(
      orderBy.map(async orderBySelection => {
        const keys = Object.keys(orderBySelection);
        if (keys.length !== 1) {
          throw new Error(
            `Only a single key must be passed to ${list.types.orderBy.graphQLType.name}`
          );
        }

        const fieldKey = keys[0];
        const value = orderBySelection[fieldKey];
        if (value === null) {
          throw new Error('null cannot be passed as an order direction');
        }

        const field = list.fields[fieldKey];
        const resolve = field.input!.orderBy!.resolve;
        const resolvedValue = resolve ? await resolve(value, context) : value;
        if (field.dbField.kind === 'multi') {
          const keys = Object.keys(resolvedValue);
          if (keys.length !== 1) {
            throw new Error(
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
    )
  ).concat(
    sortBy?.map(sort =>
      sort.endsWith('_DESC')
        ? { [sort.slice(0, -'_DESC'.length)]: 'desc' }
        : { [sort.slice(0, -'_ASC'.length)]: 'asc' }
    ) || []
  );
}

export async function count(
  { where, search }: { where: Record<string, any>; search?: string | null },
  list: InitialisedList,
  context: KeystoneContext
) {
  const resolvedWhere = await findManyFilter(list, context, where || {}, search);
  if (resolvedWhere === false) {
    throw accessDeniedError('query');
  }

  return getPrismaModelForList(context.prisma, list.listKey).count({
    where: resolvedWhere,
  });
}

const limitsExceedError = (args: { type: string; limit: number; list: string }) =>
  new LimitsExceededError({ data: args });

function applyEarlyMaxResults(_first: number | null | undefined, list: InitialisedList) {
  const first = _first ?? Infinity;
  // We want to help devs by failing fast and noisily if limits are violated.
  // Unfortunately, we can't always be sure of intent.
  // E.g., if the query has a "first: 10", is it bad if more results could come back?
  // Maybe yes, or maybe the dev is just paginating posts.
  // But we can be sure there's a problem in two cases:
  // * The query explicitly has a "first" that exceeds the limit
  // * The query has no "first", and has more results than the limit
  if (first < Infinity && first > list.maxResults) {
    throw limitsExceedError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
}

function applyMaxResults(results: unknown[], list: InitialisedList, context: KeystoneContext) {
  if (results.length > list.maxResults) {
    throw limitsExceedError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
  if (context) {
    context.totalResults += Array.isArray(results) ? results.length : 1;
    if (context.totalResults > context.maxTotalResults) {
      throw limitsExceedError({
        list: list.listKey,
        type: 'maxTotalResults',
        limit: context.maxTotalResults,
      });
    }
  }
}
