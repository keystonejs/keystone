const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Password, Select } = require('@keystonejs/fields');
const { SchemaRouterApp } = require('@keystonejs/app-schema-router');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { objMerge } = require('@keystonejs/utils');
const {
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  getFieldName,
  listAccessVariations,
  fieldAccessVariations,
} = require('./cypress/integration/util');

const { projectName } = require('./config');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/cypress-test-project' }),
  cookieSecret: 'qwerty',
  schemaNames: ['testing', 'seeding'],
});

keystone.createList('User', {
  fields: {
    email: {
      type: Text,
    },
    password: {
      type: Password,
      minLength: 2,
      workFactor: 4,
    },
    // Normally users might be multiple of each of these, but for demo purposes
    // we assume they can only be one at a time.
    level: {
      type: Select,
      options: ['su', 'admin', 'editor', 'writer', 'reader'],
    },
    // NOTE: We only need imperative ones here - we test elsewhere that static
    // fields aren't included in graphQL responses. And fields can't have
    // declarative types.
    noRead: { type: Text, access: { testing: { read: () => false }, seeding: true } },
    yesRead: { type: Text, access: { read: () => true } },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

function createListWithStaticAccess(access) {
  const createField = fieldAccess => ({
    [getFieldName(fieldAccess)]: {
      type: Text,
      access: { testing: fieldAccess, seeding: true },
    },
  });
  keystone.createList(getStaticListName(access), {
    fields: {
      foo: { type: Text },
      zip: { type: Text },
      ...objMerge(fieldAccessVariations.map(variation => createField(variation))),
    },
    access: {
      testing: access,
      seeding: true,
    },
  });
}

function createListWithImperativeAccess(access) {
  const createField = fieldAccess => ({
    [getFieldName(fieldAccess)]: {
      type: Text,
      access: {
        testing: {
          create: () => fieldAccess.create,
          read: () => fieldAccess.read,
          update: () => fieldAccess.update,
          delete: () => fieldAccess.delete,
        },
        seeding: true,
      },
    },
  });
  keystone.createList(getImperativeListName(access), {
    fields: {
      foo: { type: Text },
      zip: { type: Text },
      ...objMerge(fieldAccessVariations.map(variation => createField(variation))),
    },
    access: {
      testing: {
        create: () => access.create,
        read: () => access.read,
        update: () => access.update,
        delete: () => access.delete,
        auth: () => access.auth,
      },
      seeding: true,
    },
  });
}

function createListWithDeclarativeAccess(access) {
  keystone.createList(getDeclarativeListName(access), {
    fields: {
      foo: { type: Text },
      zip: { type: Text },
    },
    access: {
      testing: {
        create: ({ authentication: { item, listKey } }) =>
          access.create && listKey === 'User' && ['su', 'admin'].includes(item.level),
        read: ({ authentication: { item, listKey } }) => {
          if (access.read && listKey === 'User' && ['su', 'admin'].includes(item.level)) {
            return {
              // arbitrarily restrict the data to a single item (see data.js)
              foo_starts_with: 'Hello',
            };
          }
          return false;
        },
        update: ({ authentication: { item, listKey } }) => {
          if (access.update && listKey === 'User' && ['su', 'admin'].includes(item.level)) {
            return {
              // arbitrarily restrict the data to a single item (see data.js)
              foo_starts_with: 'Hello',
            };
          }
          return false;
        },
        delete: ({ authentication: { item, listKey } }) => {
          if (access.delete && listKey === 'User' && ['su', 'admin'].includes(item.level)) {
            return {
              // arbitrarily restrict the data to a single item (see data.js)
              foo_starts_with: 'Hello',
            };
          }
          return false;
        },
        auth: true,
      },
      seeding: true,
    },
  });
}

listAccessVariations.forEach(createListWithStaticAccess);
listAccessVariations.forEach(createListWithImperativeAccess);
listAccessVariations.forEach(createListWithDeclarativeAccess);

module.exports = {
  keystone,
  apps: [
    new SchemaRouterApp({
      routerFn: () => 'testing',
      apps: {
        seeding: createGraphQLApp('seeding'),
        testing: createGraphQLApp('testing'),
      },
    }),
    new AdminUIApp({ name: projectName, adminPath: '/admin', authStrategy, schemaName: 'testing' }),
  ],
};

function createGraphQLApp(schemaName) {
  return new GraphQLApp({
    schemaName,
  });
}
