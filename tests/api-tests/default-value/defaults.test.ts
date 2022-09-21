import { text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import type { BaseFields } from '@keystone-6/core/types';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig } from '../utils';

const setupList = (fields: BaseFields<any>) =>
  setupTestRunner({
    config: apiTestConfig({
      lists: {
        // prettier-ignore
        User: list({
          access: allowAll,
          fields,
        }),
      },
    }),
  });

describe('defaultValue field config', () => {
  test(
    'text with isNullable: true has no default by default',
    setupList({ name: text({ db: { isNullable: true } }) })(async ({ context }) => {
      const result = await context.query.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: null });
    })
  );

  test(
    'Sets a scalar as a default',
    setupList({ name: text({ defaultValue: 'hello' }) })(async ({ context }) => {
      const result = await context.query.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: 'hello' });
    })
  );
});
