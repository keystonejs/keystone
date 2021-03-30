import { gen, sampleOne } from 'testcheck';

import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  AdapterName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { createItem, createItems } from '@keystone-next/server-side-graphql-client-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        Post: list({
          fields: {
            title: text(),
            author: relationship({ ref: 'User' }),
          },
        }),
        User: list({
          fields: {
            name: text(),
            feed: relationship({ ref: 'Post', many: true }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Querying with relationship filters', () => {
      describe('to-single', () => {
        test(
          'with data',
          runner(setupKeystone, async ({ context }) => {
            // Create an item to link against
            const users = await createItems({
              context,
              listKey: 'User',
              items: [
                { data: { name: 'Jess' } },
                { data: { name: 'Johanna' } },
                { data: { name: 'Sam' } },
              ],
            });
            const posts = await createItems({
              context,
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
            const data = await context.graphql.run({
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
          runner(setupKeystone, async ({ context }) => {
            // Create an item to link against
            const user = await createItem({ context, listKey: 'User', item: { name: 'Jess' } });
            const posts = await createItems({
              context,
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
            const data = await context.graphql.run({
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
          })
        );
      });

      describe('to-many', () => {
        const setup = async (create: (...args: any) => Promise<any>) => {
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
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const data = await context.graphql.run({
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
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // SOME
            const data = await context.graphql.run({
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
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // NONE
            const data = await context.graphql.run({
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
          })
        );
      });

      describe('to-many with empty list', () => {
        const setup = async (create: (...args: any) => Promise<any>) => {
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
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const data = await context.graphql.run({
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
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // SOME
            const data = await context.graphql.run({
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
          })
        );

        test(
          '_none condition',
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // NONE
            const data = await context.graphql.run({
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
        const setup = async (create: (...args: any) => Promise<any>) => {
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
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // EVERY
            const data = await context.graphql.run({
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
          })
        );

        test(
          '_some condition',
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // SOME
            const data = await context.graphql.run({
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
          })
        );

        test(
          '_none condition',
          runner(setupKeystone, async ({ context }) => {
            const create = async (listKey: string, item: any) =>
              createItem({ context, listKey, item });
            const { users } = await setup(create);

            // NONE
            const data = await context.graphql.run({
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
