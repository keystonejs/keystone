const mongoose = require('mongoose');
const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@voussoir/fields');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('@voussoir/test-utils');
const cuid = require('cuid');

const alphanumGenerator = gen.alphaNumString.notEmpty();

// Random IDs
// We wrap in ObjectId / .toString() it because we're hard-coding the IDs, which
// normally would auto-generated, and we need to make sure we have the correct
// format.
const postIds = [
  mongoose.Types.ObjectId('gjfp463bxqtf').toString(),
  mongoose.Types.ObjectId('43cg2hr9tmt3').toString(),
  mongoose.Types.ObjectId('3qr8zpg7n4k6').toString(),
];

function setupKeystone() {
  return setupServer({
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
          content: { type: Text },
        },
        access: {
          // Limit read access to the first post only
          read: { id_in: [postIds[1]] },
        },
      });
    },
  });
}

describe('relationship filtering with access control', () => {
  test(
    'implicitly filters to only the IDs in the database by default',
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
      // Create all of the posts with the given IDs & random content
      await Promise.all(
        postIds.map(id => {
          const postContent = sampleOne(alphanumGenerator);
          return create('PostLimitedRead', { content: postContent, _id: id });
        })
      );

      // Create a user that owns 2 posts which are different from the one
      // specified in the read access control filter
      const username = sampleOne(alphanumGenerator);
      const user = await create('UserToPostLimitedRead', {
        username,
        posts: [postIds[1], postIds[2]],
      });

      // Create an item that does the linking
      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
      // Create all of the posts with the given IDs & random content
      await Promise.all(
        postIds.map(id => {
          const postContent = sampleOne(alphanumGenerator);
          return create('PostLimitedRead', { content: postContent, id: id });
        })
      );

      // Create a user that owns 2 posts which are different from the one
      // specified in the read access control filter
      const username = sampleOne(alphanumGenerator);
      const user = await create('UserToPostLimitedRead', {
        username,
        posts: [postIds[1], postIds[2]],
      });

      // Create an item that does the linking
      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toMatchObject({
        UserToPostLimitedRead: {
          id: expect.any(String),
          username,
          posts: [],
        },
      });
    })
  );
});
