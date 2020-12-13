import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { formatSource } from './dev';
import { printGeneratedTypes } from './schema-type-printer';
import * as fs from 'fs-extra';
import { printSchema } from 'graphql';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { CONFIG_PATH } from './utils';
import Path from 'path';

export async function build() {
  const config = initConfig(requireSource(CONFIG_PATH).default);

  const system = createSystem(config);
  let printedSchema = printSchema(system.graphQLSchema);
  console.log('✨ Generating Schema');
  await fs.outputFile('./.keystone/schema.graphql', printedSchema);
  await fs.outputFile(
    './.keystone/schema-types.ts',
    formatSource(
      printGeneratedTypes(printedSchema, system.keystone, system.graphQLSchema),
      'babel-ts'
    )
  );

  console.log('✨ Generating Admin UI');
  await generateAdminUI(config, system);
  console.log('✨ Building Admin UI and API');
  await buildAdminUI(Path.resolve('.keystone'));
}
