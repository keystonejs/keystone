import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';
import type { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  type T = { createUsers: { id: IdType }[] };
  const data = (await context.graphql.run({
    query: `
      mutation {
        createUsers(data: [
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } }
        ]) { id }
      }`,
  })) as T;
  return { users: data.createUsers };
};

const createUserAndFriend = async (context: KeystoneContext) => {
  type T = {
    createUser: {
      id: IdType;
      name: string;
      friend: { id: IdType; name: string; friendOf: { id: IdType } };
    };
  };

  const { createUser } = (await context.graphql.run({
    query: `
      mutation {
        createUser(data: {
          name: "${sampleOne(alphanumGenerator)}"
          friend: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id name friend { id name friendOf { id } } }
      }`,
  })) as T;
  const { User, Friend } = await getUserAndFriend(context, createUser.id, createUser.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());
  expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

  return { user: createUser, friend: createUser.friend };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = {
    User: { id: IdType; friend: { id: IdType } };
    Friend: { id: IdType; friendOf: { id: IdType } };
  };

  const data = (await context.graphql.run({
    query: `
      {
        User(where: { id: "${userId}"} ) { id friend { id } }
        Friend: User(where: { id: "${friendId}"} ) { id friendOf { id } }
      }`,
  })) as T;
  return data;
};

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            name: text(),
            friendOf: relationship({ ref: 'User.friend' }),
            friend: relationship({ ref: 'User.friendOf' }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`One-to-one relationships`, () => {
      describe('Read', () => {
        test(
          'Where - friend',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { user, friend } = await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friend: { name: "${friend.name}"} }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(1);
            expect(data.allUsers[0].id).toEqual(user.id);
          })
        );

        test(
          'Where - friendOf',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { user, friend } = await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friendOf: { name: "${user.name}"} }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(1);
            expect(data.allUsers[0].id).toEqual(friend.id);
          })
        );
        test(
          'Where friend: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friend_is_null: true }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(4);
          })
        );
        test(
          'Where friendOf: is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friendOf_is_null: true }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(4);
          })
        );
        test(
          'Where friend: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friend_is_null: false }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(1);
          })
        );
        test(
          'Where friendOf: is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  allUsers(where: { friendOf_is_null: false }) { id }
                }`,
            });
            expect(data.allUsers.length).toEqual(1);
          })
        );

        test(
          'Count',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const data = await context.graphql.run({
              query: `
                {
                  _allUsersMeta { count }
                }
            `,
            });
            expect(data._allUsersMeta.count).toEqual(3);
          })
        );

        test(
          'Where with count - friend',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { friend } = await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  _allUsersMeta(where: { friend: { name: "${friend.name}"} }) { count }
                }`,
            });
            expect(data._allUsersMeta.count).toEqual(1);
          })
        );

        test(
          'Where with count - friendOf',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const { user } = await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  _allUsersMeta(where: { friendOf: { name: "${user.name}"} }) { count }
                }`,
            });
            expect(data._allUsersMeta.count).toEqual(1);
          })
        );
        test(
          'Where null with count - friend',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  _allUsersMeta(where: { friend_is_null: true }) { count }
                }`,
            });
            expect(data._allUsersMeta.count).toEqual(4);
          })
        );

        test(
          'Where null with count - friendOf',
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            await createUserAndFriend(context);
            const data = await context.graphql.run({
              query: `{
                  _allUsersMeta(where: { friendOf_is_null: true }) { count }
                }`,
            });
            expect(data._allUsersMeta.count).toEqual(4);
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            const user = users[0];
            const data = await context.graphql.run({
              query: `
                mutation {
                  createUser(data: {
                    friend: { connect: { id: "${user.id}" } }
                  }) { id friend { id } }
                }
            `,
            });
            expect(data.createUser.friend.id.toString()).toEqual(user.id);

            const { User, Friend } = await getUserAndFriend(context, data.createUser.id, user.id);
            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const friendName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" } }
                  }) { id friend { id } }
                }
            `,
            });

            const { User, Friend } = await getUserAndFriend(
              context,
              data.createUser.id,
              data.createUser.friend.id
            );

            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With nested connect',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            const user = users[0];
            const friendName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" friendOf: { connect: { id: "${user.id}" } } } }
                  }) { id friend { id friendOf { id } } }
                }
            `,
            });

            const { User, Friend } = await getUserAndFriend(
              context,
              data.createUser.id,
              data.createUser.friend.id
            );
            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

            const { allUsers } = await context.graphql.run({
              query: `{ allUsers { id friend { id friendOf { id }} } }`,
            });
            // The nested company should not have a location
            const _allUsers: {
              id: IdType;
              friend: { id: IdType; friendOf: { id: IdType } };
            }[] = allUsers;
            expect(_allUsers.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(
              User.id
            );
            _allUsers
              .filter(({ id }) => id !== User.id)
              .forEach(user => {
                expect(user.friend).toBe(null);
              });
          })
        );

        test(
          'With nested create',
          runner(setupKeystone, async ({ context }) => {
            const friendName = sampleOne(alphanumGenerator);
            const friendOfName = sampleOne(alphanumGenerator);

            const data = await context.graphql.run({
              query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" friendOf: { create: { name: "${friendOfName}" } } } }
                  }) { id friend { id friendOf { id } } }
                }
            `,
            });

            const { User, Friend } = await getUserAndFriend(
              context,
              data.createUser.id,
              data.createUser.friend.id
            );
            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

            // The nested company should not have a location
            const { allUsers } = await context.graphql.run({
              query: `{ allUsers { id friend { id friendOf { id }} } }`,
            });
            const _allUsers: {
              id: IdType;
              friend: { id: IdType; friendOf: { id: IdType } };
            }[] = allUsers;
            expect(_allUsers.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(
              User.id
            );
            _allUsers
              .filter(({ id }) => id !== User.id)
              .forEach(user => {
                expect(user.friend).toBe(null);
              });
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            const data = await context.graphql.run({
              query: `
                mutation {
                  createUser(data: {
                    friend: null
                  }) { id friend { id } }
                }
            `,
            });

            // Friend should be empty
            expect(data.createUser.friend).toBe(null);
          })
        );
      });

      describe('Update', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(user.friend).not.toBe(expect.anything());
            expect(friend.friendOf).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { connect: { id: "${friend.id}" } } }
                  ) { id friend { id } } }
            `,
            });

            const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            let user = users[0];
            const friendName = sampleOne(alphanumGenerator);
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { create: { name: "${friendName}" } } }
                  ) { id friend { id name } }
                }
            `,
            });

            const { User, Friend } = await getUserAndFriend(
              context,
              user.id,
              data.updateUser.friend.id
            );

            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With disconnect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { disconnect: { id: "${friend.id}" } } }
                  ) { id friend { id name } }
                }
            `,
            });
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friend).toBe(null);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friend).toBe(null);
            expect(result.Friend.friendOf).toBe(null);
          })
        );

        test(
          'With disconnectAll',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { disconnectAll: true } }
                  ) { id friend { id name } }
                }
            `,
            });

            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friend).toBe(null);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friend).toBe(null);
            expect(result.Friend.friendOf).toBe(null);
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query with a null operation
            const data = await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: null }
                  ) { id friend { id name } }
                }
            `,
            });

            // Check that the friend is still there
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friend).not.toBe(null);
            expect(data.updateUser.friend.id).toEqual(friend.id);
          })
        );
      });

      describe('Delete', () => {
        test(
          'delete',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `mutation { deleteUser(id: "${user.id}") { id } } `,
            });
            expect(data.deleteUser.id).toBe(user.id);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User).toBe(null);
            expect(result.Friend.friendOf).toBe(null);
          })
        );
      });
    });
  })
);
