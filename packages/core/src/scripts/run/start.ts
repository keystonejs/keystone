import type { ListenOptions } from 'net';
import * as fs from 'fs-extra';
import { createSystem } from '../../lib/createSystem';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { createAdminUIMiddleware } from '../../lib/server/createAdminUIMiddleware';
import { getBuiltKeystoneConfigurationPath, getSystemPaths } from '../../artifacts';
import { ExitError } from '../utils';
import { loadBuiltConfig } from '../../lib/config/loadConfig';
import { Flags } from '../cli';
import { deployMigrations } from '../../lib/migrations';

export const start = async (
  cwd: string,
  { ui, withMigrations }: Pick<Flags, 'ui' | 'withMigrations'>
) => {
  console.log('✨ Starting Keystone');

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd);

  // This is the compiled version of the configuration which was generated during the build step
  if (!fs.existsSync(builtConfigPath)) {
    console.log('🚨 keystone build must be run before running keystone start');
    throw new ExitError(1);
  }

  const config = loadBuiltConfig(builtConfigPath);
  const paths = getSystemPaths(cwd, config);
  const { getKeystone, graphQLSchema } = createSystem(config);
  const prismaClient = require(paths.prisma);
  const keystone = getKeystone(prismaClient);

  console.log('✨ Connecting to the database');
  await keystone.connect();
  if (withMigrations) {
    console.log('✨ Applying database migrations');
    await deployMigrations(paths.schema.prisma, config.db.url);
  }

  console.log('✨ Creating server');
  const { expressServer, httpServer } = await createExpressServer(
    config,
    graphQLSchema,
    keystone.context
  );

  console.log(`✅ GraphQL API ready`);
  if (!config.ui?.isDisabled || ui) {
    console.log('✨ Preparing Admin UI Next.js app');
    expressServer.use(await createAdminUIMiddleware(config, keystone.context, false, paths.admin));
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
