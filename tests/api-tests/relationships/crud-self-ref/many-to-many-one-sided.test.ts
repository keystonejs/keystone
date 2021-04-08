import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import type { ProviderName } from '@keystone-next/test-utils-legacy';
import type { KeystoneContext } from '@keystone-next/types';

type IdType = any;

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async (context: KeystoneContext) => {
  type T = {
    data: { createUsers: { id: IdType }[] };
    errors: unknown;
  };
  const { data, errors }: T = await context.executeGraphQL({
    query: `
      mutation {
        createUsers(data: [
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } },
          { data: { name: "${sampleOne(alphanumGenerator)}" } }
        ]) { id }
      }`,
  });
  expect(errors).toBe(undefined);
  return { users: data.createUsers };
};

const createUserAndFriend = async (context: KeystoneContext) => {
  type T = { data: { createUser: { id: IdType; friends: { id: IdType }[] } }; errors: unknown };
  const {
    data: { createUser },
    errors,
  }: T = await context.executeGraphQL({
    query: `
      mutation {
        createUser(data: {
          friends: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
        }) { id friends { id } }
      }`,
  });
  expect(errors).toBe(undefined);
  const { User, Friend } = await getUserAndFriend(context, createUser.id, createUser.friends[0].id);

  // Sanity check the links are setup correctly
  expect(User.friends.map(({ id }: { id: IdType }) => id.toString())).toStrictEqual([
    Friend.id.toString(),
  ]);

  return { user: createUser, friend: createUser.friends[0] };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = { data: { User: { id: IdType; friends: { id: IdType }[] }; Friend: { id: IdType } } };
  const result: T = await context.executeGraphQL({
    query: `
      {
        User(where: { id: "${userId}"} ) { id friends { id } }
        Friend: User(where: { id: "${friendId}"} ) { id }
      }`,
  });
  return result.data;
};

const createReadData = async (context: KeystoneContext) => {
  // create locations [A, A, B, B, C, C];
  const { data, errors } = await context.executeGraphQL({
    query: `mutation create($users: [UsersCreateInput]) { createUsers(data: $users) { id name } }`,
    variables: {
      users: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E'].map(name => ({ data: { name } })),
    },
  });
  expect(errors).toBe(undefined);
  const { createUsers } = data;
  await Promise.all(
    [
      [0, 1, 2, 3, 4, 5], //  -> (A1) -> [A, A, B, B, C, C]
      [0, 2, 4], //  -> (A2) -> [A, B, C]
      [0, 1], //  -> (B1) -> [A, A]
      [0, 2], //  -> (B2) -> [A, B]
      [0, 4], //  ->  (C1) -> [A, C]
      [2, 3], //  ->  (C2) -> [B, B]
      [0], //  -> (D1) -> [A]
      [2], //  -> (D2) -> [B]
      [], //  ->  (E1) -> []
    ].map(async (locationIdxs, j) => {
      const ids = locationIdxs.map(i => ({ id: createUsers[i].id }));
      const { errors } = await context.executeGraphQL({
        query: `mutation update($friends: [UserWhereUniqueInput], $user: ID!) { updateUser(id: $user data: {
    friends: { connect: $friends }
  }) { id friends { name }}}`,
        variables: { friends: ids, user: createUsers[j].id },
      });
      expect(errors).toBe(undefined);
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
            friends: relationship({ ref: 'User', many: true }),
          },
        }),
      }),
    }),
  });

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe(`Many-to-many relationships`, () => {
      describe('Read', () => {
        test(
          '_some',
          runner(setupKeystone, async ({ context }) => {
            await createReadData(context);
            await Promise.all(
              [
                ['A', 6],
                ['B', 5],
                ['C', 3],
                ['D', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
                  query: `{ allUsers(where: { friends_some: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allUsers.length).toEqual(count);
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
                ['A', 3],
                ['B', 4],
                ['C', 6],
                ['D', 9],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
                  query: `{ allUsers(where: { friends_none: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allUsers.length).toEqual(count);
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
                ['A', 3],
                ['B', 3],
                ['C', 1],
                ['D', 1],
              ].map(async ([name, count]) => {
                const { data, errors } = await context.executeGraphQL({
                  query: `{ allUsers(where: { friends_every: { name: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allUsers.length).toEqual(count);
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
            const { data, errors } = await context.executeGraphQL({
              query: `
                {
                  _allUsersMeta { count }
                }
            `,
            });
            expect(errors).toBe(undefined);
            expect(data._allUsersMeta.count).toEqual(3);
          })
        );
      });

      describe('Create', () => {
        test(
          'With connect',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            const user = users[0];
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createUser(data: {
                    friends: { connect: [{ id: "${user.id}" }] }
                  }) { id friends { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);
            const createUser: { id: IdType; friends: { id: IdType }[] } = data.createUser;
            expect(createUser.friends.map(({ id }) => id.toString())).toEqual([user.id]);

            const { User, Friend } = await getUserAndFriend(context, data.createUser.id, user.id);
            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const friendName = sampleOne(alphanumGenerator);
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createUser(data: {
                    friends: { create: [{ name: "${friendName}" }] }
                  }) { id friends { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            const { User, Friend } = await getUserAndFriend(
              context,
              data.createUser.id,
              data.createUser.friends[0].id
            );

            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  createUser(data: {
                    friends: null
                  }) { id friends { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            // Friends should be empty
            expect(data.createUser.friends).toHaveLength(0);
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

            const { errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { connect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id } } }
            `,
            });
            expect(errors).toBe(undefined);

            const { User, Friend } = await getUserAndFriend(context, user.id, friend.id);
            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ context }) => {
            const { users } = await createInitialData(context);
            let user = users[0];
            const friendName = sampleOne(alphanumGenerator);
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { create: [{ name: "${friendName}" }] } }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);

            const { User, Friend } = await getUserAndFriend(
              context,
              user.id,
              data.updateUser.friends[0].id
            );

            // Everything should now be connected
            expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
          })
        );

        test(
          'With disconnect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { disconnect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friends).toEqual([]);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friends).toEqual([]);
          })
        );

        test(
          'With disconnectAll',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { disconnectAll: true } }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);
            expect(data.updateUser.id).toEqual(user.id);
            expect(data.updateUser.friends).toEqual([]);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User.friends).toEqual([]);
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Run the query with a null operation
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: null }
                  ) { id friends { id name } }
                }
            `,
            });
            expect(errors).toBe(undefined);

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
            const { data, errors } = await context.executeGraphQL({
              query: `mutation { deleteUser(id: "${user.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
            expect(data.deleteUser.id).toBe(user.id);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User).toBe(null);
          })
        );
      });
    });
  })
);
