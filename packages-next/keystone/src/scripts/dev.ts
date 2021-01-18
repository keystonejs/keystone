import path from 'path';
import express from 'express';
import { generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { createExpressServer } from '../lib/createExpressServer';
import { saveSchemaAndTypes } from '../lib/saveSchemaAndTypes';
import { CONFIG_PATH, PORT } from './utils';

import type { StaticPaths } from './';

// TODO: Don't generate or start an Admin UI if it isn't configured!!
const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'src',
  'static',
  'dev-loading.html'
);

export const dev = async ({ dotKeystonePath, projectAdminPath }: StaticPaths) => {
  console.log('🤞 Starting Keystone');

  const server = express();
  let expressServer: null | ReturnType<typeof express> = null;

  const initKeystone = async () => {
    const config = initConfig(requireSource(CONFIG_PATH).default);
    const { keystone, graphQLSchema, createContext } = createSystem(config, dotKeystonePath);

    console.log('✨ Generating Schema');
    await saveSchemaAndTypes(graphQLSchema, keystone, dotKeystonePath);

    console.log('✨ Connecting to the Database');
    await keystone.connect({ context: createContext({ skipAccessControl: true }) });

    console.log('✨ Generating Admin UI');
    await generateAdminUI(config, graphQLSchema, keystone, projectAdminPath);

    expressServer = await createExpressServer(
      config,
      graphQLSchema,
      createContext,
      true,
      projectAdminPath
    );
    console.log(`👋 Admin UI Ready`);
  };

  server.use('/__keystone_dev_status', (req, res) => {
    res.json({ ready: expressServer ? true : false });
  });
  server.use((req, res, next) => {
    if (expressServer) return expressServer(req, res, next);
    res.sendFile(devLoadingHTMLFilepath);
  });
  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Dev Server Ready on http://localhost:${PORT}`);
    // Don't start initialising Keystone until the dev server is ready,
    // otherwise it slows down the first response significantly
    initKeystone().catch(err => {
      console.error(`🚨 There was an error initialising Keystone`);
      console.error(err);
      process.exit(1);
    });
  });
};
