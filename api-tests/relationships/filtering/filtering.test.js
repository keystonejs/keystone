const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
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
        runner(setupKeystone, async ({ keystone, create }) => {
          const company = await create('Company', { name: 'Thinkmill' });
          const otherCompany = await create('Company', { name: 'Cete' });

          const user = await create('User', { company: company.id });
          await create('User', { company: otherCompany.id });

          const { data, errors } = await graphqlRequest({
            keystone,
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
        runner(setupKeystone, async ({ keystone, create }) => {
          const company = await create('Company', { name: 'Thinkmill' });
          const otherCompany = await create('Company', { name: 'Cete' });

          const user = await create('User', { company: company.id });
          await create('User', { company: otherCompany.id });

          const { data, errors } = await graphqlRequest({
            keystone,
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
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          await create('User', { posts: [] });

          const { data, errors } = await graphqlRequest({
            keystone,
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
          expect(data.allUsers[0].posts).toHaveLength(3);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: [{ id: ids[0] }, { id: ids[1] }, { id: ids[2] }],
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationships can be filtered within OR clause',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          await create('User', { posts: [] });

          const { data, errors } = await graphqlRequest({
            keystone,
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
          expect(data.allUsers[0].posts).toHaveLength(3);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: [{ id: ids[0] }, { id: ids[1] }, { id: ids[2] }],
              },
            ],
          });
        })
      );

      test(
        'many-to-many filtering composes with one-to-many filtering',
        runner(setupKeystone, async ({ keystone, create }) => {
          const adsCompany = await create('Company', { name: 'AdsAdsAds' });
          const otherCompany = await create('Company', { name: 'Thinkmill' });

          // Content can have multiple authors
          const spam1 = await create('Post', { content: 'spam' });
          const spam2 = await create('Post', { content: 'spam' });
          const content = await create('Post', { content: 'cute cat pics' });

          const spammyUser = await create('User', {
            company: adsCompany.id,
            posts: [spam1.id, spam2.id],
          });
          const mixedUser = await create('User', {
            company: adsCompany.id,
            posts: [spam1.id, content.id],
          });
          const nonSpammyUser = await create('User', {
            company: adsCompany.id,
            posts: [content.id],
          });
          const quietUser = await create('User', { company: adsCompany.id, posts: [] });
          await create('User', { company: otherCompany.id, posts: [content.id] });
          await create('User', {
            company: otherCompany.id,
            posts: [spam1.id],
          });

          // adsCompany users whose every post is spam
          // NB: this includes users who have no posts at all
          let { data, errors } = await graphqlRequest({
            keystone,
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
          ({ data, errors } = await graphqlRequest({
            keystone,
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
          ({ data, errors } = await graphqlRequest({
            keystone,
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
