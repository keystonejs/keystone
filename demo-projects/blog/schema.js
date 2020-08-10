require('dotenv').config();
const {
  File,
  Text,
  Slug,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
  DateTime,
} = require('@keystonejs/fields');
const { OEmbed, IframelyOEmbedAdapter } = require('@keystonejs/fields-oembed');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');
const { formatISO } = require('date-fns');

const { staticRoute, staticPath, distDir } = require('./config');
const dev = process.env.NODE_ENV !== 'production';

let iframelyAdapter;

if (process.env.IFRAMELY_API_KEY) {
  iframelyAdapter = new IframelyOEmbedAdapter({
    apiKey: process.env.IFRAMELY_API_KEY,
  });
}

const fileAdapter = new LocalFileAdapter({
  src: `${dev ? '' : `${distDir}/`}${staticPath}/uploads`,
  path: `${staticRoute}/uploads`,
});

const avatarFileAdapter = new LocalFileAdapter({
  src: `${staticPath}/avatars`,
  path: `${staticRoute}/avatars`,
});

exports.User = {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'do MMMM yyyy',
      dateFrom: '1901-01-01',
      dateTo: formatISO(new Date(), { representation: 'date' }),
    },
    ...(process.env.IFRAMELY_API_KEY
      ? {
          portfolio: { type: OEmbed, adapter: iframelyAdapter },
        }
      : {}),
    password: { type: Password },
    isAdmin: { type: Checkbox },
    avatar: { type: File, adapter: avatarFileAdapter },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
};

const isAdmin = ({ authentication: { item: user } }) => !!user && !!user.isAdmin;

exports.Post = {
  fields: {
    title: { type: Text },
    slug: { type: Slug, from: 'title' },
    author: {
      type: AuthedRelationship,
      ref: 'User',
      isRequired: true,
      access: {
        create: isAdmin,
        update: isAdmin,
      },
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    body: { type: Wysiwyg },
    posted: { type: DateTime, format: 'dd/MM/yyyy' },
    image: {
      type: File,
      adapter: fileAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.image) {
            await fileAdapter.delete(existingItem.image);
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: ({ existingItem }) => {
      if (existingItem.image) {
        fileAdapter.delete(existingItem.image);
      }
    },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'title, status',
    defaultSort: 'title',
  },
  labelResolver: item => item.title,
};

exports.PostCategory = {
  fields: {
    name: { type: Text },
    slug: { type: Slug, from: 'name' },
  },
};

exports.Comment = {
  fields: {
    body: { type: Text, isMultiline: true },
    originalPost: {
      type: Relationship,
      ref: 'Post',
    },
    author: {
      type: AuthedRelationship,
      ref: 'User',
      isRequired: true,
      access: {
        create: isAdmin,
        update: isAdmin,
      },
    },
    posted: { type: DateTime },
  },
  labelResolver: item => item.body,
};
