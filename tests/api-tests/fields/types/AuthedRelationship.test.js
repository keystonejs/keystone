// We don't currently have uniqueness tests for Relationship field types
import { Text, Password } from '@keystonejs/fields';
import { PasswordAuthStrategy } from '@keystonejs/auth-password';
import { multiAdapterRunners, networkedGraphqlRequest, setupServer } from '@keystonejs/test-utils';
import { AuthedRelationship } from '@keystonejs/fields-authed-relationship';
const { createItem } = require('@keystonejs/server-side-graphql-client');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          username: { type: Text },
          password: { type: Password },
        },
      });

      keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        config: {
          identityField: 'username',
          secretField: 'password',
        },
      });
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          // Automatically set to the currently logged in user on create
          author: {
            type: AuthedRelationship,
            ref: 'User',
          },
        },
      });
    },
  });
}

async function login(app, username, password) {
  const { data } = await networkedGraphqlRequest({
    app,
    query: `
      mutation($username: String, $password: String) {
        authenticateUserWithPassword(username: $username, password: $password) {
          token
        }
      }
    `,
    variables: { username, password },
  });
  return data.authenticateUserWithPassword || {};
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Create', () => {
      test(
        'UnAuthenticated User: Should associate "null" author with post',
        runner(setupKeystone, async ({ keystone }) => {
          const post = await createItem({
            keystone,
            listKey: 'Post',
            item: { title: 'post1' },
            returnFields: 'title author { username }',
          });

          // User not logged in yet; author should be null
          expect(post.title).toEqual('post1');
          expect(post.author).toBeNull();
        })
      );
      test(
        'Authenticated User: Should associate authenticated user as "author" with post',
        runner(setupKeystone, async ({ keystone, app }) => {
          // Create a user
          await createItem({
            keystone,
            listKey: 'User',
            item: { username: 'aman', password: 'keystonejs' },
          });
          // Try logging the user
          const { token } = await login(app, 'aman', 'keystonejs');
          expect(token).toBeTruthy();

          // Try to create a Post after user is logged in
          const { data, errors } = await networkedGraphqlRequest({
            app,
            headers: { Authorization: `Bearer ${token}` },
            query: `
              mutation($title: String) {
                createPost(data: {title: $title}) {
                  title
                  author { username }
                }
              }`,
            variables: { title: 'Post with logged in user' },
          });

          expect(errors).toBe(undefined);
          expect(data.createPost.title).toEqual('Post with logged in user');
          expect(data.createPost.author).not.toBe(null);
          expect(data.createPost.author.username).toBe('aman');
        })
      );
    });
  })
);
