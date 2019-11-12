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
    friends: { create: [{ name: "${sampleOne(alphanumGenerator)}" }] }
  }) { id friends { id } }
}`,
  });
  const { User, Friend } = await getUserAndFriend(
    keystone,
    createUser.id,
    createUser.friends[0].id
  );

  // Sanity check the links are setup correctly
  expect(User.friends[0].id.toString()).toBe(Friend.id.toString());
  expect(Friend.friendOf[0].id.toString()).toBe(User.id.toString());

  return { user: createUser, friend: createUser.friends[0] };
};

const getUserAndFriend = async (keystone, userId, friendId) => {
  const { data } = await graphqlRequest({
    keystone,
    query: `
  {
    User(where: { id: "${userId}"} ) { id friends { id } }
    Friend: User(where: { id: "${friendId}"} ) { id friendOf { id } }
  }`,
  });
  return data;
};

const createReadData = async keystone => {
  // create locations [A, A, B, B, C, C];
  const { data } = await graphqlRequest({
    keystone,
    query: `mutation create($users: [UsersCreateInput]) { createUsers(data: $users) { id name } }`,
    variables: {
      users: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E'].map(name => ({ data: { name } })),
    },
  });
  const { createUsers } = data;
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
      const { data } = await graphqlRequest({
        keystone,
        query: `mutation update($friends: [UserWhereUniqueInput], $user: ID!) { updateUser(id: $user data: {
    friends: { connect: $friends }
  }) { id friends { name }}}`,
        variables: { friends: ids, user: createUsers[j].id },
      });
      return data.updateUser;
    })
  );
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
          friends: { type: Relationship, ref: 'User.friendOf', many: true },
          friendOf: { type: Relationship, ref: 'User.friends', many: true },
        },
      });
    };
    const createListsRL = keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          friendOf: { type: Relationship, ref: 'User.friends', many: true },
          friends: { type: Relationship, ref: 'User.friendOf', many: true },
        },
      });
    };
    [
      [createListsLR, 'Left -> Right'],
      [createListsRL, 'Right -> Left'],
    ].forEach(([createLists, order]) => {
      describe(`Many-to-many relationships - ${order}`, () => {
        function setupKeystone(adapterName) {
          return setupServer({
            adapterName,
            name: `ks5-testdb-${cuid()}`,
            createLists,
          });
        }

        describe('Read', () => {
          test(
            '_some',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 6],
                  ['B', 5],
                  ['C', 3],
                  ['D', 0],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allUsers(where: { friends_some: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allUsers.length).toEqual(count);
                })
              );
            })
          );
          test(
            '_none',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 3],
                  ['B', 4],
                  ['C', 6],
                  ['D', 9],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allUsers(where: { friends_none: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allUsers.length).toEqual(count);
                })
              );
            })
          );
          test(
            '_every',
            runner(setupKeystone, async ({ keystone }) => {
              await createReadData(keystone);
              await Promise.all(
                [
                  ['A', 3],
                  ['B', 3],
                  ['C', 1],
                  ['D', 1],
                ].map(async ([name, count]) => {
                  const { data } = await graphqlRequest({
                    keystone,
                    query: `{ allUsers(where: { friends_every: { name: "${name}"}}) { id }}`,
                  });
                  expect(data.allUsers.length).toEqual(count);
                })
              );
            })
          );
        });

        describe('Create', () => {
          test(
            'With connect',
            runner(setupKeystone, async ({ keystone }) => {
              const { users } = await createInitialData(keystone);
              const friend = users[0];
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friends: { connect: [{ id: "${friend.id}" }] }
                  }) { id friends { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.createUser.friends[0].id.toString()).toEqual(friend.id);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                friend.id
              );

              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const locationName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friends: { create: [{ name: "${locationName}" }] }
                  }) { id friends { id } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                data.createUser.friends[0].id
              );

              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
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
                    friends: { create: [{ name: "${friendName}" friendOf: { connect: [{ id: "${user.id}" }] } }] }
                  }) { id friends { id friendOf { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                data.createUser.friends[0].id
              );
              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.length).toEqual(2);

              const {
                data: { allUsers },
              } = await graphqlRequest({
                keystone,
                query: `{ allUsers { id friends { id friendOf { id } } } }`,
              });

              // Both companies should have a location, and the location should have two companies
              const linkedUsers = allUsers.filter(({ id }) => id === user.id || id === User.id);
              linkedUsers.forEach(({ friends }) => {
                expect(friends.map(({ id }) => id)).toEqual([Friend.id.toString()]);
              });
              expect(linkedUsers[0].friends[0].friendOf).toEqual([
                { id: linkedUsers[0].id },
                { id: linkedUsers[1].id },
              ]);
            })
          );

          test(
            'With nested create',
            runner(setupKeystone, async ({ keystone }) => {
              const friendName = sampleOne(alphanumGenerator);
              const userName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  createUser(data: {
                    friends: { create: [{ name: "${friendName}" friendOf: { create: [{ name: "${userName}" }] } }] }
                  }) { id friends { id friendOf { id } } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                data.createUser.id,
                data.createUser.friends[0].id
              );

              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.length).toEqual(2);

              // Both companies should have a location, and the location should have two companies
              const {
                data: { allUsers },
              } = await graphqlRequest({
                keystone,
                query: `{ allUsers { id friends { id friendOf { id } } } }`,
              });
              allUsers.forEach(({ id, friends }) => {
                if (id === Friend.id) {
                  expect(friends.map(({ id }) => id)).toEqual([]);
                } else {
                  expect(friends.map(({ id }) => id)).toEqual([Friend.id.toString()]);
                }
              });
              expect(allUsers[0].friends[0].friendOf).toEqual([
                { id: allUsers[0].id },
                { id: allUsers[2].id },
              ]);
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
              expect(user.friends).not.toBe(expect.anything());
              expect(friend.friendOf).not.toBe(expect.anything());

              const { errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { connect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id } } }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(keystone, user.id, friend.id);
              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
            })
          );

          test(
            'With create',
            runner(setupKeystone, async ({ keystone }) => {
              const { users } = await createInitialData(keystone);
              let user = users[0];
              const locationName = sampleOne(alphanumGenerator);
              const { data, errors } = await graphqlRequest({
                keystone,
                query: `
                mutation {
                  updateUser(
                    id: "${user.id}",
                    data: { friends: { create: [{ name: "${locationName}" }] } }
                  ) { id friends { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);

              const { User, Friend } = await getUserAndFriend(
                keystone,
                user.id,
                data.updateUser.friends[0].id
              );

              // Everything should now be connected
              expect(User.friends.map(({ id }) => id.toString())).toEqual([Friend.id.toString()]);
              expect(Friend.friendOf.map(({ id }) => id.toString())).toEqual([User.id.toString()]);
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
                    data: { friends: { disconnect: [{ id: "${friend.id}" }] } }
                  ) { id friends { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateUser.id).toEqual(user.id);
              expect(data.updateUser.friends).toEqual([]);

              // Check the link has been broken
              const result = await getUserAndFriend(keystone, user.id, friend.id);
              expect(result.User.friends).toEqual([]);
              expect(result.Friend.friendOf).toEqual([]);
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
                    data: { friends: { disconnectAll: true } }
                  ) { id friends { id name } }
                }
            `,
              });
              expect(errors).toBe(undefined);
              expect(data.updateUser.id).toEqual(user.id);
              expect(data.updateUser.friends).toEqual([]);

              // Check the link has been broken
              const result = await getUserAndFriend(keystone, user.id, friend.id);
              expect(result.User.friends).toEqual([]);
              expect(result.Friend.friendOf).toEqual([]);
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
              expect(result.Friend.friendOf).toEqual([]);
            })
          );
        });
      });
    });
  })
);
