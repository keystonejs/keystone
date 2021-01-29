import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { saveSchemaAndTypes } from '../../lib/saveSchemaAndTypes';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const generate = async ({ dotKeystonePath }: StaticPaths) => {
  console.log('🤞 Migrating Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);
  const { keystone, graphQLSchema, createContext } = createSystem(
    config,
    dotKeystonePath,
    'generate'
  );

  console.log('✨ Generating graphQL schema');
  await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

  console.log('✨ Generating migration');
  await keystone.connect({ context: createContext({ skipAccessControl: true }) });

  await keystone.disconnect();
};
