//imports for Keystone app core
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { Keystone } = require('@keystone-alpha/keystone');
const {
  File,
  Text,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
  DateTime,
} = require('@keystone-alpha/fields');
const { LocalFileAdapter } = require('@voukeystone-alphassoir/file-adapters');
const PasswordAuthStrategy = require('@keystone-alpha/keystone/auth/Password');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

// config
const path = require('path');
const staticRoute = '/public'; // The URL portion
const staticPath = path.join(process.cwd(), 'public'); // The local path on disk
const getYear = require('date-fns/get_year');

const keystone = new Keystone({
  name: 'Keystone Demo Blog',
  adapter: new MongooseAdapter(),
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  sortListsAlphabetically: true,
});

const fileAdapter = new LocalFileAdapter({
  directory: `${staticPath}/uploads`,
  route: `${staticRoute}/uploads`,
});

const avatarFileAdapter = new LocalFileAdapter({
  directory: `${staticPath}/avatars`,
  route: `${staticRoute}/avatars`,
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: 1901,
      yearRangeTo: getYear(new Date()),
    },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    avatar: { type: File, adapter: avatarFileAdapter },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    author: {
      type: Relationship,
      ref: 'User',
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
    },
    body: { type: Text, isMultiline: true },
    posted: { type: DateTime },
    image: { type: File, adapter: fileAdapter },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'title, status',
    defaultSort: 'title',
  },
  labelResolver: item => item.title,
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
});

keystone.createList('Comment', {
  fields: {
    body: { type: Text, isMultiline: true },
    originalPost: {
      type: Relationship,
      ref: 'Post',
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
    posted: { type: DateTime },
  },
  labelResolver: item => item.body,
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  sortListsAlphabetically: true,
});

module.exports = {
  staticRoute,
  staticPath,
  keystone,
  admin,
  serverConfig: {
    authStrategy,
  },
};
