import { Limit } from 'p-limit';
import pluralize from 'pluralize';
import { BaseItem, KeystoneConfig, KeystoneContext } from '../../types';
import { humanize } from '../utils';
import { prismaError } from './graphql-errors';
import { InitialisedList } from './types-for-lists';
import { PrismaFilter, UniquePrismaFilter } from './where-inputs';

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
  }) => PrismaPromise<BaseItem[]>;
  delete: (arg: { where: UniquePrismaFilter }) => PrismaPromise<BaseItem>;
  deleteMany: (arg: { where: PrismaFilter }) => PrismaPromise<BaseItem>;
  findUnique: (args: {
    where: UniquePrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem | null>;
  findFirst: (args: {
    where: PrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem | null>;
  create: (args: {
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem>;
  update: (args: {
    where: UniquePrismaFilter;
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem>;
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

// Run prisma operations as part of a resolver
export async function runWithPrisma<T>(
  context: KeystoneContext,
  { listKey }: InitialisedList,
  fn: (model: PrismaModel) => Promise<T>
) {
  const model = context.prisma[listKey[0].toLowerCase() + listKey.slice(1)];
  try {
    return await fn(model);
  } catch (err: any) {
    throw prismaError(err);
  }
}

// this is wrong
// all the things should be generic over the id type
// i don't want to deal with that right now though
declare const idTypeSymbol: unique symbol;

export type IdType = { ___keystoneIdType: typeof idTypeSymbol; toString(): string };

// these aren't here out of thinking this is better syntax(i do not think it is),
// it's just because TS won't infer the arg is X bit
export const isFulfilled = <T>(arg: PromiseSettledResult<T>): arg is PromiseFulfilledResult<T> =>
  arg.status === 'fulfilled';
export const isRejected = (arg: PromiseSettledResult<any>): arg is PromiseRejectedResult =>
  arg.status === 'rejected';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export async function promiseAllRejectWithAllErrors<T extends unknown[]>(
  promises: readonly [...T]
): Promise<{ [P in keyof T]: Awaited<T[P]> }> {
  const results = await Promise.allSettled(promises);
  if (!results.every(isFulfilled)) {
    const errors = results.filter(isRejected).map(x => x.reason);
    // AggregateError would be ideal here but it's not in Node 12 or 14
    // (also all of our error stuff is just meh. this whole thing is just to align with previous behaviour)
    const error = new Error(errors[0].message || errors[0].toString());
    (error as any).errors = errors;
    throw error;
  }

  return results.map((x: any) => x.value) as any;
}

export function getNamesFromList(
  listKey: string,
  { graphql /*plural, label, singular, path */ }: KeystoneConfig['lists'][string]
) {
  const _label = /*label ||*/ keyToLabel(listKey);
  const _singular = /*singular ||*/ pluralize.singular(_label);
  const _plural = /*plural ||*/ pluralize.plural(_label);

  if (_plural === _label) {
    throw new Error(
      `Unable to use ${_label} as a List name - it has an ambiguous plural (${_plural}). Please choose another name for your list.`
    );
  }

  const adminUILabels = {
    // Fall back to the plural for the label if none was provided, not the autogenerated default from key
    label: /*label ||*/ _plural,
    singular: _singular,
    plural: _plural,
    path: /*path || */ labelToPath(_plural),
  };

  const pluralGraphQLName = graphql?.plural || labelToClass(_plural);
  if (pluralGraphQLName === listKey) {
    throw new Error(
      `The list key and the plural must be different but the list key ${listKey} is the same as the ${listKey} plural GraphQL name`
    );
  }
  return {
    pluralGraphQLName,
    adminUILabels,
  };
}

const keyToLabel = (str: string) => {
  let label = humanize(str);

  // Retain the leading underscore for auxiliary lists
  if (str[0] === '_') {
    label = `_${label}`;
  }
  return label;
};

const labelToPath = (str: string) => str.split(' ').join('-').toLowerCase();

const labelToClass = (str: string) => str.replace(/\s+/g, '');

export function getDBFieldKeyForFieldOnMultiField(fieldKey: string, subField: string) {
  return `${fieldKey}_${subField}`;
}

// this whole thing exists because Prisma doesn't handle doing multiple writes on SQLite well
// https://github.com/prisma/prisma/issues/2955
// note this is keyed by the prisma client instance, not the context
// because even across requests, we want to apply the limit on SQLite
const writeLimits = new WeakMap<object, Limit>();

export const setWriteLimit = (prismaClient: object, limit: Limit) => {
  writeLimits.set(prismaClient, limit);
};

// this accepts the context instead of the prisma client because the prisma client on context is `any`
// so by accepting the context, it'll be less likely the wrong thing will be passed.
export const getWriteLimit = (context: KeystoneContext) => {
  const limit = writeLimits.get(context.prisma);
  if (limit === undefined) {
    throw new Error('unexpected write limit not set for prisma client');
  }
  return limit;
};
