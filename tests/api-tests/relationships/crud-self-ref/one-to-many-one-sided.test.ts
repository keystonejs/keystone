import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import type { KeystoneContext } from '@keystone-next/keystone/types';
import { apiTestConfig } from '../../utils';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  const users = await context.lists.User.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
  });

  return { users };
};

const createUserAndFriend = async (context: KeystoneContext) => {
  const user = await context.lists.User.createOne({
    data: { friend: { create: { name: sampleOne(alphanumGenerator) } } },
    query: 'id friend { id }',
  });

  const { User, Friend } = await getUserAndFriend(context, user.id, user.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());

  return { user, friend: user.friend };
};

const createComplexData = async (context: KeystoneContext) => {
  const users = await context.lists.User.createMany({
    data: [
      { name: 'A', friend: { create: { name: 'A1' } } },
      { name: 'B', friend: { create: { name: 'D1' } } },
      { name: 'C', friend: { create: { name: 'B1' } } },
      { name: 'E' },
    ],
    query: 'id name friend { id name }',
  });
  expect(users[0].name).toEqual('A');
  expect(users[0].friend.name).toEqual('A1');
  expect(users[1].name).toEqual('B');
  expect(users[1].friend.name).toEqual('D1');
  expect(users[2].name).toEqual('C');
  expect(users[2].friend.name).toEqual('B1');
  expect(users[3].name).toEqual('E');
  expect(users[3].friend).toBe(null);
  const _users = await context.lists.User.createMany({
    data: [{ name: 'D', friend: { connect: { id: users[2].friend.id } } }, { name: 'C1' }],
    query: 'id name friend { id name }',
  });
  expect(_users[0].name).toEqual('D');
  expect(_users[0].friend.name).toEqual('B1');
  expect(_users[1].name).toEqual('C1');

  return { users: await context.lists.User.findMany({ query: 'id name friend { id name }' }) };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = { data: { User: { id: IdType; friend: { id: IdType } }; Friend: { id: IdType } } };
  const { data } = (await context.graphql.raw({
    query: `
  {
    User: user(where: { id: "${userId}"} ) { id friend { id } }
    Friend: user(where: { id: "${friendId}"} ) { id }
  }`,
  })) as T;
  return data;
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          name: text({ isFilterable: true, isOrderable: true }),
          friend: relationship({ ref: 'User', isFilterable: true }),
        },
      }),
    },
  }),
});

describe(`One-to-many relationships`, () => {
  describe('Read', () => {
    test(
      'one',
      runner(async ({ context }) => {
        await createComplexData(context);
        await Promise.all(
          [
            ['A', 1],
            ['B', 2],
            ['C', 0],
            ['D', 1],
            ['E', 0],
          ].map(async ([name, count]) => {
            const users = await context.lists.User.findMany({
              where: { friend: { name: { contains: name } } },
            });
            expect(users.length).toEqual(count);
          })
        );
      })
    );
    test(
      'is null',
      runner(async ({ context }) => {
        await createComplexData(context);
        const users = await context.lists.User.findMany({ where: { friend: null } });
        expect(users.length).toEqual(5);
      })
    );
    test(
      'is not null',
      runner(async ({ context }) => {
        await createComplexData(context);
        const users = await context.lists.User.findMany({ where: { NOT: { friend: null } } });
        expect(users.length).toEqual(4);
      })
    );
  });

  describe('Count', () => {
    test(
      'Count',
      runner(async ({ context }) => {
        await createInitialData(context);
        const count = await context.lists.User.count();
        expect(count).toEqual(3);
      })
    );
  });

  describe('Create', () => {
    test(
      'With connect',
      runner(async ({ context }) => {
        const { users } = await createInitialData(context);
        const user = users[0];
        const _user = await context.lists.User.createOne({
          data: { friend: { connect: { id: user.id } } },
          query: 'id friend { id }',
        });

        expect(_user.friend.id.toString()).toBe(user.id.toString());

        const { User, Friend } = await getUserAndFriend(context, _user.id, user.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const friendName = sampleOne(alphanumGenerator);
        const user = await context.lists.User.createOne({
          data: { friend: { create: { name: friendName } } },
          query: 'id friend { id }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, user.friend.id);

        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        const user = await context.lists.User.createOne({
          data: { friend: null },
          query: 'id friend { id }',
        });

        // Friend should be empty
        expect(user.friend).toBe(null);
      })
    );
  });

  describe('Update', () => {
    test(
      'With connect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { user, friend } = await createUserAndFriend(context);

        // Sanity check the links don't yet exist
        // `...not.toBe(expect.anything())` allows null and undefined values
        expect(user.friend).not.toBe(expect.anything());

        await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friend: { connect: { id: friend.id } } },
          query: 'id friend { id }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const { users } = await createInitialData(context);
        let user = users[0];
        const friendName = sampleOne(alphanumGenerator);
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friend: { create: { name: friendName } } },
          query: 'id friend { id name }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, _user.friend.id);

        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
      })
    );

    test(
      'With disconnect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { friend, user } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friend: { disconnect: true } },
          query: 'id friend { id name }',
        });
        expect(_user.id).toEqual(user.id);
        expect(_user.friend).toBe(null);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User.friend).toBe(null);
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { friend, user } = await createUserAndFriend(context);

        // Run the query with a null operation
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friend: null },
          query: 'id friend { id name }',
        });

        // Check that the friend is still there
        expect(_user.id).toEqual(user.id);
        expect(_user.friend).not.toBe(null);
        expect(_user.friend.id).toEqual(friend.id);
      })
    );
  });

  describe('Delete', () => {
    test(
      'delete',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { friend, user } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.deleteOne({ where: { id: user.id } });
        expect(_user?.id).toBe(user.id);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User).toBe(null);
      })
    );

    ['A', 'B', 'C', 'D', 'E'].forEach(name => {
      test(
        `delete company ${name}`,
        runner(async ({ context }) => {
          // Setup a complex set of data
          const { users } = await createComplexData(context);

          // Delete company {name}
          const id = users.find(company => company.name === name)?.id;
          const _user = await context.lists.User.deleteOne({ where: { id } });
          expect(_user?.id).toBe(id);

          // Check all the companies look how we expect
          await (async () => {
            const _users = (await context.lists.User.findMany({
              orderBy: { name: 'asc' },
              query: 'id name friend { id name }',
            })) as { name: string; friend: { name: string } }[];
            const users = _users.filter(({ name }: { name: string }) => name.length === 1);
            const expected = [
              ['A', 'A1'],
              ['B', 'D1'],
              ['C', 'B1'],
              ['D', 'B1'],
              ['E', null],
            ].filter(([x]) => x !== name);

            expect(users[0].name).toEqual(expected[0][0]);
            expect(users[0].friend.name).toEqual(expected[0][1]);
            expect(users[1].name).toEqual(expected[1][0]);
            expect(users[1].friend.name).toEqual(expected[1][1]);
            expect(users[2].name).toEqual(expected[2][0]);
            expect(users[2].friend.name).toEqual(expected[2][1]);
            expect(users[3].name).toEqual(expected[3][0]);
            if (expected[3][1] === null) {
              expect(users[3].friend).toBe(null);
            } else {
              expect(users[2].friend.name).toEqual(expected[3][1]);
            }
          })();

          // Check all the friends look how we expect
          await (async () => {
            const _users = (await context.lists.User.findMany({
              orderBy: { name: 'asc' },
              query: 'id name',
            })) as { name: string }[];
            const friends = _users.filter(({ name }: { name: string }) => name.length === 2);
            expect(friends[0].name).toEqual('A1');
            expect(friends[1].name).toEqual('B1');
            expect(friends[2].name).toEqual('C1');
            expect(friends[3].name).toEqual('D1');
          })();
        })
      );
    });

    ['A1', 'B1', 'C1', 'D1'].forEach(name => {
      test(
        `delete location ${name}`,
        runner(async ({ context }) => {
          // Setup a complex set of data
          const { users } = await createComplexData(context);

          // Delete friend {name}
          const id = users.find(user => user.name === name)?.id;
          const _user = await context.lists.User.deleteOne({ where: { id } });
          expect(_user?.id).toBe(id);

          // Check all the companies look how we expect
          await (async () => {
            const _users = (await context.lists.User.findMany({
              orderBy: { name: 'asc' },
              query: 'id name friend { id name }',
            })) as { name: string; friend: { name: string } }[];
            const users = _users.filter(({ name }) => name.length === 1);
            expect(users[0].name).toEqual('A');
            if (name === 'A1') {
              expect(users[0].friend).toBe(null);
            } else {
              expect(users[0].friend.name).toEqual('A1');
            }
            expect(users[1].name).toEqual('B');
            if (name === 'D1') {
              expect(users[1].friend).toBe(null);
            } else {
              expect(users[1].friend.name).toEqual('D1');
            }
            expect(users[2].name).toEqual('C');
            if (name === 'B1') {
              expect(users[2].friend).toBe(null);
            } else {
              expect(users[2].friend.name).toEqual('B1');
            }
            expect(users[3].name).toEqual('D');
            if (name === 'B1') {
              expect(users[3].friend).toBe(null);
            } else {
              expect(users[3].friend.name).toEqual('B1');
            }
            expect(users[4].name).toEqual('E');
            expect(users[4].friend).toBe(null);
          })();

          // Check all the friends look how we expect
          await (async () => {
            const _users = (await context.lists.User.findMany({
              orderBy: { name: 'asc' },
              query: 'id name',
            })) as { name: string }[];
            const friends = _users.filter(({ name }) => name.length === 2);
            const expected = ['A1', 'B1', 'C1', 'D1'].filter(x => x !== name);
            expect(friends[0].name).toEqual(expected[0]);
            expect(friends[1].name).toEqual(expected[1]);
            expect(friends[2].name).toEqual(expected[2]);
          })();
        })
      );
    });
  });
});
