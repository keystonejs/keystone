const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const {
  multiAdapterRunners,
  setupServer,
  networkedGraphqlRequest,
} = require('@keystonejs/test-utils');
const cuid = require('cuid');

const alphanumGenerator = gen.alphaNumString.notEmpty();

const postNames = ['Post 1', 'Post 2', 'Post 3'];

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('UserToPostLimitedRead', {
        fields: {
          username: { type: Text },
          posts: { type: Relationship, ref: 'PostLimitedRead', many: true },
        },
      });

      keystone.createList('PostLimitedRead', {
        fields: {
          name: { type: Text },
          content: { type: Text },
        },
        access: {
          // Limit read access to the first post only
          read: { name_in: [postNames[1]] },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('relationship filtering with access control', () => {
      test(
        'implicitly filters to only the IDs in the database by default',
        runner(setupKeystone, async ({ app, create }) => {
          // Create all of the posts with the given IDs & random content
          const posts = await Promise.all(
            postNames.map(name => {
              const postContent = sampleOne(alphanumGenerator);
              return create('PostLimitedRead', { content: postContent, name });
            })
          );
          const postIds = posts.map(({ id }) => id);
          // Create a user that owns 2 posts which are different from the one
          // specified in the read access control filter
          const username = sampleOne(alphanumGenerator);
          const user = await create('UserToPostLimitedRead', {
            username,
            posts: [postIds[1], postIds[2]],
          });

          // Create an item that does the linking
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                UserToPostLimitedRead(where: { id: "${user.id}" }) {
                  id
                  username
                  posts {
                    id
                  }
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            UserToPostLimitedRead: {
              id: expect.any(String),
              username,
              posts: [{ id: postIds[1] }],
            },
          });
        })
      );

      test(
        'explicitly filters when given a `where` clause',
        runner(setupKeystone, async ({ app, create }) => {
          // Create all of the posts with the given IDs & random content
          const posts = await Promise.all(
            postNames.map(name => {
              const postContent = sampleOne(alphanumGenerator);
              return create('PostLimitedRead', { content: postContent, name });
            })
          );
          const postIds = posts.map(({ id }) => id);
          // Create a user that owns 2 posts which are different from the one
          // specified in the read access control filter
          const username = sampleOne(alphanumGenerator);
          const user = await create('UserToPostLimitedRead', {
            username,
            posts: [postIds[1], postIds[2]],
          });

          // Create an item that does the linking
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                UserToPostLimitedRead(where: { id: "${user.id}" }) {
                  id
                  username
                  # Knowingly filter to an ID I don't have read access to
                  # To see if the filter is correctly "AND"d with the access control
                  posts(where: { id_in: ["${postIds[2]}"] }) {
                    id
                  }
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            UserToPostLimitedRead: {
              id: expect.any(String),
              username,
              posts: [],
            },
          });
        })
      );
    });
  })
);
