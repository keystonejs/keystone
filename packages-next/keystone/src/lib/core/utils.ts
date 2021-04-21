import { types } from '@keystone-next/types';

export const prismaScalarsToGraphQLScalars = {
  String: types.String,
  Boolean: types.Boolean,
  Int: types.Int,
  Float: types.Float,
  DateTime: types.String,
  Json: types.JSON,
};

type PrismaModel = {
  count: (arg: {
    where?: Record<string, any>;
    take?: number;
    skip?: number;
    orderBy?: Record<string, any>;
  }) => Promise<number>;
  findMany: (arg: {
    where?: Record<string, any>;
    take?: number;
    skip?: number;
    orderBy?: Record<string, any>;
    include?: Record<string, boolean>;
    select?: Record<string, any>;
  }) => Promise<any[]>;
  delete: (arg: { where: { id: IdType } }) => Promise<void>;
  findUnique: (args: {
    where: { id: IdType };
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => Promise<Record<string, any> | undefined>;
  create: (args: {
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => Promise<any>;
  update: (args: {
    where: { id: IdType };
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => Promise<any>;
};

type PrismaClient = {
  $disconnect(): Promise<void>;
} & Record<string, PrismaModel>;

export function getPrismaModelForList(prismaClient: PrismaClient, listKey: string) {
  return prismaClient[listKey[0].toLowerCase() + listKey.slice(1)];
}

declare const idTypeSymbol: unique symbol;

export type IdType = { ___keystoneIdType: typeof idTypeSymbol };
