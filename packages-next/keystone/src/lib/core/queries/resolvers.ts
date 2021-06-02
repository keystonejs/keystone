import { FindManyArgsValue, ItemRootValue, KeystoneContext } from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateNonCreateListAccessControl } from '../access-control';
import {
  InputFilter,
  PrismaFilter,
  UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveOrderBy,
  resolveWhereInput,
} from '../input-resolvers';
import { accessDeniedError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { applyEarlyMaxResults, applyMaxResults, getPrismaModelForList } from '../utils';

export async function findManyFilter(
  list: InitialisedList,
  context: KeystoneContext,
  where: InputFilter,
  search: string | null | undefined
): Promise<false | PrismaFilter> {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: {
      context,
      listKey: list.listKey,
      operation: 'read',
      session: context.session,
    },
  });
  if (!access) {
    return false;
  }
  let resolvedWhere = await resolveWhereInput(where || {}, list);
  if (typeof access === 'object') {
    resolvedWhere = {
      AND: [resolvedWhere, await resolveWhereInput(access, list)],
    };
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
  { where }: { where: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: {
      context,
      listKey: list.listKey,
      operation: 'read',
      session: context.session,
    },
  });
  if (access === false) {
    return false;
  }
  let resolvedUniqueWhere = await resolveUniqueWhereInput(where, list.fields, context);
  const wherePrismaFilter = mapUniqueWhereToWhere(list, resolvedUniqueWhere);
  return access === true
    ? wherePrismaFilter
    : { AND: [wherePrismaFilter, await resolveWhereInput(access, list)] };
}

export async function findOne(
  args: { where: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const filter = await findOneFilter(args, list, context);
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
  const [resolvedWhere, orderBy] = await Promise.all([
    findManyFilter(list, context, where || {}, search),
    resolveOrderBy(rawOrderBy, sortBy, list, context),
  ]);
  applyEarlyMaxResults(first, list);

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
      list.cacheHint({
        results,
        operationName: info.operation.name?.value,
        meta: false,
      }) as any
    );
  }
  return results;
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
