const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { Text, Relationship } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const relType = process.env.REL_TYPE || 'one_one_to_many';

const adapter = process.env.MONGO
  ? new MongooseAdapter()
  : new KnexAdapter({
      knexOptions: { connection: 'postgres://keystone5:k3yst0n3@localhost:5432/keystone' },
    });

const keystone = new Keystone({
  name: 'Keystone Relationships',
  adapter,
  onConnect: async keystone => {
    if (!process.env.CREATE_TABLES) {
      const executeQuery = keystone._buildQueryHelper(
        keystone.getGraphQlContext({ skipAccessControl: true, schemaName: 'public' })
      );
      let query;
      if (['one_one_to_many', 'two_one_to_many', 'two_one_to_one'].includes(relType)) {
        query = `
        mutation {
          createPost(
            data: {
              title: "A"
              content: "aaa"
              author: { create: { name: "Alice" } }
            }
          ) {
            id
          }
        }
      `;
      } else if (['one_many_to_many', 'two_many_to_many'].includes(relType)) {
        query = `
        mutation {
          createPost(
            data: {
              title: "A"
              content: "aaa"
              authors: { create: [{ name: "Alice" }, { name: "Bob" }] }
            }
          ) {
            id
          }
        }
      `;
      }
      await executeQuery(query);
      process.exit(0);
    }
  },
});

if (relType === 'one_one_to_many') {
  // One to many (one-sided)
  keystone.createList('User', { fields: { name: { type: Text } } });

  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      content: { type: Text },
      author: { type: Relationship, ref: 'User', many: false },
    },
  });
} else if (relType === 'one_many_to_many') {
  // Many to many (one-sided)
  keystone.createList('User', { fields: { name: { type: Text } } });

  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      content: { type: Text },
      authors: { type: Relationship, ref: 'User', many: true },
    },
  });
} else if (relType === 'two_one_to_many') {
  // One to many (two-sided)
  keystone.createList('User', {
    fields: {
      name: { type: Text },
      posts: { type: Relationship, ref: 'Post.author', many: true },
    },
  });

  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      content: { type: Text },
      author: { type: Relationship, ref: 'User.posts', many: false },
    },
  });
} else if (relType === 'two_many_to_many') {
  // Many to many (two-sided)
  keystone.createList('User', {
    fields: {
      name: { type: Text },
      posts: { type: Relationship, ref: 'Post.authors', many: true },
    },
  });

  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      content: { type: Text },
      authors: { type: Relationship, ref: 'User.posts', many: true },
    },
  });
} else if (relType === 'two_one_to_one') {
  // One to one (two-sided)
  keystone.createList('User', {
    fields: {
      name: { type: Text },
      post: { type: Relationship, ref: 'Post.author', many: false },
    },
  });

  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      content: { type: Text },
      author: { type: Relationship, ref: 'User.post', many: false },
    },
  });
}

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true })],
};
