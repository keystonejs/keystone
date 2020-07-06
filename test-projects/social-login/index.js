const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const {
  File,
  Text,
  Checkbox,
  Relationship,
  Select,
  Password,
  CloudinaryImage,
} = require('@keystonejs/fields');
const { CloudinaryAdapter, LocalFileAdapter } = require('@keystonejs/file-adapters');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');

const { staticRoute, staticPath, cloudinary, cookieSecret } = require('./config');

const { DISABLE_AUTH } = process.env;
const LOCAL_FILE_SRC = `${staticPath}/avatars`;
const LOCAL_FILE_ROUTE = `${staticRoute}/avatars`;

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/cypress-test-project' }),
  cookieSecret,
});

const fileAdapter = new LocalFileAdapter({
  src: LOCAL_FILE_SRC,
  path: LOCAL_FILE_ROUTE,
});

let cloudinaryAdapter;
try {
  cloudinaryAdapter = new CloudinaryAdapter({
    ...cloudinary,
    folder: 'avatars',
  });
} catch (e) {
  // Downgrade from an error to a warning if the dev does not have a
  // Cloudinary API Key set up. This will disable any fields which rely
  // on this functionality.
  console.warn(e.message);
}

keystone.createList('User', {
  fields: {
    // When no access defined, defaults to all public
    name: { type: Text },
    email: {
      type: Text,
      access: {
        read: true,
        update: ({ item, authentication }) =>
          // Authenticated against the correct list
          authentication.listKey === this.listKey &&
          // The authed item matches the item being updated
          item.id === authentication.item.id,
      },
    },
    password: {
      type: Password,
      access: {
        update: ({ item, authentication }) =>
          authentication.listKey === this.listKey && item.id === authentication.item.id,
      },
    },
    // TODO: Create a Facebook field type to encapsulate these
    facebookId: {
      type: Text,
      access: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
    },
    // TODO: Create a GitHub field type to encapsulate these
    githubId: {
      type: Text,
      access: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
    },

    // TODO: Create a Twitter field type to encapsulate these
    twitterId: {
      type: Text,
      access: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
    },

    // TODO: Create a Google field type to encapsulate these
    googleId: {
      type: Text,
      access: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
    },

    // TODO: Create a WordPress field type to encapsulate these
    wordpressId: {
      type: Text,
      access: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
    },

    isAdmin: { type: Checkbox },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
    attachment: { type: File, adapter: fileAdapter },
    ...(cloudinaryAdapter ? { avatar: { type: CloudinaryImage, adapter: cloudinaryAdapter } } : {}),
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
  },
  labelResolver: item => item.name,
  access: {
    read: true,
    create: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
    update: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
    delete: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
    auth: true,
  },
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
  access: {
    create: true,
    read: true,
    update: false,
    delete: false,
    auth: true,
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
    new StaticApp({ path: staticRoute, src: staticPath }),
    new AdminUIApp({
      name: 'Cypress Test for Social Login',
      authStrategy: DISABLE_AUTH ? undefined : authStrategy,
    }),
  ],
};
