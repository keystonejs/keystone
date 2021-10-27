import path from 'path';
import * as fs from 'fs-extra';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { createAdminUIMiddleware } from '../../lib/server/createAdminUIMiddleware';
import { requirePrismaClient } from '../../artifacts';
import { ExitError, getAdminPath } from '../utils';

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
  const { getKeystone, graphQLSchema } = createSystem(config);

  const prismaClient = requirePrismaClient(cwd);

  const keystone = getKeystone(prismaClient);

  console.log('✨ Connecting to the database');
  await keystone.connect();

  console.log('✨ Creating server');
  const { expressServer } = await createExpressServer(
    config,
    graphQLSchema,
    keystone.createContext
  );
  console.log(`✅ GraphQL API ready`);
  if (!config.ui?.isDisabled) {
    console.log('✨ Preparing Admin UI Next.js app');
    expressServer.use(
      await createAdminUIMiddleware(config, keystone.createContext, false, getAdminPath(cwd))
    );
    console.log(`✅ Admin UI ready`);
  }

  const port = config.server?.port || process.env.PORT || 3000;
  expressServer.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Server Ready on http://localhost:${port}`);
  });
};
