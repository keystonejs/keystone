import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { saveSchemaAndTypes } from '../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from './utils';
import type { StaticPaths } from './';

export async function build({ dotKeystonePath, projectAdminPath }: StaticPaths) {
  console.log('🤞 Building Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config, dotKeystonePath);

  console.log('✨ Generating Schema');
  await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

  console.log('✨ Generating Admin UI');
  await generateAdminUI(config, graphQLSchema, keystone, projectAdminPath);

  console.log('✨ Building Admin UI and API');
  await buildAdminUI(projectAdminPath);
}
