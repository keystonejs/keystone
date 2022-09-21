import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { config } from './utils';

const runner = setupTestRunner({ config });

test(
  'authenticatedItem',
  runner(async ({ context }) => {
    const user = (await context.query.User.createOne({
      data: { name: 'test', yesRead: 'yes', noRead: 'no' },
      query: 'id name yesRead noRead',
    })) as { id: string; name: string; yesRead: string; noRead: string };

    const query = `query { authenticatedItem { ... on User { id yesRead noRead } } }`;
    const _context = context.withSession({
      itemId: user.id,
      listKey: 'User',
      data: user,
    });
    const { data, errors } = await _context.graphql.raw({ query });
    expect(data).toEqual({
      authenticatedItem: { id: user.id, yesRead: user.yesRead, noRead: null },
    });
    expect(errors).toBe(undefined);
  })
);
