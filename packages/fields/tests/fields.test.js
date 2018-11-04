/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const { graphqlRequest, keystoneMongoTest } = require('@voussoir/test-utils');

const Keystone = require('../../core/Keystone');
const WebServer = require('../../server/WebServer');
const { MongooseAdapter } = require('../../adapter-mongoose');

const sorted = (arr, keyFn) => {
  arr = [...arr];
  arr.sort((a, b) => {
    a = keyFn(a);
    b = keyFn(b);
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  return arr;
};

export const runQuery = (server, snippet) => {
  return graphqlRequest({
    server,
    query: `query { ${snippet} }`,
  }).then(res => res.body.data);
};

export const matchFilter = (server, gqlArgs, fields, target, sortkey) => {
  gqlArgs = gqlArgs ? `(${gqlArgs})` : '';
  const snippet = `allTests ${gqlArgs} ${fields}`;
  return runQuery(server, snippet).then(data => {
    const value = sortkey ? sorted(data.allTests || [], i => i[sortkey]) : data.allTests;
    expect(value).toEqual(target);
  });
};

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('Test CRUD for all fields', () => {
  const typesLoc = path.resolve('packages/fields/types');
  const testModules = fs
    .readdirSync(typesLoc)
    .map(name => `${typesLoc}/${name}/filterTests.js`)
    .filter(filename => fs.existsSync(filename));

  testModules.push(path.resolve('packages/fields/tests/idFilterTests.js'));
  testModules.map(require).forEach(mod => {
    describe(`All the CRUD tests for module: ${mod.name}`, () => {
      const listName = 'test';
      const keystoneTestWrapper = (testFn = () => {}) =>
        keystoneMongoTest(
          () => {
            // Set up a keystone project for each type test to use
            const keystone = new Keystone({
              adapter: new MongooseAdapter(),
              name: `Field tests for ${mod.name} ${cuid}`,
            });

            // Create a list with all the fields required for testing
            const fields = mod.getTestFields();

            const labelResolver = item => item;

            keystone.createList(listName, { fields, labelResolver });

            // Set up a server (but do not .listen(), we will use supertest to access the app)
            const server = new WebServer(keystone, {
              'cookie secret': 'qwerty',
              session: false,
            });

            return { server, keystone };
          },
          async ({ server, ...rest }) => {
            // Populate the database before running the tests
            await server.keystone.createItems({ [listName]: mod.initItems() });

            return testFn({ server, ...rest });
          }
        );

      mod.filterTests(keystoneTestWrapper);
    });
  });
});
