import { printSchema } from 'graphql';
import * as fs from 'fs-extra';
import { initKeystoneFromConfig } from '../lib/initKeystoneFromConfig';
import { formatSource, generateAdminUI } from '../lib/generateAdminUI';
import { startAdminUI } from '../lib/startAdminUI';
import { printGeneratedTypes } from './schema-type-printer';

export const dev = async () => {
  console.log('🤞 Starting Keystone');

  const keystone = initKeystoneFromConfig();
  let printedSchema = printSchema(keystone.graphQLSchema);
  await fs.outputFile('./.keystone/schema.graphql', printedSchema);
  await fs.outputFile(
    './.keystone/schema-types.ts',
    formatSource(printGeneratedTypes(printedSchema, keystone), 'babel-ts')
  );
  console.log(' - Generating Admin UI');
  await generateAdminUI(keystone, process.cwd());

  console.log('⭐️ Ready!');

  startAdminUI(undefined, keystone);
};
