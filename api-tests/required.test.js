const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer } = require('@keystone-alpha/test-utils');
const { Text } = require('@keystone-alpha/fields');

const SCHEMA_NAME = 'testing';

function graphqlRequest({ keystone, query }) {
  return keystone._graphQLQuery[SCHEMA_NAME](query, keystone.getAccessContext(SCHEMA_NAME, {}));
}

describe('Test isRequired flag for all field types', () => {
  const typesLoc = path.resolve('packages/fields/src/types');
  const testModules = fs
    .readdirSync(typesLoc)
    .map(name => `${typesLoc}/${name}/filterTests.js`)
    .filter(filename => fs.existsSync(filename));
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      testModules.map(require).forEach(mod => {
        describe(`Test isRequired flag for module: ${mod.name}`, () => {
          const type = mod.type;
          const listName = 'Test';
          const keystoneTestWrapper = (testFn = () => {}) =>
            runner(
              () =>
                setupServer({
                  name: `Field tests for ${type.type} ${cuid}`,
                  adapterName,
                  createLists: keystone => {
                    if (type.type === 'Select') {
                      keystone.createList(listName, {
                        fields: {
                          name: { type: Text },
                          testField: {
                            type,
                            isRequired: true,
                            options: [
                              { label: 'Thinkmill', value: 'thinkmill' },
                              { label: 'Atlassian', value: 'atlassian' },
                            ],
                          },
                        },
                      });
                    } else {
                      keystone.createList(listName, {
                        fields: {
                          name: { type: Text },
                          testField: { type, isRequired: true },
                        },
                      });
                    }
                  },
                }),
              async ({ keystone, ...rest }) => testFn({ keystone, adapterName, ...rest })
            );
          test(
            'Create an object without the required field',
            keystoneTestWrapper(({ keystone }) => {
              return graphqlRequest({
                keystone,
                query: `mutation { createTest(data: { name: "test entry" } ) { id name } }`,
              }).then(({ data, errors }) => {
                expect(data.createTest).toBe(null);
                expect(errors).not.toBe(null);
                expect(errors.length).toEqual(1);
                expect(errors[0].message).toEqual('You attempted to perform an invalid mutation');
                expect(errors[0].path[0]).toEqual('createTest');
              });
            })
          );
          test(
            'Update an object with the required field having a null value',
            keystoneTestWrapper(({ keystone }) => {
              return graphqlRequest({
                keystone,
                query: `mutation { createTest(data: { name: "test entry", testField: ${mod.exampleValue} } ) { id name } }`,
              }).then(({ data }) => {
                return graphqlRequest({
                  keystone,
                  query: `mutation { updateTest(id: "${data.createTest.id}" data: { name: "updated test entry", testField: null } ) { id name } }`,
                }).then(({ data, errors }) => {
                  expect(data.updateTest).toBe(null);
                  expect(errors).not.toBe(undefined);
                  expect(errors.length).toEqual(1);
                  expect(errors[0].message).toEqual('You attempted to perform an invalid mutation');
                  expect(errors[0].path[0]).toEqual('updateTest');
                });
              });
            })
          );
          test(
            'Update an object without the required field',
            keystoneTestWrapper(({ keystone }) => {
              return graphqlRequest({
                keystone,
                query: `mutation { createTest(data: { name: "test entry", testField: ${mod.exampleValue} } ) { id name } }`,
              }).then(({ data }) => {
                return graphqlRequest({
                  keystone,
                  query: `mutation { updateTest(id: "${data.createTest.id}" data: { name: "updated test entry" } ) { id name } }`,
                }).then(({ data, errors }) => {
                  expect(data.updateTest).not.toBe(null);
                  expect(errors).toBe(undefined);
                });
              });
            })
          );
        });
      });
    })
  );
});
