import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

const postNames = ['Post 1', 'Post 2', 'Post 3'];

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      UserToPostLimitedRead: list({
        fields: {
          username: text(),
          posts: relationship({ ref: 'PostLimitedRead', many: true }),
        },
      }),
      PostLimitedRead: list({
        fields: {
          name: text({ isFilterable: true }),
          content: text(),
        },
        access: {
          filter: {
            // Limit read access to the first post only
            query: () => ({ name: { in: [postNames[1]] } }),
          },
        },
      }),
    },
  }),
});

describe('relationship filtering with access control', () => {
  test(
    'implicitly filters to only the IDs in the database by default',
    runner(async ({ context }) => {
      // Create all of the posts with the given IDs & random content
      const posts = await Promise.all(
        postNames.map(name => {
          const postContent = sampleOne(alphanumGenerator);
          return context.sudo().lists.PostLimitedRead.createOne({
            data: { content: postContent, name },
          });
        })
      );
      const postIds = posts.map(({ id }) => id);
      // Create a user that owns 2 posts which are different from the one
      // specified in the read access control filter
      const username = sampleOne(alphanumGenerator);
      const user = await context.sudo().lists.UserToPostLimitedRead.createOne({
        data: {
          username,
          posts: { connect: [{ id: postIds[1] }, { id: postIds[2] }] },
        },
      });

      // Create an item that does the linking
      const item = await context.lists.UserToPostLimitedRead.findOne({
        where: { id: user.id },
        query: 'id username posts { id }',
      });

      expect(item).toMatchObject({
        id: expect.any(String),
        username,
        posts: [{ id: postIds[1] }],
      });
    })
  );

  test(
    'explicitly filters when given a `where` clause',
    runner(async ({ context }) => {
      // Create all of the posts with the given IDs & random content
      const posts = await Promise.all(
        postNames.map(name => {
          const postContent = sampleOne(alphanumGenerator);
          return context.sudo().lists.PostLimitedRead.createOne({
            data: { content: postContent, name },
          });
        })
      );
      const postIds = posts.map(({ id }) => id);
      // Create a user that owns 2 posts which are different from the one
      // specified in the read access control filter
      const username = sampleOne(alphanumGenerator);
      const user = await context.sudo().lists.UserToPostLimitedRead.createOne({
        data: {
          username,
          posts: { connect: [{ id: postIds[1] }, { id: postIds[2] }] },
        },
      });

      // Create an item that does the linking
      const item = await context.lists.UserToPostLimitedRead.findOne({
        where: { id: user.id },
        // Knowingly filter to an ID I don't have read access to
        // to see if the filter is correctly "AND"d with the access control
        query: `id username posts(where: { id: { in: ["${postIds[2]}"] } }) { id }`,
      });

      expect(item).toMatchObject({ id: expect.any(String), username, posts: [] });
    })
  );
});
