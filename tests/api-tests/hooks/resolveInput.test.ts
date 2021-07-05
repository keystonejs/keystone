import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectExtensionError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          name: text({
            hooks: {
              resolveInput: ({ resolvedData }) => {
                if (resolvedData.name === 'trigger field error') {
                  throw new Error('Field error triggered');
                }

                return `${resolvedData.name}-field`;
              },
            },
          }),
        },
        hooks: {
          resolveInput: ({ resolvedData }) => {
            if (resolvedData.name === 'trigger list error-field') {
              throw new Error('List error triggered');
            }
            return {
              name: `${resolvedData.name}-list`,
            };
          },
        },
      }),
    },
  }),
});

describe('List Hooks: #resolveInput()', () => {
  test(
    'resolves fields first, then passes them to the list',
    runner(async ({ context }) => {
      const user = await context.lists.User.createOne({ data: { name: 'jess' }, query: 'name' });
      // Field should be executed first, appending `-field`, then the list
      // should be executed which appends `-list`, and finally that total
      // result should be stored.
      expect(user.name).toBe('jess-field-list');
    })
  );

  test(
    'List error',
    runner(async ({ context }) => {
      // Trigger an error
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: `trigger list error` } },
      });
      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      const message = `List error triggered`;
      expectExtensionError('dev', false, undefined, errors, `resolveInput`, [
        {
          path: ['createUser'],
          messages: [`User: ${message}`],
          debug: [
            {
              message,
              stacktrace: expect.stringMatching(
                new RegExp(`Error: ${message}\n[^\n]*resolveInput .${__filename}`)
              ),
            },
          ],
        },
      ]);
    })
  );

  test(
    'Field error',
    runner(async ({ context }) => {
      // Trigger an error
      const { data, errors } = await context.graphql.raw({
        query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
        variables: { data: { name: `trigger field error` } },
      });
      // Returns null and throws an error
      expect(data).toEqual({ createUser: null });
      const message = `Field error triggered`;
      expectExtensionError('dev', false, undefined, errors, `resolveInput`, [
        {
          path: ['createUser'],
          messages: [`User.name: ${message}`],
          debug: [
            {
              message,
              stacktrace: expect.stringMatching(
                new RegExp(`Error: ${message}\n[^\n]*resolveInput .${__filename}`)
              ),
            },
          ],
        },
      ]);
    })
  );
});
