import path from 'path';
import fs from 'fs';
import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { saveSchemaAndTypes } from '../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from './utils';

export async function build() {
  console.log('🤞 Building Keystone');
  const dotKeystonePath = path.resolve('.keystone');
  const projectAdminPath = path.join(dotKeystonePath, 'admin');
  const buildArtifact = path.join(dotKeystonePath, 'build.flag');

  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config);

  console.log('✨ Generating Schema');
  await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

  console.log('✨ Generating Admin UI');
  await generateAdminUI(config, graphQLSchema, keystone, projectAdminPath);

  console.log('✨ Building Admin UI and API');
  await buildAdminUI(projectAdminPath);

  console.log('✨ Saving build artifact');
  fs.closeSync(fs.openSync(buildArtifact, 'w'));
}
