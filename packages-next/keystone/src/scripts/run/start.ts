import path from 'path';
import * as fs from 'fs-extra';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { ExitError, getAdminPath } from '../utils';
import { requirePrismaClient } from '../../artifacts';

export const start = async (cwd: string) => {
  console.log('✨ Starting Keystone');

  // This is the compiled version of the configuration which was generated during the build step.
  // See reexportKeystoneConfig().
  const apiFile = path.join(getAdminPath(cwd), '.next/server/pages/api/__keystone_api_build.js');
  if (!fs.existsSync(apiFile)) {
    console.log('🚨 keystone-next build must be run before running keystone-next start');
    throw new ExitError(1);
  }
  const config = initConfig(require(apiFile).config);
  const { keystone, graphQLSchema, createContext } = createSystem(config, requirePrismaClient(cwd));

  console.log('✨ Connecting to the database');
  await keystone.connect({ context: createContext().sudo() });

  console.log('✨ Creating server');
  const server = await createExpressServer(
    config,
    graphQLSchema,
    createContext,
    false,
    getAdminPath(cwd)
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
