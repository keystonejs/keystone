import path from 'path';
import express from 'express';
import { printSchema } from 'graphql';
import * as fs from 'fs-extra';
import { createSystem } from '../lib/createSystem';
import { requireSource } from '../lib/requireSource';
import { formatSource, generateAdminUI } from '../lib/generateAdminUI';
import { createExpressServer } from '../lib/createExpressServer';
import { printGeneratedTypes } from './schema-type-printer';

// TODO: Read port from config or process args
const PORT = process.env.PORT || 3000;

// TODO: Don't generate or start an Admin UI if it isn't configured!!

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'src',
  'static',
  'dev-loading.html'
);

const applyPlugins = (config: KeystoneConfig): KeystoneConfig => {
  const { plugins = [] } = config;
  for (plugin of plugins) {
    config = pluging(config);
  }
  return config;
};

export const dev = async () => {
  console.log('🤞 Starting Keystone');

  let expressServer: null | ReturnType<typeof express> = null;

  const initKeystone = async () => {
    const config = applyPlugins(requireSource(path.join(process.cwd(), 'keystone')).default);
    const system = createSystem(config);

    // NOTE: Steps A, B, C and D could are orthogonal and could be combined in a
    // single Promise.all().
    console.log('✨ Generating Schema');
    const printedSchema = printSchema(system.graphQLSchema);
    await fs.outputFile('./.keystone/schema.graphql', printedSchema); // A

    await fs.outputFile(
      './.keystone/schema-types.ts',
      formatSource(printGeneratedTypes(printedSchema, system), 'babel-ts')
    ); // B

    console.log('✨ Connecting to DB');
    await system.keystone.connect(); // C

    console.log('✨ Connecting to the Database');
    await system.keystone.connect();

    console.log('✨ Generating Admin UI');
    await generateAdminUI(config, system, process.cwd()); // D

    expressServer = await createExpressServer(config.ui, system);

    console.log(`👋 Admin UI Ready`);
  };

  const coreServer = express();
  coreServer.use('/__keystone_dev_status', (req, res) => {
    res.json({ ready: expressServer ? true : false });
  });
  coreServer.use((req, res, next) => {
    if (expressServer) return expressServer(req, res, next);
    res.sendFile(devLoadingHTMLFilepath);
  });

  coreServer.listen(PORT, (err?: any) => {
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
