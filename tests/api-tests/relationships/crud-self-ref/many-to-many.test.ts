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
    data: { friends: { create: [{ name: sampleOne(alphanumGenerator) }] } },
    query: 'id friends { id friendOf { id } }',
  });

  const { User, Friend } = await getUserAndFriend(context, user.id, user.friends[0].id);

  // Sanity check the links are setup correctly
  expect(User.friends[0].id.toString()).toBe(Friend.id.toString());
  expect(Friend.friendOf[0].id.toString()).toBe(User.id.toString());

  return { user, friend: user.friends[0] };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = {
    data: {
      User: { id: IdType; friends: { id: IdType }[] };
      Friend: { id: IdType; friendOf: { id: IdType }[] };
    };
  };
  const result = (await context.graphql.raw({
    query: `
      {
        User: user(where: { id: "${userId}"} ) { id friends { id } }
        Friend: user(where: { id: "${friendId}"} ) { id friendOf { id } }
      }`,
  })) as T;
  return result.data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const createUsers = await context.lists.User.createMany({
    data: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E'].map(name => ({ name })),
    query: 'id name',
  });

  await Promise.all(
    [
      [0, 1, 2, 3, 4, 5], //  -> [A, A, B, B, C, C]
      [0, 2, 4], //  -> [A, B, C]
      [0, 1], //  -> [A, A]
      [0, 2], //  -> [A, B]
      [0, 4], //  -> [A, C]
      [2, 3], //  -> [B, B]
      [0], //  -> [A]
      [2], //  -> [B]
      [], //  -> []
    ].map(async (locationIdxs, j) => {
      const ids = locationIdxs.map(i => ({ id: createUsers[i].id }));
      await context.lists.User.updateOne({
        where: { id: createUsers[j].id },
        data: { friends: { connect: ids } },
        query: 'id friends { name }',
      });
    })
  );
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          name: text({ isFilterable: true }),
          friendOf: relationship({ ref: 'User.friends', many: true }),
          friends: relationship({ ref: 'User.friendOf', many: true, isFilterable: true }),
        },
      }),
    },
  }),
});

describe(`Many-to-many relationships`, () => {
  describe('Read', () => {
    test(
      'some',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 6],
            ['B', 5],
            ['C', 3],
            ['D', 0],
          ].map(async ([name, count]) => {
            const _users = await context.lists.User.findMany({
              where: { friends: { some: { name: { equals: name } } } },
            });
            expect(_users.length).toEqual(count);
          })
        );
      })
    );
    test(
      'none',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 3],
            ['B', 4],
            ['C', 6],
            ['D', 9],
          ].map(async ([name, count]) => {
            const _users = await context.lists.User.findMany({
              where: { friends: { none: { name: { equals: name } } } },
            });
            expect(_users.length).toEqual(count);
          })
        );
      })
    );
    test(
      'every',
      runner(async ({ context }) => {
        await createReadData(context);
        await Promise.all(
          [
            ['A', 3],
            ['B', 3],
            ['C', 1],
            ['D', 1],
          ].map(async ([name, count]) => {
            const users = await context.lists.User.findMany({
              where: { friends: { every: { name: { equals: name } } } },
            });
            expect(users.length).toEqual(count);
          })
        );
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
        const friend = users[0];
        const user = await context.lists.User.createOne({
          data: { friends: { connect: [{ id: friend.id }] } },
          query: 'id friends { id }',
        });

        expect(user.friends[0].id.toString()).toEqual(friend.id);

        const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);

        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const locationName = sampleOne(alphanumGenerator);
        const user = await context.lists.User.createOne({
          data: { friends: { create: [{ name: locationName }] } },
          query: 'id friends { id }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, user.friends[0].id);

        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
      })
    );

    test(
      'With nested connect',
      runner(async ({ context }) => {
        const { users } = await createInitialData(context);
        const user = users[0];
        const friendName = sampleOne(alphanumGenerator);

        const _user = await context.lists.User.createOne({
          data: {
            friends: {
              create: [{ name: friendName, friendOf: { connect: [{ id: user.id }] } }],
            },
          },
          query: 'id friends { id friendOf { id } }',
        });

        const { User, Friend } = await getUserAndFriend(context, _user.id, _user.friends[0].id);
        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.length).toEqual(2);

        const _users = (await context.lists.User.findMany({
          query: ' id friends { id friendOf { id } }',
        })) as { id: IdType; friends: any[] }[];
        // Both companies should have a location, and the location should have two companies
        const linkedUsers = _users.filter(({ id }) => id === user.id || id === User.id);
        linkedUsers.forEach(({ friends }) => {
          expect(friends.map(({ id }: { id: IdType }) => id)).toEqual([Friend.id.toString()]);
        });
        expect(linkedUsers[0].friends[0].friendOf).toEqual([
          { id: linkedUsers[0].id },
          { id: linkedUsers[1].id },
        ]);
      })
    );

    test(
      'With nested create',
      runner(async ({ context }) => {
        const friendName = sampleOne(alphanumGenerator);
        const userName = sampleOne(alphanumGenerator);
        const user = await context.lists.User.createOne({
          data: {
            friends: {
              create: [{ name: friendName, friendOf: { create: [{ name: userName }] } }],
            },
          },
          query: 'id friends { id friendOf { id } }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, user.friends[0].id);

        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.length).toEqual(2);

        // Both companies should have a location, and the location should have two companies
        const users = (await context.lists.User.findMany({
          query: 'id friends { id friendOf { id } }',
        })) as { id: IdType; friends: any[] }[];
        users.forEach(({ id, friends }) => {
          if (id === Friend.id) {
            expect(friends.map(({ id }: { id: IdType }) => id)).toEqual([]);
          } else {
            expect(friends.map(({ id }: { id: IdType }) => id)).toEqual([Friend.id.toString()]);
          }
        });
        expect(users[0].friends[0].friendOf).toEqual([{ id: users[0].id }, { id: users[2].id }]);
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        const user = await context.lists.User.createOne({
          data: { friends: null },
          query: 'id friends { id }',
        });

        // Friends should be empty
        expect(user.friends).toHaveLength(0);
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
        expect(user.friends).not.toBe(expect.anything());
        expect(friend.friendOf).not.toBe(expect.anything());

        await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friends: { connect: [{ id: friend.id }] } },
          query: 'id friends { id }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const { users } = await createInitialData(context);
        let user = users[0];
        const locationName = sampleOne(alphanumGenerator);

        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friends: { create: [{ name: locationName }] } },
          query: 'id friends { id name }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, _user.friends[0].id);

        // Everything should now be connected
        expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
        expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
      })
    );

    test(
      'With disconnect',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { user, friend } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friends: { disconnect: [{ id: friend.id }] } },
          query: 'id friends { id name }',
        });
        expect(_user.id).toEqual(user.id);
        expect(_user.friends).toEqual([]);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User.friends).toEqual([]);
        expect(result.Friend.friendOf).toEqual([]);
      })
    );

    test(
      'With set: []',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { user, friend } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friends: { set: [] } },
          query: 'id friends { id name }',
        });
        expect(_user.id).toEqual(user.id);
        expect(_user.friends).toEqual([]);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User.friends).toEqual([]);
        expect(result.Friend.friendOf).toEqual([]);
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { user, friend } = await createUserAndFriend(context);

        // Run the query with a null operation
        const _user = await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friends: null },
          query: 'id friends { id name }',
        });

        // Check that the friends are still there
        expect(_user.id).toEqual(user.id);
        expect(_user.friends).toHaveLength(1);
        expect(_user.friends[0].id).toEqual(friend.id);
      })
    );
  });

  describe('Delete', () => {
    test(
      'delete',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { user, friend } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.deleteOne({ where: { id: user.id } });
        expect(_user?.id).toBe(user.id);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User).toBe(null);
        expect(result.Friend.friendOf).toEqual([]);
      })
    );
  });
});
