const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Password } = require('@keystonejs/fields');
const { createItem } = require('@keystonejs/server-side-graphql-client');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const superagent = require('superagent');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          email: { type: Text },
          password: { type: Password },
        },
      });

      keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        hooks: {
          resolveAuthInput: ({ context, operation, originalInput }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('authenticate');

            if (originalInput.email === 'triggerBadResolve') {
              return undefined;
            }
            if (originalInput.email === 'fixOnResolve') {
              return { email: 'test@example.com', password: 'testing123' };
            }
            return originalInput;
          },
          validateAuthInput: ({
            resolvedData,
            context,
            originalInput,
            operation,
            addValidationError,
          }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('authenticate');
            expect(originalInput).not.toBe(undefined);
            if (resolvedData.email === 'invalid') {
              addValidationError('INVALID EMAIL');
            }
          },
          beforeAuth: ({ resolvedData, context, originalInput, operation }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('authenticate');
            expect(resolvedData.email).not.toBe(undefined);
            expect(resolvedData.password).not.toBe(undefined);
            expect(originalInput).not.toBe(undefined);
          },
          afterAuth: ({
            resolvedData,
            context,
            operation,
            originalInput,
            item,
            success,
            message,
            token,
          }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('authenticate');
            expect(originalInput).not.toBe(undefined);
            if (resolvedData.email === 'test@example.com') {
              expect(item.id).not.toBe(undefined);
              expect(success).toEqual(true);
              expect(token).not.toBe(undefined);
              expect(message).toEqual('Authentication successful');
            } else {
              expect(item).toBe(null);
              expect(success).toBe(false);
              expect(token).not.toBe(undefined);
              expect(message).toEqual('Authentication successful');
            }
          },
          beforeUnauth: ({ operation, context }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('unauthenticate');
          },
          afterUnauth: ({ operation, context, listKey, itemId }) => {
            expect(context).not.toBe(undefined);
            expect(operation).toEqual('unauthenticate');
            expect(listKey).toEqual('User');
            expect(itemId).not.toBe(undefined);
          },
        },
      });
    },
  });
}

const runTestInServer = async (app, testFn) => {
  const server = app.listen(0);
  try {
    const _runQuery = async (query, agent) => {
      const { port } = server.address();
      const url = `http://localhost:${port}/admin/api`;
      agent = agent || superagent.agent();
      const { res } = await agent.post(url).set('Accept', 'application/json').send({ query });
      // console.log(res);
      const result = JSON.parse(res.text);
      return { agent, data: result.data, errors: result.errors };
    };

    await testFn(_runQuery);
  } finally {
    server.close();
  }
};

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Auth Hooks', () => {
      test(
        'Auth/unauth with valid creds',
        runner(setupKeystone, async ({ app, keystone }) => {
          // Add a user with a password
          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { name: 'test', email: 'test@example.com', password: 'testing123' },
          });

          await runTestInServer(app, async _runQuery => {
            // Attempt to authenticate with valid creds
            const { agent, data, errors } = await _runQuery(`
            mutation {
              authenticateUserWithPassword(email: "test@example.com", password: "testing123") {
                token
                item { id }
              }
            }`);
            expect(errors).toBe(undefined);
            const { authenticateUserWithPassword } = data;
            expect(authenticateUserWithPassword).not.toBe(null);
            expect(authenticateUserWithPassword.token).not.toBe(undefined);
            expect(authenticateUserWithPassword.item).not.toBe(undefined);
            expect(authenticateUserWithPassword.item.id).toEqual(user.id);

            // Unauthenticate
            const { data: data_, errors: errors_ } = await _runQuery(
              `mutation { unauthenticateUser { success } }`,
              agent
            );
            expect(errors_).toBe(undefined);
            const { unauthenticateUser } = data_;
            expect(unauthenticateUser).not.toBe(null);
            expect(unauthenticateUser.success).toBe(true);
          });
        })
      );
      test(
        'Auth with bad resolveAuthInput return value',
        runner(setupKeystone, async ({ app, keystone }) => {
          // Add a user with a password
          await createItem({
            keystone,
            listKey: 'User',
            item: { name: 'test', email: 'test@example.com', password: 'testing123' },
          });

          await runTestInServer(app, async _runQuery => {
            // Attempt to authenticate with special creds that cause bad data to be returned
            const { data, errors } = await _runQuery(`
            mutation {
                authenticateUserWithPassword(email: "triggerBadResolve", password: "testing123") {
                  token
                  item { id }
                }
              }`);
            const { authenticateUserWithPassword } = data;
            expect(authenticateUserWithPassword).toBe(null);
            expect(errors).not.toBe(undefined);
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toEqual(
              'Expected PasswordAuthStrategy.hooks.resolveAuthInput() to return an object, but got a undefined: undefined'
            );
            expect(errors[0].path).toEqual(['authenticateUserWithPassword']);
          });
        })
      );
      test(
        'Auth/unauth with good resolveAuthInput return value',
        runner(setupKeystone, async ({ app, keystone }) => {
          // Add a user with a password
          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { name: 'test', email: 'test@example.com', password: 'testing123' },
          });

          await runTestInServer(app, async _runQuery => {
            // Attempt to authenticate with special creds that get resolved to valid in a hook
            const { agent, data, errors } = await _runQuery(`
              mutation {
                authenticateUserWithPassword(email: "fixOnResolve", password: "totallyWrong") {
                  token
                  item { id }
                }
              }`);
            expect(errors).toBe(undefined);
            const { authenticateUserWithPassword } = data;
            expect(authenticateUserWithPassword).not.toBe(null);
            expect(authenticateUserWithPassword.token).not.toBe(undefined);
            expect(authenticateUserWithPassword.item).not.toBe(undefined);
            expect(authenticateUserWithPassword.item.id).toEqual(user.id);

            // Unauthenticate
            const { data: data_, errors: errors_ } = await _runQuery(
              `mutation { unauthenticateUser { success } }`,
              agent
            );
            expect(errors_).toBe(undefined);
            const { unauthenticateUser } = data_;
            expect(unauthenticateUser).not.toBe(null);
            expect(unauthenticateUser.success).toBe(true);
          });
        })
      );
      test(
        'Auth with values caught in validation hook return value',
        runner(setupKeystone, async ({ app, keystone }) => {
          // Add a user with a password
          await createItem({
            keystone,
            listKey: 'User',
            item: { name: 'test', email: 'test@example.com', password: 'testing123' },
          });

          await runTestInServer(app, async _runQuery => {
            // Attempt to authenticate with special creds that get cause the validation hook to trigger
            const { data, errors } = await _runQuery(`
              mutation {
                authenticateUserWithPassword(email: "invalid", password: "totallyWrong") {
                  token
                  item { id }
                }
              }`);
            const { authenticateUserWithPassword } = data;
            expect(authenticateUserWithPassword).toBe(null);
            expect(errors).not.toBe(undefined);
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toEqual('You attempted to perform an invalid mutation');
            expect(errors[0].path).toEqual(['authenticateUserWithPassword']);
          });
        })
      );
    });
  })
);
