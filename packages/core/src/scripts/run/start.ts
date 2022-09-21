import type { ListenOptions } from 'net';
import * as fs from 'fs-extra';
import { createSystem } from '../../lib/createSystem';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { createAdminUIMiddleware } from '../../lib/server/createAdminUIMiddleware';
import { requirePrismaClient } from '../../artifacts';
import { ExitError, getAdminPath, getBuiltConfigPath } from '../utils';
import { loadBuiltConfig } from '../../lib/config/loadConfig';

export const start = async (cwd: string) => {
  console.log('✨ Starting Keystone');

  // This is the compiled version of the configuration which was generated during the build step.
  const apiFile = getBuiltConfigPath(cwd);
  if (!fs.existsSync(apiFile)) {
    console.log('🚨 keystone build must be run before running keystone start');
    throw new ExitError(1);
  }
  const config = loadBuiltConfig(cwd);
  const { getKeystone, graphQLSchema } = createSystem(config);

  const prismaClient = requirePrismaClient(cwd);

  const keystone = getKeystone(prismaClient);

  console.log('✨ Connecting to the database');
  await keystone.connect();

  console.log('✨ Creating server');
  const { expressServer, httpServer } = await createExpressServer(
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

  const options: ListenOptions = {
    port: 3000,
  };

  if (config?.server && 'port' in config.server) {
    options.port = config.server.port;
  }

  if (config?.server && 'options' in config.server && config.server.options) {
    Object.assign(options, config.server.options);
  }

  // preference env.PORT if supplied
  if ('PORT' in process.env) {
    options.port = parseInt(process.env.PORT || '');
  }

  httpServer.listen(options, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Server Ready on http://localhost:${options.port}`);
  });
};
