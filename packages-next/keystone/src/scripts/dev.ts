import express from 'express';
import { printSchema } from 'graphql';
import * as fs from 'fs-extra';
import path from 'path';
import { initKeystoneFromConfig } from '../lib/initKeystoneFromConfig';
import { formatSource, generateAdminUI } from '../lib/generateAdminUI';
import { createAdminUIServer } from '../lib/createAdminUIServer';
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

export const dev = async () => {
  console.log('🤞 Starting Keystone');

  const server = express();
  let adminUIServer: null | ReturnType<typeof express> = null;

  const initKeystone = async () => {
    const keystone = initKeystoneFromConfig();
    let printedSchema = printSchema(keystone.graphQLSchema);
    console.log('✨ Generating Schema');
    await fs.outputFile('./.keystone/schema.graphql', printedSchema);
    await fs.outputFile(
      './.keystone/schema-types.ts',
      formatSource(printGeneratedTypes(printedSchema, keystone), 'babel-ts')
    );

    console.log('✨ Generating Admin UI');
    await generateAdminUI(keystone, process.cwd());

    adminUIServer = await createAdminUIServer(keystone);
    console.log(`👋 Admin UI Ready`);
  };

  server.use('/__keystone_dev_status', (req, res) => {
    res.json({ ready: adminUIServer ? true : false });
  });
  server.use((req, res, next) => {
    if (adminUIServer) return adminUIServer(req, res, next);
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
