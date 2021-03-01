import path from 'path';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { createExpressServer } from '../../lib/createExpressServer';
import type { StaticPaths } from '..';
import * as fs from 'fs-extra';

export const start = async ({ dotKeystonePath, projectAdminPath }: StaticPaths) => {
  console.log('🤞 Starting Keystone');

  // This is the compiled version of the configuration which was generated during the build step.
  // See reexportKeystoneConfig().
  const apiFile = path.join(projectAdminPath, '.next/server/pages/api/__keystone_api_build.js');
  if (!fs.existsSync(apiFile)) {
    throw new Error('keystone-next build must be run before running keystone-next start');
  }
  const config = initConfig(require(apiFile).config);
  const { keystone, graphQLSchema, createContext } = createSystem(config, dotKeystonePath, 'start');

  console.log('✨ Connecting to the database');
  await keystone.connect({ context: (await createContext()).sudo() });

  console.log('✨ Creating server');
  const server = await createExpressServer(
    config,
    graphQLSchema,
    createContext,
    false,
    projectAdminPath
  );
  if (config.ui?.isDisabled) {
    console.log(`👋 GraphQL API ready`);
  } else {
    console.log(`👋 Admin UI and GraphQL API ready`);
  }

  const port = config.server?.port || process.env.PORT || 3000;
  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Server Ready on http://localhost:${port}`);
  });
};
