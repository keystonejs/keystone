import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { saveSchemaAndTypes } from '../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from './utils';
import Path from 'path';

export async function build() {
  console.log('🤞 Building Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config);

  console.log('✨ Generating Schema');
  await saveSchemaAndTypes(graphQLSchema, keystone);

  console.log('✨ Generating Admin UI');
  await generateAdminUI(config, graphQLSchema, keystone);

  console.log('✨ Building Admin UI and API');
  await buildAdminUI(Path.resolve('.keystone'));
}
