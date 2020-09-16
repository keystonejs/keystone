const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItem, createItems } = require('@keystonejs/server-side-graphql-client');

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
      });

      keystone.createList('User', {
        fields: {
          name: { type: Text },
          feed: { type: Relationship, ref: 'Post', many: true },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Querying with relationship filters', () => {
      describe('to-single', () => {
        test(
          'with data',
          runner(setupKeystone, async ({ keystone }) => {
            // Create an item to link against
            const users = await createItems({
              keystone,
              listKey: 'User',
              items: [
                { data: { name: 'Jess' } },
                { data: { name: 'Johanna' } },
                { data: { name: 'Sam' } },
              ],
            });
            const posts = await createItems({
              keystone,
              listKey: 'Post',
              items: [
                {
                  data: {
                    author: { connect: { id: users[0].id } },
                    title: sampleOne(alphanumGenerator),
                  },
                },
                {
                  data: {
                    author: { connect: { id: users[1].id } },
                    title: sampleOne(alphanumGenerator),
                  },
                },
                {
                  data: {
                    author: { connect: { id: users[2].id } },
                    title: sampleOne(alphanumGenerator),
                  },
                },
                {
                  data: {
                    author: { connect: { id: users[0].id } },
                    title: sampleOne(alphanumGenerator),
                  },
                },
              ],
              returnFields: 'id title',
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allPosts(where: {
              author: { name_contains: "J" }
            }) {
              id
              title
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allPosts');
            expect(data.allPosts).toHaveLength(3);

            const { allPosts } = data;

            // We don't know the order, so we have to check individually
            expect(allPosts).toContainEqual({ id: posts[0].id, title: posts[0].title });
            expect(allPosts).toContainEqual({ id: posts[1].id, title: posts[1].title });
            expect(allPosts).toContainEqual({ id: posts[3].id, title: posts[3].title });
          })
        );

        test(
          'without data',
          runner(setupKeystone, async ({ keystone }) => {
            // Create an item to link against
            const user = await createItem({ keystone, listKey: 'User', item: { name: 'Jess' } });
            const posts = await createItems({
              keystone,
              listKey: 'Post',
              items: [
                {
                  data: {
                    author: { connect: { id: user.id } },
                    title: sampleOne(alphanumGenerator),
                  },
                },
                { data: { title: sampleOne(alphanumGenerator) } },
              ],
              returnFields: 'id title',
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allPosts(where: {
              author: { name_contains: "J" }
            }) {
              id
              title
              author {
                id
                name
              }
            }
          }
      `,
            });

            expect(data).toMatchObject({
              allPosts: [{ id: posts[0].id, title: posts[0].title }],
            });
            expect(errors).toBe(undefined);
          })
        );
      });

      describe('to-many', () => {
        const setup = async create => {
          const posts = await Promise.all([
            create('Post', { title: 'Hello' }),
            create('Post', { title: 'Just in time' }),
            create('Post', { title: 'Bye' }),
            create('Post', { title: 'I like Jelly' }),
          ]);

          const users = await Promise.all([
            create('User', {
              feed: { connect: [{ id: posts[0].id }, { id: posts[1].id }] },
              name: sampleOne(alphanumGenerator),
            }),
            create('User', {
              feed: { connect: [{ id: posts[2].id }] },
              name: sampleOne(alphanumGenerator),
            }),
            create('User', {
              feed: { connect: [{ id: posts[3].id }] },
              name: sampleOne(alphanumGenerator),
            }),
          ]);

          return { posts, users };
        };

        test(
          '_every condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_every: { title_contains: "J" }
            }) {
              id
              name
              feed {
                id
                title
              }
            }
          }
      `,
            });

            expect(data).toMatchObject({
              allUsers: [{ id: users[2].id, feed: [{ title: 'I like Jelly' }] }],
            });
            expect(errors).toBe(undefined);
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // SOME
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_some: { title_contains: "J" }
            }) {
              id
              feed(sortBy: title_ASC) {
                title
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toHaveLength(2);

            const { allUsers } = data;

            // We don't know the order, so we have to check individually
            expect(allUsers).toContainEqual({
              id: users[0].id,
              feed: [{ title: 'Hello' }, { title: 'Just in time' }],
            });
            expect(allUsers).toContainEqual({ id: users[2].id, feed: [{ title: 'I like Jelly' }] });
          })
        );

        test(
          '_none condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // NONE
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_none: { title_contains: "J" }
            }) {
              id
              name
              feed {
                id
                title
              }
            }
          }
      `,
            });

            expect(data).toMatchObject({
              allUsers: [{ id: users[1].id, feed: [{ title: 'Bye' }] }],
            });
            expect(errors).toBe(undefined);
          })
        );
      });

      describe('to-many with empty list', () => {
        const setup = async create => {
          const posts = await Promise.all([
            create('Post', { title: 'Hello' }),
            create('Post', { title: 'I like Jelly' }),
          ]);

          const users = await Promise.all([
            create('User', {
              feed: { connect: [{ id: posts[0].id }, { id: posts[1].id }] },
              name: sampleOne(alphanumGenerator),
            }),
            create('User', {
              feed: { connect: [{ id: posts[0].id }] },
              name: sampleOne(alphanumGenerator),
            }),
            create('User', { name: sampleOne(alphanumGenerator) }),
            create('User', { name: sampleOne(alphanumGenerator) }),
          ]);

          return { posts, users };
        };

        test(
          '_every condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_every: { title_contains: "J" }
            }) {
              id
              feed {
                id
                title
              }
            }
          }
      `,
            });
            expect(data.allUsers).toHaveLength(2);
            expect(data.allUsers).toContainEqual({ id: users[2].id, feed: [] });
            expect(data.allUsers).toContainEqual({ id: users[3].id, feed: [] });
            expect(errors).toBe(undefined);
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // SOME
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_some: { title_contains: "J" }
            }) {
              id
              name
              feed(sortBy: title_ASC) {
                id
                title
              }
            }
          }
      `,
            });

            expect(data).toMatchObject({
              allUsers: [
                { id: users[0].id, feed: [{ title: 'Hello' }, { title: 'I like Jelly' }] },
              ],
            });
            expect(data.allUsers).toHaveLength(1);
            expect(errors).toBe(undefined);
          })
        );

        test(
          '_none condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // NONE
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_none: { title_contains: "J" }
            },
            sortBy: id_ASC) {
              id
              feed {
                title
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toHaveLength(3);

            const { allUsers } = data;

            // We don't know the order, so we have to check individually
            expect(allUsers).toContainEqual({ id: users[1].id, feed: [{ title: 'Hello' }] });
            expect(allUsers).toContainEqual({ id: users[2].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[3].id, feed: [] });
          })
        );
      });

      describe('to-many with empty related list', () => {
        const setup = async create => {
          const users = await Promise.all([
            create('User', { name: sampleOne(alphanumGenerator) }),
            create('User', { name: sampleOne(alphanumGenerator) }),
            create('User', { name: sampleOne(alphanumGenerator) }),
            create('User', { name: sampleOne(alphanumGenerator) }),
          ]);

          return { users };
        };

        test(
          '_every condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_every: { title_contains: "J" }
            }) {
              id
              feed {
                id
                title
              }
            }
          }
      `,
            });
            const { allUsers } = data;
            expect(allUsers).toHaveLength(4);

            // We don't know the order, so we have to check individually
            expect(allUsers).toContainEqual({ id: users[0].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[1].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[2].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[3].id, feed: [] });
            expect(errors).toBe(undefined);
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // SOME
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_some: { author: { id: "${users[0].id}"} }
            }) {
              id
              name
              feed {
                id
                title
              }
            }
          }
      `,
            });
            expect(data).toMatchObject({ allUsers: [] });
            expect(data.allUsers).toHaveLength(0);
            expect(errors).toBe(undefined);
          })
        );

        test(
          '_none condition',
          runner(setupKeystone, async ({ keystone }) => {
            const create = async (listKey, item) => createItem({ keystone, listKey, item });
            const { users } = await setup(create);

            // NONE
            const { data, errors } = await keystone.executeGraphQL({
              query: `
          query {
            allUsers(where: {
              feed_none: { title_contains: "J" }
            }) {
              id
              feed {
                title
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toHaveLength(4);

            const { allUsers } = data;

            // We don't know the order, so we have to check individually
            expect(allUsers).toContainEqual({ id: users[0].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[1].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[2].id, feed: [] });
            expect(allUsers).toContainEqual({ id: users[3].id, feed: [] });
          })
        );
      });
    });
  })
);
