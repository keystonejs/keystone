import { DBField } from '@keystone-next/types/src/next-fields';

// https://github.com/prisma/prisma-engines/blob/c5bee99a3abae3004e266533d9ffcd619c9b1264/libs/datamodel/core/src/ast/parser/datamodel.pest
const prismaSchemaIdentifier = /^[A-Za-z-_]$/;

type ListsToPrintPrismaSchema = Record<string, FieldToPrintPrismaSchema>;

type FieldToPrintPrismaSchema = Record<string, DBField>;

function addOpposingFromFieldsToPrismaSchema(lists: ListsToPrintPrismaSchema) {
  for (const [listKey, fields] of Object.entries(lists)) {
    if (!prismaSchemaIdentifier.test(listKey)) {
      throw new Error(
        `The list key ${listKey} does not match the allowed characters for a Prisma Schema (it should match the pattern ${prismaSchemaIdentifier})`
      );
    }
    for (const [fieldPath, field] of Object.entries(fields)) {
    }
  }
}

export function printSchema(lists: ListsToPrintPrismaSchema) {
  for (const [listKey, fields] of Object.entries(lists)) {
    if (!prismaSchemaIdentifier.test(listKey)) {
      throw new Error(
        `The list key ${listKey} does not match the allowed characters for a Prisma Schema (it should match the pattern ${prismaSchemaIdentifier})`
      );
    }
    for (const [fieldPath, field] of Object.keys(fields)) {
    }
  }
}
