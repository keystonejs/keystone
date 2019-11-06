const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');
const cuid = require('cuid');

const setupList = (adapterName, fields) =>
  setupServer({
    name: `ks5-testdb-${cuid()}`,
    adapterName,
    createLists: keystone => {
      keystone.createList('User', { fields });
    },
  });

describe('defaultValue field config', () => {
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      it('Has no default by default', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: null,
              });
            })
        )();
      });

      it('Sets undefined as a default', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue: undefined },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: null,
              });
            })
        )();
      });

      it('Sets null as a default', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue: null },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: null,
              });
            })
        )();
      });

      it('Sets a scalar as a default', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue: 'hello' },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: 'hello',
              });
            })
        )();
      });

      it('executes a function to get default', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue: () => 'foobar' },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: 'foobar',
              });
            })
        )();
      });

      it('handles promises returned from function', () => {
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue: () => Promise.resolve('zippity') },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(data.createUser).toMatchObject({
                name: 'zippity',
              });
            })
        )();
      });

      it('executes the function with the correct parameters', () => {
        const defaultValue = jest.fn();
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: {} ) { name } }`,
            }).then(({ errors }) => {
              expect(errors).toBe(undefined);
              expect(defaultValue).toHaveBeenCalledTimes(1);
              expect(defaultValue).toHaveBeenCalledWith(
                expect.objectContaining({
                  existingItem: undefined,
                  context: expect.any(Object),
                  originalInput: expect.any(Object),
                  actions: expect.any(Object),
                })
              );
            })
        )();
      });

      it('passes the originalInput', () => {
        const defaultValue = jest.fn(({ originalInput }) => `${originalInput.salutation} X`);
        return runner(
          () =>
            setupList(adapterName, {
              name: { type: Text, defaultValue },
              salutation: { type: Text },
            }),
          ({ keystone }) =>
            graphqlRequest({
              keystone,
              query: `mutation { createUser(data: { salutation: "Doctor" } ) { name } }`,
            }).then(({ data, errors }) => {
              expect(errors).toBe(undefined);
              expect(defaultValue).toHaveBeenCalledTimes(1);
              expect(defaultValue).toHaveBeenCalledWith(
                expect.objectContaining({
                  existingItem: undefined,
                  context: expect.any(Object),
                  originalInput: {
                    salutation: 'Doctor',
                  },
                  actions: expect.any(Object),
                })
              );
              expect(data.createUser).toMatchObject({
                name: 'Doctor X',
              });
            })
        )();
      });
    })
  );
});
