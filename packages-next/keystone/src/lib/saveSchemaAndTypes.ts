import { printSchema, GraphQLSchema } from 'graphql';
import { outputFile } from 'fs-extra';
import type { BaseKeystone } from '@keystone-next/types';
import { printGeneratedTypes } from './schema-type-printer';

export async function saveSchemaAndTypes(graphQLSchema: GraphQLSchema, keystone: BaseKeystone) {
  const path = './.keystone';
  const printedSchema = printSchema(graphQLSchema);
  await outputFile(`${path}/schema.graphql`, printedSchema);
  await outputFile(
    `${path}/schema-types.ts`,
    printGeneratedTypes(printedSchema, keystone, graphQLSchema)
  );
}
