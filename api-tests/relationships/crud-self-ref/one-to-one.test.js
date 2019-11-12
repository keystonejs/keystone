const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

jest.setTimeout(6000000);

const createInitialData = async keystone => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
mutation {
  createUsers(data: [{ data: { name: "${sampleOne(
    alphanumGenerator
  )}" } }, { data: { name: "${sampleOne(alphanumGenerator)}" } }, { data: { name: "${sampleOne(
      alphanumGenerator
    )}" } }]) { id }
}
`,
  });
  return { users: data.createUsers };
};

const createUserAndFriend = async keystone => {
  const {
    data: { createUser },
  } = await graphqlRequest({
    keystone,
    query: `
mutation {
  createUser(data: {
    friend: { create: { name: "${sampleOne(alphanumGenerator)}" } }
  }) { id friend { id } }
}`,
  });
  const { User, Friend } = await getUserAndFriend(keystone, createUser.id, createUser.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());
  expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

  return { user: createUser, friend: createUser.friend };
};

const getUserAndFriend = async (keystone, userId, friendId) => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
  {
    User(where: { id: "${userId}"} ) { id friend { id } }
    Friend: User(where: { id: "${friendId}"} ) { id friendOf { id } }
  }`,
  });
  return data;
};

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    // 1:1 relationships are symmetric in how they behave, but
    // are (in general) implemented in a non-symmetric way. For example,
    // in postgres we may decide to store a single foreign key on just
    // one of the tables involved. As such, we want to ensure that our
    // tests work correctly no matter which side of the relationship is
    // defined first.
    const createListsLR = keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          friend: { type: Relationship, ref: 'User.friendOf' },
          friendOf: { type: Relationship, ref: 'User.friend' },
        },
      });
    };
    const createListsRL = keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          friendOf: { type: Relationship, ref: 'User.friend' },
          friend: { type: Relationship, ref: 'User.friendOf' },
        },
      });
    };

    [
      [createListsLR, 'Left -> Right'],
      [createListsRL, 'Right -> Left'],
    ].forEach(([createLists, order]) => {
      describe(`One-to-one relationships - ${order}`, () => {
        function setupKeystone(adapterName) {
          return setupServer({
            adapterName,
            name: `ks5-testdb-${cuid()}`,
            createLists,
          });
        }

        describe('Create', () => {
          test(
            'With connect',
            runner(setupKeystone, async ({ keystone }) => {
              const { users } = await createInitialData(keystone);
              const user = users[0];
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friend: { connect: { id: "${user.id}" } }
                  }) { id friend { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.createUser.friend.id.toString()).toEqual(user.id);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                user.id
              );
              // Everything should now be connected
              expect(User.friend.id.toString()).toBe(Friend.id.toString());
              expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const friendName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" } }
                  }) { id friend { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
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
            runner(setupKeystone, async ({ keystone }) => {
              const { users } = await createInitialData(keystone);
              const user = users[0];
              const friendName = sampleOne(alphanumGenerator);

              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" friendOf: { connect: { id: "${user.id}" } } } }
                  }) { id friend { id friendOf { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                data.createUser.friend.id
              );
              // Everything should now be connected
              expect(User.friend.id.toString()).toBe(Friend.id.toString());
              expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

              const {
                data: { allUsers },
              } = await graphqlRequest({
                keystone,
                query: `{ allUsers { id friend { id friendOf { id }} } }`,
              });

              // The nested company should not have a location
              expect(allUsers.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(
                User.id
              );
              allUsers
                .filter(({ id }) => id !== User.id)
                .forEach(user => {
                  expect(user.friend).toBe(null);
                });
            })
          );

          test(
            'With nested create',
            runner(setupKeystone, async ({ keystone }) => {
              const friendName = sampleOne(alphanumGenerator);
              const friendOfName = sampleOne(alphanumGenerator);

              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friend: { create: { name: "${friendName}" friendOf: { create: { name: "${friendOfName}" } } } }
                  }) { id friend { id friendOf { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                data.createUser.friend.id
              );
              // Everything should now be connected
              expect(User.friend.id.toString()).toBe(Friend.id.toString());
              expect(Friend.friendOf.id.toString()).toBe(User.id.toString());

              // The nested company should not have a location
              const {
                data: { allUsers },
              } = await graphqlRequest({
                keystone,
                query: `{ allUsers { id friend { id friendOf { id }} } }`,
              });
              expect(allUsers.filter(({ id }) => id === User.id)[0].friend.friendOf.id).toEqual(
                User.id
              );
              allUsers
                .filter(({ id }) => id !== User.id)
                .forEach(user => {
                  expect(user.friend).toBe(null);
                });
            })
          );
        });

        describe('Update', () => {
          test(
            'With connect',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { user, friend } = await createUserAndFriend(keystone);

              // Sanity check the links don't yet exist
              // `...not.toBe(expect.anything())` allows null and undefined values
              expect(user.friend).not.toBe(expect.anything());
              expect(friend.friendOf).not.toBe(expect.anything());

              const { errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { connect: { id: "${friend.id}" } } }
                  ) { id friend { id } } }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(keystone, user.id, friend.id);
              // Everything should now be connected
              expect(User.friend.id.toString()).toBe(Friend.id.toString());
              expect(Friend.friendOf.id.toString()).toBe(User.id.toString());
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const { users } = await createInitialData(keystone);
              let user = users[0];
              const friendName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { create: { name: "${friendName}" } } }
                  ) { id friend { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
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
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { user, friend } = await createUserAndFriend(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { disconnect: { id: "${friend.id}" } } }
                  ) { id friend { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateUser.id).toEqual(user.id);
              expect(data.updateUser.friend).toBe(null);

              // Check the link has been broken
              const result = await getUserAndFriend(keystone, user.id, friend.id);
              expect(result.User.friend).toBe(null);
              expect(result.Friend.friendOf).toBe(null);
            })
          );

          test(
            'With disconnectAll',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { user, friend } = await createUserAndFriend(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friend: { disconnectAll: true } }
                  ) { id friend { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateUser.id).toEqual(user.id);
              expect(data.updateUser.friend).toBe(null);

              // Check the link has been broken
              const result = await getUserAndFriend(keystone, user.id, friend.id);
              expect(result.User.friend).toBe(null);
              expect(result.Friend.friendOf).toBe(null);
            })
          );
        });

        describe('Delete', () => {
          test(
            'delete',
            runner(setupKeystone, async ({ keystone }) => {
              // Manually setup a connected Company <-> Location
              const { user, friend } = await createUserAndFriend(keystone);

              // Run the query to disconnect the location from company
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `mutation { deleteUser(id: "${user.id}") { id } } `,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteUser.id).toBe(user.id);

              // Check the link has been broken
              const result = await getUserAndFriend(keystone, user.id, friend.id);
              expect(result.User).toBe(null);
              expect(result.Friend.friendOf).toBe(null);
            })
          );
        });
      });
    });
  })
);
