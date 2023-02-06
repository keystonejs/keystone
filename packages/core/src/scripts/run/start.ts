import type { ListenOptions } from 'net';
import * as fs from 'fs-extra';
import { createSystem } from '../../lib/createSystem';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { createAdminUIMiddleware } from '../../lib/server/createAdminUIMiddleware';
import { requirePrismaClient } from '../../artifacts';
import { ExitError, getAdminPath, getBuiltConfigPath } from '../utils';
import { loadBuiltConfig } from '../../lib/config/loadConfig';
import { Flags } from '../cli';
import { deployMigrations } from '../../lib/migrations';

export const start = async (cwd: string, { ui, withMigrations }: Flags) => {
  console.log('✨ Starting Keystone');

  // This is the compiled version of the configuration which was generated during the build step
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
  if (withMigrations) {
    console.log('✨ Applying database migrations');
    await deployMigrations(config.db.url);
  }

  console.log('✨ Creating server');
  const { expressServer, httpServer } = await createExpressServer(
    config,
    graphQLSchema,
    keystone.context
  );

  console.log(`✅ GraphQL API ready`);
  if (!config.ui?.isDisabled || !ui) {
    console.log('✨ Preparing Admin UI Next.js app');
    expressServer.use(
      await createAdminUIMiddleware(config, keystone.context, false, getAdminPath(cwd))
    );
    console.log(`✅ Admin UI ready`);
  }

  const httpOptions: ListenOptions = { port: 3000 };
  if (config?.server && 'port' in config.server) {
    httpOptions.port = config.server.port;
  }

  if (config?.server && 'options' in config.server && config.server.options) {
    Object.assign(httpOptions, config.server.options);
  }

  // preference env.PORT if supplied
  if ('PORT' in process.env) {
    httpOptions.port = parseInt(process.env.PORT || '');
  }

  // preference env.HOST if supplied
  if ('HOST' in process.env) {
    httpOptions.host = process.env.HOST || '';
  }

  httpServer.listen(httpOptions, (err?: any) => {
    if (err) throw err;

    const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
      ? 'localhost'
      : httpOptions.host;
    console.log(
      `⭐️ Server listening on ${httpOptions.host || ''}:${httpOptions.port} (http://${easyHost}:${
        httpOptions.port
      }/)`
    );
  });
};
