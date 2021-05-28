import { FindManyArgsValue, KeystoneContext } from '@keystone-next/types';
import { validateNonCreateListAccessControl } from './access-control';
import {
  InputFilter,
  PrismaFilter,
  UniquePrismaFilter,
  resolveUniqueWhereInput,
  resolveOrderBy,
} from './input-resolvers';
import { accessDeniedError } from './ListTypes/graphqlErrors';
import { InitialisedList } from './types-for-lists';
import { applyEarlyMaxResults, applyMaxResults, getPrismaModelForList } from './utils';

export async function findManyFilter(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  where: InputFilter,
  search: string | null | undefined
): Promise<false | PrismaFilter> {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: {
      context,
      listKey,
      operation: 'read',
      session: context.session,
    },
  });
  if (!access) {
    return false;
  }
  const whereInputResolver = list.inputResolvers.where(context);
  let resolvedWhere = await whereInputResolver(where || {});
  if (typeof access === 'object') {
    resolvedWhere = {
      AND: [resolvedWhere, await whereInputResolver(access)],
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
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: {
      context,
      listKey,
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
    : { AND: [wherePrismaFilter, await list.inputResolvers.where(context)(access)] };
}

export async function findOne(
  args: { where: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const filter = await findOneFilter(args, listKey, list, context);
  if (filter === false) {
    throw accessDeniedError('query');
  }
  const item = await getPrismaModelForList(context.prisma, listKey).findFirst({
    where: filter,
  });
  if (item === null) {
    throw accessDeniedError('query');
  }
  return item;
}

export async function getFindManyArgs<T>(
  { where, first, skip, orderBy: rawOrderBy, search, sortBy }: FindManyArgsValue,
  get: (args: {
    where: PrismaFilter;
    take: number | undefined;
    skip: number;
    orderBy: readonly Record<string, 'asc' | 'desc'>[];
  }) => Promise<T[]>,
  list: InitialisedList,
  context: KeystoneContext
): Promise<T[]> {
  const [resolvedWhere, orderBy] = await Promise.all([
    findManyFilter(list.listKey, list, context, where || {}, search),
    resolveOrderBy(rawOrderBy, sortBy, list, context),
  ]);
  applyEarlyMaxResults(first, list);

  if (resolvedWhere === false) {
    throw accessDeniedError('query');
  }
  const results = await get({
    where: resolvedWhere,
    orderBy,
    take: first ?? undefined,
    skip,
  });
  applyMaxResults(results, list, context);
  return results;
}

export async function findMany(
  args: FindManyArgsValue,
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  return getFindManyArgs(
    args,
    args => getPrismaModelForList(context.prisma, listKey).findMany(args),
    list,
    context
  );
}

export async function count(
  { where, search }: { where: Record<string, any>; search?: string | null },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const resolvedWhere = await findManyFilter(listKey, list, context, where || {}, search);
  if (resolvedWhere === false) {
    throw accessDeniedError('query');
  }
  return getPrismaModelForList(context.prisma, listKey).count({
    where: resolvedWhere,
  });
}
