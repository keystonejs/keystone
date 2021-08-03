import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: {
          name: text({
            hooks: {
              resolveInput: ({ resolvedData }) => {
                return `${resolvedData.name}-field`;
              },
            },
          }),
        },
        hooks: {
          resolveInput: ({ resolvedData }) => {
            return {
              name: `${resolvedData.name}-list`,
            };
          },
        },
      }),
    }),
  }),
});

describe('List Hooks: #resolveInput()', () => {
  it(
    'resolves fields first, then passes them to the list',
    runner(async ({ context }) => {
      const user = await context.lists.User.createOne({
        data: { name: 'jess' },
        query: 'name',
      });

      // Field should be executed first, appending `-field`, then the list
      // should be executed which appends `-list`, and finally that total
      // result should be stored.
      expect(user.name).toBe('jess-field-list');
    })
  );
});
