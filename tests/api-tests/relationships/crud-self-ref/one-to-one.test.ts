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
    data: {
      name: sampleOne(alphanumGenerator),
      friend: { create: { name: sampleOne(alphanumGenerator) } },
    },
    query: 'id name friend { id name friendOf { id } }',
  });

  const { User, Friend } = await getUserAndFriend(context, user.id, user.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());
  expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

  return { user, friend: user.friend };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = {
    data: {
      User: { id: IdType; friend: { id: IdType } };
      Friend: { id: IdType; friendOf: { id: IdType } };
    };
  };

  const { data } = (await context.graphql.raw({
    query: `
      {
        User: user(where: { id: "${userId}"} ) { id friend { id } }
        Friend: user(where: { id: "${friendId}"} ) { id friendOf { id } }
      }`,
  })) as T;
  return data;
};

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          name: text({ isFilterable: true }),
          friendOf: relationship({ ref: 'User.friend', isFilterable: true }),
          friend: relationship({ ref: 'User.friendOf', isFilterable: true }),
        },
      }),
    },
  }),
});

describe(`One-to-one relationships`, () => {
  describe('Read', () => {
    test(
      'Where - friend',
      runner(async ({ context }) => {
        await createInitialData(context);
        const { user, friend } = await createUserAndFriend(context);
        const users = await context.lists.User.findMany({
          where: { friend: { name: { equals: friend.name } } },
        });
        expect(users.length).toEqual(1);
        expect(users[0].id).toEqual(user.id);
      })
    );

    test(
      'Where - friendOf',
      runner(async ({ context }) => {
        await createInitialData(context);
        const { user, friend } = await createUserAndFriend(context);
        const users = await context.lists.User.findMany({
          where: { friendOf: { name: { equals: user.name } } },
        });
        expect(users.length).toEqual(1);
        expect(users[0].id).toEqual(friend.id);
      })
    );
    test(
      'Where friend: is null',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const users = await context.lists.User.findMany({ where: { friend: null } });
        expect(users.length).toEqual(4);
      })
    );
    test(
      'Where friendOf: is null',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const users = await context.lists.User.findMany({ where: { friendOf: null } });
        expect(users.length).toEqual(4);
      })
    );
    test(
      'Where friend: is not null',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const users = await context.lists.User.findMany({ where: { NOT: { friend: null } } });
        expect(users.length).toEqual(1);
      })
    );
    test(
      'Where friendOf: is not null',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const users = await context.lists.User.findMany({ where: { NOT: { friendOf: null } } });
        expect(users.length).toEqual(1);
      })
    );

    test(
      'Count',
      runner(async ({ context }) => {
        await createInitialData(context);
        const count = await context.lists.User.count();
        expect(count).toEqual(3);
      })
    );

    test(
      'Where with count - friend',
      runner(async ({ context }) => {
        await createInitialData(context);
        const { friend } = await createUserAndFriend(context);
        const count = await context.lists.User.count({
          where: { friend: { name: { equals: friend.name } } },
        });
        expect(count).toEqual(1);
      })
    );

    test(
      'Where with count - friendOf',
      runner(async ({ context }) => {
        await createInitialData(context);
        const { user } = await createUserAndFriend(context);
        const count = await context.lists.User.count({
          where: { friendOf: { name: { equals: user.name } } },
        });
        expect(count).toEqual(1);
      })
    );
    test(
      'Where null with count - friend',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const count = await context.lists.User.count({ where: { friend: null } });
        expect(count).toEqual(4);
      })
    );

    test(
      'Where null with count - friendOf',
      runner(async ({ context }) => {
        await createInitialData(context);
        await createUserAndFriend(context);
        const count = await context.lists.User.count({ where: { friendOf: null } });
        expect(count).toEqual(4);
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
          query: 'id friend { id friendOf { id } }',
        });

        expect(_user.friend.id.toString()).toEqual(user.id);

        const { User, Friend } = await getUserAndFriend(context, _user.id, user.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
      })
    );

    test(
      'With create',
      runner(async ({ context }) => {
        const friendName = sampleOne(alphanumGenerator);
        const user = await context.lists.User.createOne({
          data: { friend: { create: { name: friendName } } },
          query: 'id friend { id friendOf { id } }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, user.friend.id);

        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
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
            friend: { create: { name: friendName, friendOf: { connect: { id: user.id } } } },
          },
          query: 'id friend { id friendOf { id } }',
        });

        const { User, Friend } = await getUserAndFriend(context, _user.id, _user.friend.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

        const _users = (await context.lists.User.findMany({
          query: 'id friend { id friendOf { id } }',
        })) as { id: IdType; friend: { id: IdType; friendOf: { id: IdType } } }[];
        // The nested company should not have a location
        expect(_users.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(User.id);
        _users
          .filter(({ id }) => id !== User.id)
          .forEach(user => {
            expect(user.friend).toBe(null);
          });
      })
    );

    test(
      'With nested create',
      runner(async ({ context }) => {
        const friendName = sampleOne(alphanumGenerator);
        const friendOfName = sampleOne(alphanumGenerator);

        const _user = await context.lists.User.createOne({
          data: {
            friend: {
              create: { name: friendName, friendOf: { create: { name: friendOfName } } },
            },
          },
          query: 'id friend { id friendOf { id } }',
        });

        const { User, Friend } = await getUserAndFriend(context, _user.id, _user.friend.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

        // The nested company should not have a location
        const users = (await context.lists.User.findMany({
          query: 'id friend { id friendOf { id }}',
        })) as {
          id: IdType;
          friend: { id: IdType; friendOf: { id: IdType } };
        }[];
        expect(users.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(User.id);
        users
          .filter(({ id }) => id !== User.id)
          .forEach(user => {
            expect(user.friend).toBe(null);
          });
      })
    );

    test(
      'With null',
      runner(async ({ context }) => {
        const _user = await context.lists.User.createOne({
          data: { friend: null },
          query: 'id friend { id  }',
        });

        // Friend should be empty
        expect(_user.friend).toBe(null);
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
        expect(friend.friendOf).not.toBe(expect.anything());

        await context.lists.User.updateOne({
          where: { id: user.id },
          data: { friend: { connect: { id: friend.id } } },
          query: 'id friend { id }',
        });

        const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
        // Everything should now be connected
        expect(User.friend.id.toString()).toBe(Friend.id.toString());
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
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
        expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
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
          data: { friend: { disconnect: true } },
          query: 'id friend { id name }',
        });

        expect(_user.id).toEqual(user.id);
        expect(_user.friend).toBe(null);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User.friend).toBe(null);
        expect(result.Friend.friendOf).toBe(null);
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
        const { user, friend } = await createUserAndFriend(context);

        // Run the query to disconnect the location from company
        const _user = await context.lists.User.deleteOne({ where: { id: user.id } });
        expect(_user?.id).toBe(user.id);

        // Check the link has been broken
        const result = await getUserAndFriend(context, user.id, friend.id);
        expect(result.User).toBe(null);
        expect(result.Friend.friendOf).toBe(null);
      })
    );
  });
});
