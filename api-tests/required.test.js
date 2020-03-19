const cuid = require('cuid');
const globby = require('globby');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');

describe('Test isRequired flag for all field types', () => {
  const testModules = globby.sync(`packages/fields/src/types/**/test-fixtures.js`, {
    absolute: true,
  });
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
                  name: `Field tests for ${type.type} ${cuid()}`,
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
