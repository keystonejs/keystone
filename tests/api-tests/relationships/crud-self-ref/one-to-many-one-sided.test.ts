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
    data: { friend: { create: { name: sampleOne(alphanumGenerator) } } },
    query: 'id friend { id }',
  });

  const { User, Friend } = await getUserAndFriend(context, user.id, user.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());

  return { user, friend: user.friend };
};

const createComplexData = async (context: KeystoneContext) => {
  const data = await context.graphql.run({
    query: `
    mutation {
      createUsers(data: [
        { data: { name: "A" friend: { create: { name: "A1" } } } }
        { data: { name: "B" friend: { create: { name: "D1" } } } }
        { data: { name: "C" friend: { create: { name: "B1" } } } }
        { data: { name: "E" } }
      ]) { id name friend { id name }}
    }`,
  });
  expect(data.createUsers[0].name).toEqual('A');
  expect(data.createUsers[0].friend.name).toEqual('A1');
  expect(data.createUsers[1].name).toEqual('B');
  expect(data.createUsers[1].friend.name).toEqual('D1');
  expect(data.createUsers[2].name).toEqual('C');
  expect(data.createUsers[2].friend.name).toEqual('B1');
  expect(data.createUsers[3].name).toEqual('E');
  expect(data.createUsers[3].friend).toBe(null);
  const data2 = await context.graphql.run({
    query: `mutation {
      createUsers(data: [
        { data: { name: "D" friend: { connect: { id: "${data.createUsers[2].friend.id}" } } } },
        { data: { name: "C1" } }
      ]) {
        id name friend { id name }
      }
    }`,
  });
  expect(data2.createUsers[0].name).toEqual('D');
  expect(data2.createUsers[0].friend.name).toEqual('B1');
  expect(data2.createUsers[1].name).toEqual('C1');

  const users = await context.lists.User.findMany({ query: 'id name friend { id name }' });
  return { users };
};

const getUserAndFriend = async (context: KeystoneContext, userId: IdType, friendId: IdType) => {
  type T = { data: { User: { id: IdType; friend: { id: IdType } }; Friend: { id: IdType } } };
  const { data } = (await context.graphql.raw({
    query: `
  {
    User(where: { id: "${userId}"} ) { id friend { id } }
    Friend: User(where: { id: "${friendId}"} ) { id }
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
            friend: relationship({ ref: 'User' }),
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
                  where: { friend: { name_contains: name } },
                });
                expect(users.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ context }) => {
            await createComplexData(context);
            const users = await context.lists.User.findMany({ where: { friend_is_null: true } });
            expect(users.length).toEqual(5);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ context }) => {
            await createComplexData(context);
            const users = await context.lists.User.findMany({ where: { friend_is_null: false } });
            expect(users.length).toEqual(4);
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
          runner(setupKeystone, async ({ context }) => {
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
          runner(setupKeystone, async ({ context }) => {
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
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { user, friend } = await createUserAndFriend(context);

            // Sanity check the links don't yet exist
            // `...not.toBe(expect.anything())` allows null and undefined values
            expect(user.friend).not.toBe(expect.anything());

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
          })
        );

        test(
          'With disconnect',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(context);

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
          })
        );

        test(
          'With disconnectAll',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(context);

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
          })
        );

        test(
          'With null',
          runner(setupKeystone, async ({ context }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(context);

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
            const { friend, user } = await createUserAndFriend(context);

            // Run the query to disconnect the location from company
            const data = await context.graphql.run({
              query: `mutation { deleteUser(id: "${user.id}") { id } } `,
            });
            expect(data.deleteUser.id).toBe(user.id);

            // Check the link has been broken
            const result = await getUserAndFriend(context, user.id, friend.id);
            expect(result.User).toBe(null);
          })
        );

        ['A', 'B', 'C', 'D', 'E'].forEach(name => {
          test(
            `delete company ${name}`,
            runner(setupKeystone, async ({ context }) => {
              // Setup a complex set of data
              const { users } = await createComplexData(context);

              // Delete company {name}
              const id = users.find(company => company.name === name)?.id;
              const data = await context.graphql.run({
                query: `mutation { deleteUser(id: "${id}") { id } }`,
              });
              expect(data.deleteUser.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const _users = (await context.lists.User.findMany({
                  sortBy: ['name_ASC'],
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
                  sortBy: ['name_ASC'],
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
            runner(setupKeystone, async ({ context }) => {
              // Setup a complex set of data
              const { users } = await createComplexData(context);

              // Delete friend {name}
              const id = users.find(user => user.name === name)?.id;
              const data = await context.graphql.run({
                query: `mutation { deleteUser(id: "${id}") { id } }`,
              });
              expect(data.deleteUser.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const _users = (await context.lists.User.findMany({
                  sortBy: ['name_ASC'],
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
                  sortBy: ['name_ASC'],
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
  })
);
