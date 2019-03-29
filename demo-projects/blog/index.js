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
const { LocalFileAdapter } = require('@keystone-alpha/file-adapters');
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
    posted: { type: DateTime, format: 'DD MMM YYYY' },
    image: { type: File, adapter: fileAdapter },
  },
  adminConfig: {
    defaultPageSize: 15,
    defaultColumns: 'author, categories, status, posted',
    defaultSort: 'posted',
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

keystone.createList('Zico', { fields: { name: { type: Text } } });
keystone.createList('Administrator', {
  singular: 'Administrator',
  plural: 'Administrators',
  fields: { name: { type: Text } },
});
keystone.createList('Vape', { fields: { name: { type: Text } } });
keystone.createList('Water', { fields: { name: { type: Text } } });
keystone.createList('Bowl', { fields: { name: { type: Text } } });
keystone.createList('Tissue', { fields: { name: { type: Text } } });
keystone.createList('Table', { fields: { name: { type: Text } } });
keystone.createList('Chair', { fields: { name: { type: Text } } });
keystone.createList('Cable', { fields: { name: { type: Text } } });
keystone.createList('Television', { fields: { name: { type: Text } } });
keystone.createList('Camera', { fields: { name: { type: Text } } });
keystone.createList('Speaker', { fields: { name: { type: Text } } });
keystone.createList('Microphone', { fields: { name: { type: Text } } });
keystone.createList('Tree', { fields: { name: { type: Text } } });
keystone.createList('Plant', { fields: { name: { type: Text } } });
keystone.createList('Bush', { fields: { name: { type: Text } } });
keystone.createList('Trashcan', { fields: { name: { type: Text } } });
keystone.createList('Board', { fields: { name: { type: Text } } });

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'Blog',
      children: [
        { listKey: 'Post' },
        { label: 'Categories', listKey: 'PostCategory' },
        {
          label: 'Nested',
          children: [{ label: 'Comments', listKey: 'Comment' }],
        },
      ],
    },
    {
      label: 'Word play',
      children: [
        'Table',
        'Chair',
        'Cable',
        {
          label: 'First',
          children: [
            'Zico',
            'Administrator',
            'Vape',
            {
              label: 'Second',
              children: [
                'Water',
                'Bowl',
                'Tissue',
                {
                  // label: 'Thrid',
                  children: [
                    'Television',
                    'Camera',
                    'Speaker',
                    {
                      // label: 'Fourth',
                      children: ['Microphone', 'Tree', 'Plant'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        'Bush',
        'Trashcan',
        'Board',
      ],
    },
    {
      label: 'Other',
      children: ['User'],
    },
  ],
});

module.exports = {
  staticRoute,
  staticPath,
  keystone,
  admin,
};
