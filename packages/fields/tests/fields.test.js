const path = require('path');
const cuid = require('cuid');
const globby = require('globby');
const { multiAdapterRunners, setupServer } = require('@voussoir/test-utils');

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('Test CRUD for all fields', () => {
  const typesLoc = path.resolve('packages/fields/types');
  const testModules = globby.sync(`${typesLoc}/*Field/filterTests.js`);
  testModules.push(path.resolve(`${__dirname}/idFilterTests.js`));

  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      testModules.map(require).forEach(mod => {
        describe(`All the CRUD tests for module: ${mod.name}`, () => {
          const listName = 'test';
          const keystoneTestWrapper = (testFn = () => {}) =>
            runner(
              () => {
                const name = `Field tests for ${mod.name} ${cuid}`;
                const createLists = keystone => {
                  // Create a list with all the fields required for testing
                  const fields = mod.getTestFields();

                  keystone.createList(listName, { fields });
                };
                return setupServer({ name, adapterName, createLists });
              },
              async ({ server, ...rest }) => {
                // Populate the database before running the tests
                await server.keystone.createItems({ [listName]: mod.initItems() });

                return testFn({ server, adapterName, ...rest });
              }
            );

          mod.filterTests(keystoneTestWrapper);
        });
      });
    })
  );
});
