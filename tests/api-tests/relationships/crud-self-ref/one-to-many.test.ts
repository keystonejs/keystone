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
  const user = await context.lists.User.createOne({
    data: { friends: { create: [{ name: sampleOne(alphanumGenerator) }] } },
    query: 'id friends { id friendOf { id } }',
  });

  const { User, Friend } = await getUserAndFriend(context, user.id, user.friends[0].id);

  // Sanity check the links are setup correctly
  expect(User.friends.map(({ id }: { id: IdType }) => id.toString())).toEqual([Friend.id]);
  expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

  return { user, friend: user.friends[0] };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = {
    data: {
      User: { id: IdType; friends: { id: IdType }[] };
      Friend: { id: IdType; friendOf: { id: IdType } };
    };
  };
  const { data } = (await context.graphql.raw({
    query: `
      {
        User(where: { id: "${userId}"} ) { id friends { id } }
        Friend: User(where: { id: "${friendId}"} ) { id friendOf { id } }
      }`,
  })) as T;
  const User = data.User;
  const Friend = data.Friend;
  return { User, Friend };
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const data = await context.graphql.run({
    query: `mutation create($users: [UsersCreateInput]) { createUsers(data: $users) { id name } }`,
    variables: {
      users: ['A', 'A', 'B', 'B', 'C', 'C', 'D'].map(name => ({ data: { name } })),
    },
  });
  const { createUsers } = data;
  await Promise.all(
    Object.entries({
      ABC: [0, 2, 4], //  -> [A, B, C]
      AB: [1, 3], //  -> [A, B]
      C: [5], //  -> [C]
      '': [], //  -> []
    }).map(async ([name, locationIdxs]) => {
      const ids = locationIdxs.map((i: number) => ({ id: createUsers[i].id }));
      await context.lists.User.createOne({
        data: { name, friends: { connect: ids } },
        query: 'id friends { id friendOf { id } }',
      });
    })
  );
};

const setupKeystone = (provider: ProviderName) =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            name: text(),
            friendOf: relationship({ ref: 'User.friends' }),
            friends: relationship({ ref: 'User.friendOf', many: true }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`One-to-many relationships`, () => {
      describe('Read', () => {
        test(
          'one',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 5],
                ['B', 5],
                ['C', 4],
                ['D', 0],
              ].map(async ([name, count]) => {
                const users = await context.lists.User.findMany({
                  where: { friendOf: { name_contains: name } },
                });
                expect(users.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            const users = await context.lists.User.findMany({ where: { friendOf_is_null: true } });
            expect(users.length).toEqual(5);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            const users = await context.lists.User.findMany({ where: { friendOf_is_null: false } });
            expect(users.length).toEqual(6);
          })
        );
        test(
          '_some',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 2],
                ['B', 2],
                ['C', 2],
                ['D', 0],
              ].map(async ([name, count]) => {
                const users = await context.lists.User.findMany({
                  where: { friends_some: { name } },
                });
                expect(users.length).toEqual(count);
              })
            );
          })
        );
        test(
          '_none',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 2 + 7],
                ['B', 2 + 7],
                ['C', 2 + 7],
                ['D', 4 + 7],
              ].map(async ([name, count]) => {
                const users = await context.lists.User.findMany({
                  where: { friends_none: { name } },
                });
                expect(users.length).toEqual(count);
              })
            );
          })
        );
        test(
          '_every',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 1 + 7],
                ['B', 1 + 7],
                ['C', 2 + 7],
                ['D', 1 + 7],
              ].map(async ([name, count]) => {
                const users = await context.lists.User.findMany({
                  where: { friends_every: { name } },
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
          runner(setupKeystone, async ({ context }) => {
            await createInitialData(context);
            const count = await context.lists.User.count();
            expect(count).toEqual(3);
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            const user = users[0];
            const _user = (await context.lists.User.createOne({
              data: { friends: { connect: [{ id: user.id }] } },
              query: 'id friends { id  }',
            })) as { id: IdType; friends: { id: IdType }[] };

            expect(_user.friends.map(({ id }) => id.toString())).toEqual([user.id]);

            const { User, Friend } = await getUserAndFriend(context, _user.id, user.id);

            // Everything should now be connected
            expect(_user.friends.map(({ id }) => id.toString())).toEqual([user.id]);
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const friendName = sampleOne(alphanumGenerator);
            const _user = await context.lists.User.createOne({
              data: { friends: { create: [{ name: friendName }] } },
              query: 'id friends { id }',
            });

            const { User, Friend } = await getUserAndFriend(context, _user.id, _user.friends[0].id);

            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
          })
        );

        test(
          'With nested connect',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            const user = users[0];
            const friendName = sampleOne(alphanumGenerator);

            const _user = await context.lists.User.createOne({
              data: {
                friends: { create: [{ name: friendName, friendOf: { connect: { id: user.id } } }] },
              },
              query: 'id friends { id friendOf { id } }',
            });

            const { User, Friend } = await getUserAndFriend(context, _user.id, _user.friends[0].id);

            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id]);
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

            const _users = (await context.lists.User.findMany({
              query: 'id friends { id friendOf { id } }',
            })) as {
              id: IdType;
              friends: { id: IdType; friendOf: { id: IdType } }[];
            }[];

            // The nested company should not have a location
            expect(_users.filter(({ id }) => id === User.id)[0].friends[0].friendOf.id).toEqual(
              User.id
            );
            _users
              .filter(({ id }) => id !== User.id)
              .forEach(user => {
                expect(user.friends).toEqual([]);
              });
          })
        );

        test(
          'With nested create',
          runner(setupKeystone, async ({ context }) => {
            const friendName = sampleOne(alphanumGenerator);
            const friendOfName = sampleOne(alphanumGenerator);

            const user = await context.lists.User.createOne({
              data: {
                friends: {
                  create: [{ name: friendName, friendOf: { create: { name: friendOfName } } }],
                },
              },
              query: 'id friends { id friendOf { id } }',
            });

            const { User, Friend } = await getUserAndFriend(context, user.id, user.friends[0].id);
            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id]);
            expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

            // The nested company should not have a location
            const users = (await context.lists.User.findMany({
              query: 'id friends { id friendOf { id } }',
            })) as {
              id: IdType;
              friends: { id: IdType; friendOf: { id: IdType } }[];
            }[];
            expect(users.filter(({ id }) => id === User.id)[0].friends[0].friendOf.id).toEqual(
              User.id
            );
            users
              .filter(({ id }) => id !== User.id)
              .forEach(user => {
                expect(user.friends).toEqual([]);
              });
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
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
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(user.friends).not.toBe(expect.anything());
            expect(friend.friendOf).not.toBe(expect.anything());

            await context.graphql.run({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { connect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id } } }
            `,
            });

            const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
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
                    data: { friends: { create: [{ name: "${friendName}" }] } }
                  ) { id friends { id name } }
                }
            `,
            });

            const { User, Friend } = await getUserAndFriend(
              context,
              user.id,
              data.updateUser.friends[0].id
            );

            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
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
                    data: { friends: { disconnect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friends).toEqual([]);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friends).toEqual([]);
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
                    data: { friends: { disconnectAll: true } }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friends).toEqual([]);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friends).toEqual([]);
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
                    data: { friends: null }
                  ) { id friends { id name } }
                }
            `,
            });

            // Check that the friends are still there
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friends).toHaveLength(1);
            expect(data.updateUser.friends[0].id).toEqual(friend.id);
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
