import path from 'path';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { createExpressServer } from '../../lib/createExpressServer';
import { PORT } from '../utils';
import type { StaticPaths } from '..';
import * as fs from 'fs-extra';

export const start = async ({ dotKeystonePath, projectAdminPath }: StaticPaths) => {
  console.log('🤞 Starting Keystone');

  const apiFile = path.join(projectAdminPath, '.next/server/pages/api/__keystone_api_build.js');
  if (!fs.existsSync(apiFile)) {
    throw new Error('keystone-next build must be run before running keystone-next start');
  }
  const config = initConfig(require(apiFile).config);
  const { keystone, graphQLSchema, createContext } = createSystem(config, dotKeystonePath, 'start');

  console.log('✨ Connecting to the database');
  await keystone.connect({ context: createContext({ skipAccessControl: true }) });

  console.log('✨ Creating server');
  const server = await createExpressServer(
    config,
    graphQLSchema,
    createContext,
    false,
    projectAdminPath
  );
  console.log(`👋 Admin UI and graphQL API ready`);

  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Server Ready on http://localhost:${PORT}`);
  });
};
