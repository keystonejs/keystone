import { ItemRootValue, KeystoneContext, types } from '@keystone-next/types';
import { PrismaFilter, UniquePrismaFilter } from './input-resolvers';
import { LimitsExceededError } from './ListTypes/graphqlErrors';
import { InitialisedList } from './types-for-lists';

export const prismaScalarsToGraphQLScalars = {
  String: types.String,
  Boolean: types.Boolean,
  Int: types.Int,
  Float: types.Float,
  DateTime: types.String,
  Json: types.JSON,
};

declare const prisma: unique symbol;

// note prisma "promises" aren't really Promises, they have `then`, `catch` and `finally` but they don't start executation immediately
// so if you don't call .then/catch/finally/use it in $transaction, the operation will never happen
export type PrismaPromise<T> = Promise<T> & { [prisma]: true };

type PrismaModel = {
  count: (arg: {
    where?: PrismaFilter;
    take?: number;
    skip?: number;
    // this is technically wrong because relation orderBy but we're not doing that yet so it's fine
    orderBy?: readonly Record<string, 'asc' | 'desc'>[];
  }) => PrismaPromise<number>;
  findMany: (arg: {
    where?: PrismaFilter;
    take?: number;
    skip?: number;
    // this is technically wrong because relation orderBy but we're not doing that yet so it's fine
    orderBy?: readonly Record<string, 'asc' | 'desc'>[];
    include?: Record<string, boolean>;
    select?: Record<string, any>;
  }) => PrismaPromise<ItemRootValue[]>;
  delete: (arg: { where: UniquePrismaFilter }) => PrismaPromise<ItemRootValue>;
  deleteMany: (arg: { where: PrismaFilter }) => PrismaPromise<ItemRootValue>;
  findUnique: (args: {
    where: UniquePrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<ItemRootValue | null>;
  findFirst: (args: {
    where: PrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<ItemRootValue | null>;
  create: (args: {
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<ItemRootValue>;
  update: (args: {
    where: UniquePrismaFilter;
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<ItemRootValue>;
};

export type UnwrapPromise<TPromise extends Promise<any>> = TPromise extends Promise<infer T>
  ? T
  : never;

export type UnwrapPromises<T extends Promise<any>[]> = {
  // unsure about this conditional
  [Key in keyof T]: Key extends number ? UnwrapPromise<T[Key]> : never;
};

// please do not make this type be the value of KeystoneContext['prisma']
// this type is meant for generic usage, KeystoneContext should be generic over a PrismaClient
// and we should generate a KeystoneContext type in node_modules/.keystone/types which passes in the user's PrismaClient type
// so that users get right PrismaClient types specifically for their project
export type PrismaClient = {
  $disconnect(): Promise<void>;
  $connect(): Promise<void>;
  $transaction<T extends PrismaPromise<any>[]>(promises: [...T]): UnwrapPromises<T>;
} & Record<string, PrismaModel>;

export function getPrismaModelForList(prismaClient: PrismaClient, listKey: string) {
  return prismaClient[listKey[0].toLowerCase() + listKey.slice(1)];
}

// this is wrong
// all the things should be generic over the id type
// i don't want to deal with that right now though
declare const idTypeSymbol: unique symbol;

export type IdType = { ___keystoneIdType: typeof idTypeSymbol; toString(): string };

export function applyFirstSkipToCount({
  count,
  first,
  skip,
}: {
  count: number;
  first: number | null | undefined;
  skip: number | null | undefined;
}) {
  if (skip !== undefined && skip !== null) {
    count -= skip;
  }
  if (first !== undefined && first !== null) {
    count = Math.min(count, first);
  }
  count = Math.max(0, count); // Don't want to go negative from a skip!
  return count;
}

const limitedExceedError = (args: { type: string; limit: number; list: string }) =>
  new LimitsExceededError({ data: args });

export function applyEarlyMaxResults(_first: number | null | undefined, list: InitialisedList) {
  const first = _first ?? Infinity;
  // We want to help devs by failing fast and noisily if limits are violated.
  // Unfortunately, we can't always be sure of intent.
  // E.g., if the query has a "first: 10", is it bad if more results could come back?
  // Maybe yes, or maybe the dev is just paginating posts.
  // But we can be sure there's a problem in two cases:
  // * The query explicitly has a "first" that exceeds the limit
  // * The query has no "first", and has more results than the limit
  if (first < Infinity && first > list.maxResults) {
    throw limitedExceedError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
}

export function applyMaxResults(
  results: unknown[],
  list: InitialisedList,
  context: KeystoneContext
) {
  if (results.length > list.maxResults) {
    throw limitedExceedError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
  if (context) {
    context.totalResults += Array.isArray(results) ? results.length : 1;
    if (context.totalResults > context.maxTotalResults) {
      throw limitedExceedError({
        list: list.listKey,
        type: 'maxTotalResults',
        limit: context.maxTotalResults,
      });
    }
  }
}
