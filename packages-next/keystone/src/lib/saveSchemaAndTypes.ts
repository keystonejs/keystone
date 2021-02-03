import path from 'path';
import { printSchema, GraphQLSchema } from 'graphql';
import { outputFile } from 'fs-extra';
import type { BaseKeystone } from '@keystone-next/types';
import { printGeneratedTypes } from './schema-type-printer';

export async function saveSchemaAndTypes(
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  dotKeystonePath: string
) {
  const printedSchema = printSchema(graphQLSchema);
  await outputFile(path.join(dotKeystonePath, 'schema.graphql'), printedSchema);
  await outputFile(
    path.join(dotKeystonePath, 'schema-types.ts'),
    printGeneratedTypes(printedSchema, keystone, graphQLSchema)
  );
}
