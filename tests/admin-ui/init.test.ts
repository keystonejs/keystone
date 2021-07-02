// @ts-nocheck

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const { chromium } = require('playwright');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { setupAdminUITestEnv } = require('@keystone-next/testing');
const { password, text } = require('@keystone-next/fields');

// We'll need these once we add types back in. We removed types so we could initially validate
// the process works via node
// const { KeystoneConfig, DatabaseProvider } = require('@keystone-next/types');

dotenv.config({ path: './tests/admin-ui/.env' });

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things, so we don't
// export it from the `@keystone-next/testing` package.

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'static',
  'dev-loading.html'
);
const apiTestConfig = config => ({
  ...config,
  db: {
    ...config.db,
    provider: process.env.TEST_ADAPTER,
    url: process.env.DATABASE_URL,
  },
});

function setupTestRunner(config) {
  const app = express();
  // initialise variable to reference express server
  let expressServer;
  // initialize variable to reference disconnect function
  let globaldisconnect;
  let context;

  // set up closure for initialize keystone
  const initKeystone = async () => {
    // call setupAdminUITestEnv to
    // generate the necessary keystone context
    // ADMIN UI
    // and admin ui server
    const {
      connect,
      expressServer: keystoneExpressServer,
      disconnect,
      testArgs: { context: keystoneContext },
    } = await setupAdminUITestEnv(config);
    context = keystoneContext;
    console.log('✨ Connecting to the database');
    await connect();
    // attach keystoneExpressServer to reference
    expressServer = keystoneExpressServer;
    // attach disconnect function to reference
    return { context, disconnect };
    // connect keystone
  };

  app.use((req, res, next) => {
    if (expressServer) {
      return expressServer(req, res, next);
    }
    res.sendFile(devLoadingHTMLFilepath);
  });

  return { globaldisconnect, context, app, initKeystone };
}

describe('initial test', () => {
  var server;
  // var keystoneCtx;
  var globalDisconnect;
  beforeAll(async () => {
    const { initKeystone, app } = setupTestRunner({
      config: apiTestConfig({
        lists: createSchema({
          User: list({
            fields: {
              name: text(),
              email: text(),
              password: password(),
            },
          }),
        }),
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disconnect, context } = await initKeystone();
    // keystoneCtx = context;
    server = app.listen(3000, () => {});
    globalDisconnect = () => disconnect();
  });

  afterAll(async () => {
    await new Promise(resolve => {
      server.close(async () => {
        try {
          await globalDisconnect();
        } catch (e) {
          console.log('ERROR', e);
        }
        resolve();
      });
    });
  });

  it('should run without a problem', async () => {
    // TODO await keystone setup;
    const browser = await chromium.launch({ headless: false });
    // await keystoneCtx.lists.User.createOne({
    //   data: { name: 'Test User', email: 'test@te', password: 'password' },
    // });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    expect(true).toBe(true);
    await browser.close();

    // await connect();

    // await browser.close();
  });
});
