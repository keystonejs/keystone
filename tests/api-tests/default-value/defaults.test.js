const { createItem } = require('@keystonejs/server-side-graphql-client');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');

const setupList = (adapterName, fields) => () =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', { fields });
    },
  });

describe('defaultValue field config', () => {
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      test(
        'Has no default by default',
        runner(setupList(adapterName, { name: { type: Text } }), async ({ keystone }) => {
          const listKey = 'User';
          const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
          expect(result).toMatchObject({ name: null });
        })
      );

      test(
        'Sets undefined as a default',
        runner(
          setupList(adapterName, { name: { type: Text, defaultValue: undefined } }),
          async ({ keystone }) => {
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: null });
          }
        )
      );

      test(
        'Sets null as a default',
        runner(
          setupList(adapterName, { name: { type: Text, defaultValue: null } }),
          async ({ keystone }) => {
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: null });
          }
        )
      );

      test(
        'Sets a scalar as a default',
        runner(
          setupList(adapterName, { name: { type: Text, defaultValue: 'hello' } }),
          async ({ keystone }) => {
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'hello' });
          }
        )
      );

      test(
        'executes a function to get default',
        runner(
          setupList(adapterName, { name: { type: Text, defaultValue: () => 'foobar' } }),
          async ({ keystone }) => {
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'foobar' });
          }
        )
      );

      test(
        'handles promises returned from function',
        runner(
          setupList(adapterName, {
            name: { type: Text, defaultValue: () => Promise.resolve('zippity') },
          }),
          async ({ keystone }) => {
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'zippity' });
          }
        )
      );

      test('executes the function with the correct parameters', () => {
        const defaultValue = jest.fn();
        return runner(
          setupList(adapterName, { name: { type: Text, defaultValue } }),
          async ({ keystone }) => {
            await createItem({ keystone, listKey: 'User', item: {} });
            expect(defaultValue).toHaveBeenCalledTimes(1);
            expect(defaultValue).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.any(Object),
                originalInput: expect.any(Object),
              })
            );
          }
        )();
      });

      test('passes the originalInput', () => {
        const defaultValue = jest.fn(({ originalInput }) => `${originalInput.salutation} X`);
        return runner(
          setupList(adapterName, {
            name: { type: Text, defaultValue },
            salutation: { type: Text },
          }),
          async ({ keystone }) => {
            const item = { salutation: 'Doctor' };
            const listKey = 'User';
            const result = await createItem({ keystone, listKey, item, returnFields: 'name' });
            expect(defaultValue).toHaveBeenCalledTimes(1);
            expect(defaultValue).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.any(Object),
                originalInput: { salutation: 'Doctor' },
              })
            );
            expect(result).toMatchObject({ name: 'Doctor X' });
          }
        )();
      });
    })
  );
});
