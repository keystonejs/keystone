const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItem } = require('@keystonejs/server-side-graphql-client');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          posts: { type: Relationship, ref: 'Post', many: true },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
        },
      });

      keystone.createList('Post', {
        fields: {
          content: { type: Text },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('relationship filtering', () => {
      test(
        'nested to-single relationships can be filtered within AND clause',
        runner(setupKeystone, async ({ keystone }) => {
          const company = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'Thinkmill' },
          });
          const otherCompany = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'Cete' },
          });

          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { company: { connect: { id: company.id } } },
          });
          await createItem({
            keystone,
            listKey: 'User',
            item: { company: { connect: { id: otherCompany.id } } },
          });

          const { data, errors } = await keystone.executeGraphQL({
            query: `
        query {
          allUsers(where: {
            AND: [
              { company: { name_contains: "in" } },
              { company: { name_contains: "ll" } }
            ]
          }) {
            id
            company {
              id
              name
            }
          }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(1);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                company: {
                  id: company.id,
                  name: 'Thinkmill',
                },
              },
            ],
          });
        })
      );

      test(
        'nested to-single relationships can be filtered within OR clause',
        runner(setupKeystone, async ({ keystone }) => {
          const company = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'Thinkmill' },
          });
          const otherCompany = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'Cete' },
          });

          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { company: { connect: { id: company.id } } },
          });
          await createItem({
            keystone,
            listKey: 'User',
            item: { company: { connect: { id: otherCompany.id } } },
          });

          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            allUsers(where: {
              OR: [
                { company: { name_contains: "in" } },
                { company: { name_contains: "xx" } }
              ]
            }) {
              id
              company {
                id
                name
              }
            }
          }
        `,
          });

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(1);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                company: {
                  id: company.id,
                  name: 'Thinkmill',
                },
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationships can be filtered within AND clause',
        runner(setupKeystone, async ({ keystone }) => {
          const ids = [];

          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'Hello world' } })).id
          );
          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'hi world' } })).id
          );
          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'Hello? Or hi?' } })).id
          );

          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { posts: { connect: ids.map(id => ({ id })) } },
          });

          // Create a dummy user to make sure we're actually filtering it out
          await createItem({ keystone, listKey: 'User', item: {} });

          const { data, errors } = await keystone.executeGraphQL({
            query: `
        query {
          allUsers(where: {
            AND: [
              { posts_some: { content_contains: "hi" } },
              { posts_some: { content_contains: "lo" } }
            ]
          }) {
            id
            posts {
              id
              content
            }
          }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toHaveLength(1);
          expect(data.allUsers[0].id).toEqual(user.id);
          expect(data.allUsers[0].posts).toHaveLength(3);
          expect(data.allUsers[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort());
        })
      );

      test(
        'nested to-many relationships can be filtered within OR clause',
        runner(setupKeystone, async ({ keystone }) => {
          const ids = [];

          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'Hello world' } })).id
          );
          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'hi world' } })).id
          );
          ids.push(
            (await createItem({ keystone, listKey: 'Post', item: { content: 'Hello? Or hi?' } })).id
          );

          const user = await createItem({
            keystone,
            listKey: 'User',
            item: { posts: { connect: ids.map(id => ({ id })) } },
          });

          // Create a dummy user to make sure we're actually filtering it out
          await createItem({ keystone, listKey: 'User', item: {} });

          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            allUsers(where: {
              OR: [
                { posts_some: { content_contains: "o w" } },
                { posts_some: { content_contains: "? O" } }
              ]
            }) {
              id
              posts {
                id
                content
              }
            }
          }
        `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toHaveLength(1);
          expect(data.allUsers[0].id).toEqual(user.id);
          expect(data.allUsers[0].posts).toHaveLength(3);
          expect(data.allUsers[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort());
        })
      );

      test(
        'many-to-many filtering composes with one-to-many filtering',
        runner(setupKeystone, async ({ keystone }) => {
          const adsCompany = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'AdsAdsAds' },
            returnFields: 'id name',
          });
          const otherCompany = await createItem({
            keystone,
            listKey: 'Company',
            item: { name: 'Thinkmill' },
            returnFields: 'id name',
          });

          // Content can have multiple authors
          const spam1 = await createItem({ keystone, listKey: 'Post', item: { content: 'spam' } });
          const spam2 = await createItem({ keystone, listKey: 'Post', item: { content: 'spam' } });
          const content = await createItem({
            keystone,
            listKey: 'Post',
            item: { content: 'cute cat pics' },
          });

          const spammyUser = await createItem({
            keystone,
            listKey: 'User',
            item: {
              company: { connect: { id: adsCompany.id } },
              posts: { connect: [{ id: spam1.id }, { id: spam2.id }] },
            },
          });
          const mixedUser = await createItem({
            keystone,
            listKey: 'User',
            item: {
              company: { connect: { id: adsCompany.id } },
              posts: { connect: [{ id: spam1.id }, { id: content.id }] },
            },
          });
          const nonSpammyUser = await createItem({
            keystone,
            listKey: 'User',
            item: {
              company: { connect: { id: adsCompany.id } },
              posts: { connect: [{ id: content.id }] },
            },
          });
          const quietUser = await createItem({
            keystone,
            listKey: 'User',
            item: { company: { connect: { id: adsCompany.id } } },
          });
          await createItem({
            keystone,
            listKey: 'User',
            item: {
              company: { connect: { id: otherCompany.id } },
              posts: { connect: [{ id: content.id }] },
            },
          });
          await createItem({
            keystone,
            listKey: 'User',
            item: {
              company: { connect: { id: otherCompany.id } },
              posts: { connect: [{ id: spam1.id }] },
            },
          });

          // adsCompany users whose every post is spam
          // NB: this includes users who have no posts at all
          let { data, errors } = await keystone.executeGraphQL({
            query: `
        query {
          allUsers(where: {
            company: { name: "${adsCompany.name}" }
            posts_every: { content: "spam" }
          }) {
            id
            company {
              id
              name
            }
            posts {
              content
            }
          }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data.allUsers.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
          expect(data.allUsers.map(u => u.id).sort()).toEqual([spammyUser.id, quietUser.id].sort());
          expect(data.allUsers.map(u => u.posts.every(p => p.content === 'spam'))).toEqual([
            true,
            true,
          ]);

          // adsCompany users with no spam
          ({ data, errors } = await keystone.executeGraphQL({
            query: `
        query {
          allUsers(where: {
            company: { name: "${adsCompany.name}" }
            posts_none: { content: "spam" }
          }) {
            id
            company {
              id
              name
            }
            posts {
              content
            }
          }
        }
      `,
          }));

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data.allUsers.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
          expect(data.allUsers.map(u => u.id).sort()).toEqual(
            [nonSpammyUser.id, quietUser.id].sort()
          );
          expect(data.allUsers.map(u => u.posts.every(p => p.content !== 'spam'))).toEqual([
            true,
            true,
          ]);

          // adsCompany users with some spam
          ({ data, errors } = await keystone.executeGraphQL({
            query: `
        query {
          allUsers(where: {
            company: { name: "${adsCompany.name}" }
            posts_some: { content: "spam" }
          }) {
            id
            company {
              id
              name
            }
            posts {
              content
            }
          }
        }
      `,
          }));

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data.allUsers.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
          expect(data.allUsers.map(u => u.id).sort()).toEqual([mixedUser.id, spammyUser.id].sort());
          expect(data.allUsers.map(u => u.posts.some(p => p.content === 'spam'))).toEqual([
            true,
            true,
          ]);
        })
      );
    });
  })
);
