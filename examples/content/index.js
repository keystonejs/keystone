const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Password, Checkbox, Relationship } = require('@keystonejs/fields');
const { DocumentField } = require('@keystonejs/fields-document');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
// const { StaticApp } = require('@keystonejs/app-static');

const keystone = new Keystone({
  name: 'Keystone Content Management',
  adapter: new MongooseAdapter(),
  cookieSecret: 'secret',
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Password },
    isMember: { type: Checkbox },
    isAuthor: { type: Checkbox },
    posts: { type: Relationship, ref: 'Post.author', many: true },
    isAdmin: { type: Checkbox },
  },
});

keystone.createList('Post', {
  fields: {
    name: { type: Text, isRequired: true },
    author: { type: Relationship, ref: 'User.posts' },
    content: {
      type: DocumentField,
      documentFeatures: {
        access: {
          roles: {
            public: {
              label: 'public',
              resolveAccess: ({ item }) => !item,
            },
            member: {
              label: 'Members',
              resolveAccess: ({ item }) => item && item.isMember,
            },
            admin: {
              label: 'Super',
              resolveAccess: ({ item }) => item && item.isAdmin,
            },
          },
          authorAccess: ({ item }) => item && (item.isAdmin || item.isAuthor),
        },
      },
    },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    // new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({ enableDefaultRoute: true, authStrategy }),
  ],
};
