import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { saveSchemaAndTypes } from '../../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export async function build({ dotKeystonePath, projectAdminPath }: StaticPaths) {
  console.log('🤞 Building Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config, dotKeystonePath, 'build');

  console.log('✨ Generating graphQL schema');
  await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

  console.log('✨ Generating Admin UI code');
  await generateAdminUI(config, graphQLSchema, keystone, projectAdminPath);

  console.log('✨ Building Admin UI');
  await buildAdminUI(projectAdminPath);

  console.log('✨ Generating database client');
  // FIXME: This should never generate a migratration... right?
  // FIXME: This needs to generate clients for the correct build target using binaryTarget
  // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
  await keystone.adapters.PrismaAdapter._generateClient(keystone._consolidateRelationships());
}
