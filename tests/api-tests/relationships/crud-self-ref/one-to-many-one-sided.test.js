const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

const createInitialData = async keystone => {
  const { data, errors } = await keystone.executeGraphQL({
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

const createUserAndFriend = async keystone => {
  const {
    data: { createUser },
    errors,
  } = await keystone.executeGraphQL({
    query: `
      mutation {
        createUser(data: {
          friend: { create: { name: "${sampleOne(alphanumGenerator)}" } }
        }) { id friend { id } }
      }`,
  });
  expect(errors).toBe(undefined);
  const { User, Friend } = await getUserAndFriend(keystone, createUser.id, createUser.friend.id);

  // Sanity check the links are setup correctly
  expect(User.friend.id.toString()).toBe(Friend.id.toString());

  return { user: createUser, friend: createUser.friend };
};

const createComplexData = async keystone => {
  const { data, errors } = await keystone.executeGraphQL({
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
  expect(errors).toBe(undefined);
  expect(data.createUsers[0].name).toEqual('A');
  expect(data.createUsers[0].friend.name).toEqual('A1');
  expect(data.createUsers[1].name).toEqual('B');
  expect(data.createUsers[1].friend.name).toEqual('D1');
  expect(data.createUsers[2].name).toEqual('C');
  expect(data.createUsers[2].friend.name).toEqual('B1');
  expect(data.createUsers[3].name).toEqual('E');
  expect(data.createUsers[3].friend).toBe(null);
  const result = await keystone.executeGraphQL({
    query: `mutation {
      createUsers(data: [
        { data: { name: "D" friend: { connect: { id: "${data.createUsers[2].friend.id}" } } } },
        { data: { name: "C1" } }
      ]) {
        id name friend { id name }
      }
    }`,
  });
  expect(result.errors).toBe(undefined);
  expect(result.data.createUsers[0].name).toEqual('D');
  expect(result.data.createUsers[0].friend.name).toEqual('B1');
  expect(result.data.createUsers[1].name).toEqual('C1');

  const {
    data: { allUsers },
    errors: errors2,
  } = await keystone.executeGraphQL({ query: '{ allUsers { id name friend { id name } } }' });
  expect(errors2).toBe(undefined);
  return { users: allUsers };
};

const getUserAndFriend = async (keystone, userId, friendId) => {
  const { data } = await keystone.executeGraphQL({
    query: `
  {
    User(where: { id: "${userId}"} ) { id friend { id } }
    Friend: User(where: { id: "${friendId}"} ) { id }
  }`,
  });
  return data;
};

const setupKeystone = adapterName =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          friend: { type: Relationship, ref: 'User' },
        },
      });
    },
  });

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe(`One-to-many relationships`, () => {
      describe('Read', () => {
        test(
          'one',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            await Promise.all(
              [
                ['A', 1],
                ['B', 2],
                ['C', 0],
                ['D', 1],
                ['E', 0],
              ].map(async ([name, count]) => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: `{ allUsers(where: { friend: { name_contains: "${name}"}}) { id }}`,
                });
                expect(errors).toBe(undefined);
                expect(data.allUsers.length).toEqual(count);
              })
            );
          })
        );
        test(
          'is_null: true',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
              query: `{ allUsers(where: { friend_is_null: true }) { id }}`,
            });
            expect(errors).toBe(undefined);
            expect(data.allUsers.length).toEqual(5);
          })
        );
        test(
          'is_null: false',
          runner(setupKeystone, async ({ keystone }) => {
            await createComplexData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
              query: `{ allUsers(where: { friend_is_null: false }) { id }}`,
            });
            expect(errors).toBe(undefined);
            expect(data.allUsers.length).toEqual(4);
          })
        );
      });

      describe('Count', () => {
        test(
          'Count',
          runner(setupKeystone, async ({ keystone }) => {
            await createInitialData(keystone);
            const { data, errors } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            const { users } = await createInitialData(keystone);
            const user = users[0];
            const { data, errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createUser(data: {
                    friend: { connect: { id: "${user.id}" } }
                  }) { id friend { id } }
                }
            `,
            });
            expect(errors).toBe(undefined);
            expect(data.createUser.friend.id.toString()).toBe(user.id.toString());

            const { User, Friend } = await getUserAndFriend(keystone, data.createUser.id, user.id);
            // Everything should now be connected
            expect(User.friend.id.toString()).toBe(Friend.id.toString());
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ keystone }) => {
            const friendName = sampleOne(alphanumGenerator);
            const { data, errors } = await keystone.executeGraphQL({
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

            const { errors } = await keystone.executeGraphQL({
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
          })
        );

        test(
          'With create',
          runner(setupKeystone, async ({ keystone }) => {
            const { users } = await createInitialData(keystone);
            let user = users[0];
            const friendName = sampleOne(alphanumGenerator);
            const { data, errors } = await keystone.executeGraphQL({
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
          })
        );

        test(
          'With disconnect',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
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
          })
        );

        test(
          'With disconnectAll',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
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
          })
        );
      });

      describe('Delete', () => {
        test(
          'delete',
          runner(setupKeystone, async ({ keystone }) => {
            // Manually setup a connected Company <-> Location
            const { friend, user } = await createUserAndFriend(keystone);

            // Run the query to disconnect the location from company
            const { data, errors } = await keystone.executeGraphQL({
              query: `mutation { deleteUser(id: "${user.id}") { id } } `,
            });
            expect(errors).toBe(undefined);
            expect(data.deleteUser.id).toBe(user.id);

            // Check the link has been broken
            const result = await getUserAndFriend(keystone, user.id, friend.id);
            expect(result.User).toBe(null);
          })
        );

        ['A', 'B', 'C', 'D', 'E'].forEach(name => {
          test(
            `delete company ${name}`,
            runner(setupKeystone, async ({ keystone }) => {
              // Setup a complex set of data
              const { users } = await createComplexData(keystone);

              // Delete company {name}
              const id = users.find(company => company.name === name).id;
              const { data, errors } = await keystone.executeGraphQL({
                query: `mutation { deleteUser(id: "${id}") { id } }`,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteUser.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: '{ allUsers(sortBy: name_ASC) { id name friend { id name } } }',
                });
                expect(errors).toBe(undefined);
                const users = data.allUsers.filter(({ name }) => name.length === 1);
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
                const { data, errors } = await keystone.executeGraphQL({
                  query: '{ allUsers(sortBy: name_ASC) { id name } }',
                });
                expect(errors).toBe(undefined);
                const friends = data.allUsers.filter(({ name }) => name.length === 2);
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
            runner(setupKeystone, async ({ keystone }) => {
              // Setup a complex set of data
              const { users } = await createComplexData(keystone);

              // Delete friend {name}
              const id = users.find(user => user.name === name).id;
              const { data, errors } = await keystone.executeGraphQL({
                query: `mutation { deleteUser(id: "${id}") { id } }`,
              });
              expect(errors).toBe(undefined);
              expect(data.deleteUser.id).toBe(id);

              // Check all the companies look how we expect
              await (async () => {
                const { data, errors } = await keystone.executeGraphQL({
                  query: '{ allUsers(sortBy: name_ASC) { id name friend { id name } } }',
                });
                expect(errors).toBe(undefined);
                const users = data.allUsers.filter(({ name }) => name.length === 1);
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
                const { data, errors } = await keystone.executeGraphQL({
                  query: '{ allUsers(sortBy: name_ASC) { id name } }',
                });
                expect(errors).toBe(undefined);
                const friends = data.allUsers.filter(({ name }) => name.length === 2);
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
