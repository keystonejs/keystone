import {
  FindManyArgsValue,
  ItemRootValue,
  KeystoneContext,
  OrderDirection,
} from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateNonCreateListAccessControl } from '../access-control';
import {
  PrismaFilter,
  UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
} from '../where-inputs';
import { accessDeniedError, LimitsExceededError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { getDBFieldKeyForFieldOnMultiField, runWithPrisma } from '../utils';

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

export async function accessControlledFilter(
  list: InitialisedList,
  context: KeystoneContext,
  resolvedWhere: PrismaFilter,
  search?: string | null | undefined
) {
  // Run access control
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: { context, listKey: list.listKey, operation: 'read', session: context.session },
  });
  if (access === false) {
    throw accessDeniedError('query');
  }

  // Merge declarative access control
  if (typeof access === 'object') {
    resolvedWhere = { AND: [resolvedWhere, await resolveWhereInput(access, list)] };
  }

  // Merge legacy `search` inputs
  if (search) {
    resolvedWhere = list.applySearchField(resolvedWhere, search);
  }

  return resolvedWhere;
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list.fields, context);
  const resolvedWhere = mapUniqueWhereToWhere(list, uniqueWhere);

  // Apply access control
  const filter = await accessControlledFilter(list, context, resolvedWhere);

  const item = await runWithPrisma(context, list, model => model.findFirst({ where: filter }));

  if (item === null) {
    throw accessDeniedError('query');
  }
  return item;
}

export async function findMany(
  { where, first, skip, orderBy: rawOrderBy, search }: FindManyArgsValue,
  list: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
): Promise<ItemRootValue[]> {
  const orderBy = await resolveOrderBy(rawOrderBy, list, context);

  applyEarlyMaxResults(first, list);

  let resolvedWhere = await resolveWhereInput(where || {}, list);
  resolvedWhere = await accessControlledFilter(list, context, resolvedWhere, search);

  const results = await runWithPrisma(context, list, model =>
    model.findMany({
      where: extraFilter === undefined ? resolvedWhere : { AND: [resolvedWhere, extraFilter] },
      orderBy,
      take: first ?? undefined,
      skip,
    })
  );

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
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  return await Promise.all(
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
  );
}

export async function count(
  { where, search }: { where: Record<string, any>; search?: string | null },
  list: InitialisedList,
  context: KeystoneContext,
  extraFilter?: PrismaFilter
) {
  let resolvedWhere = await resolveWhereInput(where || {}, list);
  resolvedWhere = await accessControlledFilter(list, context, resolvedWhere, search);

  return runWithPrisma(context, list, model =>
    model.count({
      where: extraFilter === undefined ? resolvedWhere : { AND: [resolvedWhere, extraFilter] },
    })
  );
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
