const { Text, Password } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { logging } = require('@keystonejs/list-plugins');
const {
  createItem,
  updateItem,
  deleteItem,
  runCustomQuery,
} = require('@keystonejs/server-side-graphql-client');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone._logFunction = jest.fn();
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          other: { type: Text },
          password: { type: Password },
        },
        plugins: [logging(keystone._logFunction)],
      });
      keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        config: {
          identityField: 'name',
          secretField: 'password',
        },
        plugins: [logging(keystone._logFunction)],
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'Logging Hooks: create',
      runner(setupKeystone, async ({ keystone }) => {
        const context = keystone.createContext({
          authentication: { item: { foo: 'bar' }, listKey: 'Other' },
        });
        await createItem({ context, listKey: 'User', item: { name: 'test' } });
        expect(keystone._logFunction).toHaveBeenCalledWith({
          operation: 'create',
          authedItem: { foo: 'bar' },
          authedListKey: 'Other',
          listKey: 'User',
          originalInput: { name: 'test' },
          createdItem: expect.objectContaining({ name: 'test' }),
        });
      })
    );

    test(
      'Logging Hooks: update',
      runner(setupKeystone, async ({ keystone }) => {
        const context = keystone.createContext({
          authentication: { item: { foo: 'bar' }, listKey: 'Other' },
        });
        const { id } = await createItem({
          context,
          listKey: 'User',
          item: { name: 'test', other: 'bar' },
        });
        await updateItem({ context, listKey: 'User', item: { id, data: { name: 'something' } } });
        expect(keystone._logFunction).toHaveBeenNthCalledWith(2, {
          operation: 'update',
          authedItem: { foo: 'bar' },
          authedListKey: 'Other',
          listKey: 'User',
          originalInput: { name: 'something' },
          changedItem: expect.objectContaining({ name: 'something' }),
        });
      })
    );

    test(
      'Logging Hooks: delete',
      runner(setupKeystone, async ({ keystone }) => {
        const context = keystone.createContext({
          authentication: { item: { foo: 'bar' }, listKey: 'Other' },
        });
        const { id } = await createItem({
          context,
          listKey: 'User',
          item: { name: 'test', other: 'bar' },
        });
        await deleteItem({ context, listKey: 'User', itemId: id });
        expect(keystone._logFunction).toHaveBeenNthCalledWith(2, {
          operation: 'delete',
          authedItem: { foo: 'bar' },
          authedListKey: 'Other',
          listKey: 'User',
          deletedItem: expect.objectContaining({ name: 'test', other: 'bar' }),
        });
      })
    );

    test(
      'Logging Hooks: auth',
      runner(setupKeystone, async ({ keystone }) => {
        const context = keystone.createContext({});
        context.startAuthedSession = () => 't0k3n';
        await createItem({
          context,
          listKey: 'User',
          item: { name: 'test', password: 't3sting!' },
        });
        await runCustomQuery({
          context,
          query: `mutation m($name: String, $password: String) {
            authenticateUserWithPassword(name: $name, password: $password) { token item { id } }
          }`,
          variables: { name: 'test', password: 't3sting!' },
        });
        expect(keystone._logFunction).toHaveBeenNthCalledWith(2, {
          operation: 'authenticate',
          authedItem: undefined,
          authedListKey: undefined,
          listKey: 'User',
          item: expect.objectContaining({ name: 'test' }),
          success: true,
          message: 'Authentication successful',
          token: 't0k3n',
        });
      })
    );

    test(
      'Logging Hooks: unauth',
      runner(setupKeystone, async ({ keystone }) => {
        const context = keystone.createContext();
        context.startAuthedSession = () => 't0k3n';
        await createItem({
          context,
          listKey: 'User',
          item: { name: 'test', password: 't3sting!' },
        });
        await runCustomQuery({
          context,
          query: `mutation m($name: String, $password: String) {
            authenticateUserWithPassword(name: $name, password: $password) { token item { id } }
          }`,
          variables: { name: 'test', password: 't3sting!' },
        });

        const _context = keystone.createContext({
          authentication: { item: { foo: 'bar' }, listKey: 'Other' },
        });
        _context.endAuthedSession = () => ({ success: true, listKey: 'Foo', itemId: 'X' });
        await runCustomQuery({
          context: _context,
          query: `mutation  {
            unauthenticateUser{ success }
          }`,
        });

        expect(keystone._logFunction).toHaveBeenNthCalledWith(3, {
          operation: 'unauthenticate',
          authedItem: { foo: 'bar' },
          authedListKey: 'Other',
          listKey: 'Foo',
          itemId: 'X',
        });
      })
    );
  })
);
