import path from 'path';
import express from 'express';
import { printSchema } from 'graphql';
import * as fs from 'fs-extra';
import prettier from 'prettier';
import { generateAdminUI } from '@keystone-next/admin-ui/system';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { createExpressServer } from '../lib/createExpressServer';
import { printGeneratedTypes } from './schema-type-printer';

// TODO: Read config path from process args
const CONFIG_PATH = path.join(process.cwd(), 'keystone');

// TODO: Read port from config or process args
const PORT = process.env.PORT || 3000;

// TODO: Don't generate or start an Admin UI if it isn't configured!!
const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'src',
  'static',
  'dev-loading.html'
);

export const formatSource = (src: string, parser: 'babel' | 'babel-ts' = 'babel') =>
  prettier.format(src, {
    parser,
    trailingComma: 'es5',
    singleQuote: true,
  });

export const dev = async () => {
  console.log('🤞 Starting Keystone');

  const server = express();
  let expressServer: null | ReturnType<typeof express> = null;

  const initKeystone = async () => {
    const config = initConfig(requireSource(CONFIG_PATH).default);

    const system = createSystem(config);
    let printedSchema = printSchema(system.graphQLSchema);
    console.log('✨ Generating Schema');
    await fs.outputFile('./.keystone/schema.graphql', printedSchema);
    await fs.outputFile(
      './.keystone/schema-types.ts',
      formatSource(printGeneratedTypes(printedSchema, system), 'babel-ts')
    );

    console.log('✨ Connecting to the Database');
    await system.keystone.connect();

    console.log('✨ Generating Admin UI');
    await generateAdminUI(config, system);

    expressServer = await createExpressServer(config, system);
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
