const { Keystone } = require('@keystonejs/keystone');
const {
  File,
  Text,
  Integer,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
  DateTime,
  Url,
  Decimal,
  Slug,
  Virtual,
} = require('@keystonejs/fields');
const { Content } = require('@keystonejs/fields-content');
const { CloudinaryAdapter, LocalFileAdapter } = require('@keystonejs/file-adapters');
const { Markdown } = require('@keystonejs/fields-markdown');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');
const { Color } = require('@keystonejs/fields-color');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { graphql } = require('graphql');
const { OEmbed, IframelyOEmbedAdapter } = require('@keystonejs/fields-oembed');
const { CloudinaryImage } = require('@keystonejs/fields-cloudinary-image');
const { Unsplash } = require('@keystonejs/fields-unsplash');

const MockOEmbedAdapter = require('./mocks/oembed-adapter');

const { staticRoute, staticPath, cloudinary, iframely, unsplash } = require('./config');

const LOCAL_FILE_SRC = `${staticPath}/avatars`;
const LOCAL_FILE_ROUTE = `${staticRoute}/avatars`;

const Stars = require('./custom-fields/Stars');
const { formatISO } = require('date-fns');

// TODO: Make this work again
// const SecurePassword = require('./custom-fields/SecurePassword');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/cypress-test-project' }),
  cookieSecret: 'qwerty',
});

const fileAdapter = new LocalFileAdapter({
  src: LOCAL_FILE_SRC,
  path: LOCAL_FILE_ROUTE,
});

let embedAdapter;

if (process.env.NODE_ENV === 'test') {
  embedAdapter = new MockOEmbedAdapter();
} else if (iframely.apiKey) {
  embedAdapter = new IframelyOEmbedAdapter({ apiKey: iframely.apiKey });
}

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
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'do MMMM yyyy',
      dateFrom: '1901-01-01',
      dateTo: formatISO(new Date(), { representation: 'date' }),
    },
    lastOnline: {
      type: DateTime,
      format: 'MM/dd/yyyy h:mm a',
      yearRangeFrom: 2013,
    },
    password: { type: Password },
    isAdmin: { type: Checkbox },
    favouritePosts: { type: Relationship, ref: 'Post', many: true },
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
    color: { type: Color },
    website: { type: Url },
    ...(embedAdapter && { profile: { type: OEmbed, adapter: embedAdapter } }),
    ...(cloudinaryAdapter && { avatar: { type: CloudinaryImage, adapter: cloudinaryAdapter } }),
    ...(unsplash.accessKey && { favouriteImage: { type: Unsplash, ...unsplash } }),
  },
  labelResolver: item => `${item.name} <${item.email}>`,
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      if (resolvedData.name === 'Homer') {
        addValidationError('Sorry, no Homers allowed', { a: 1 }, { b: 2 });
      }
    },
  },
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
    stars: { type: Stars, starCount: 5 },
    views: { type: Integer },
    price: { type: Decimal, symbol: '$' },
    currency: { type: Text },
    hero: { type: File, adapter: fileAdapter },
    markdownValue: { type: Markdown },
    fortyTwo: {
      type: Virtual,
      graphQLReturnType: `Int`,
      resolver: () => 42,
    },
    virtual: {
      type: Virtual,
      extendGraphQLTypes: [`type Movie { title: String, rating: Int }`],
      graphQLReturnType: `[Movie]`,
      graphQLReturnFragment: `{
        title
        rating
      }`,
      resolver: async () => {
        const data = [
          { title: 'A movie', rating: 2 },
          { title: 'Another movie', rating: 4 },
        ];
        return data.map(({ title, rating }) => ({ title, rating }));
      },
    },
    value: {
      type: Content,
      blocks: [
        ...(cloudinaryAdapter
          ? [[CloudinaryImage.blocks.image, { adapter: cloudinaryAdapter }]]
          : []),
        ...(embedAdapter ? [[OEmbed.blocks.oEmbed, { adapter: embedAdapter }]] : []),
        ...(unsplash.accessKey
          ? [[Unsplash.blocks.unsplashImage, { attribution: 'KeystoneJS', ...unsplash }]]
          : []),
        Content.blocks.blockquote,
        Content.blocks.orderedList,
        Content.blocks.unorderedList,
        Content.blocks.link,
        Content.blocks.heading,
      ],
    },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'name, status',
    defaultSort: 'name',
  },
  labelResolver: async (item, args, context, { schema }) => {
    if (item.author) {
      const query = `
        query getAuthor($authorId: ID!) {
          User(where: { id: $authorId }) {
            name
          }
        }
      `;
      const variables = { authorId: item.author.toString() };
      const { data } = await graphql(schema, query, null, context, variables);
      return `${item.name}${data.User && `(by ${data.User.name})`}`;
    } else {
      return item.name;
    }
  },
});

keystone.createList('ReadOnlyList', {
  fields: {
    name: { type: Text },
    slug: { type: Slug, adminConfig: { isReadOnly: true } },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      adminConfig: { isReadOnly: true },
    },
    author: {
      type: Relationship,
      ref: 'User',
      adminConfig: { isReadOnly: true },
    },
    views: { type: Integer, adminConfig: { isReadOnly: true } },
    price: { type: Decimal, symbol: '$', adminConfig: { isReadOnly: true } },
    currency: { type: Text, adminConfig: { isReadOnly: true } },
    hero: { type: File, adapter: fileAdapter, adminConfig: { isReadOnly: true } },
    markdownValue: { type: Markdown, adminConfig: { isReadOnly: true } },
    wysiwygValue: { type: Wysiwyg, adminConfig: { isReadOnly: true } },
    value: {
      type: Content,
      blocks: [
        ...(cloudinaryAdapter
          ? [[CloudinaryImage.blocks.image, { adapter: cloudinaryAdapter }]]
          : []),
        ...(embedAdapter ? [[OEmbed.blocks.oEmbed, { adapter: embedAdapter }]] : []),
        ...(unsplash.accessKey
          ? [[Unsplash.blocks.unsplashImage, { attribution: 'KeystoneJS', ...unsplash }]]
          : []),
        Content.blocks.blockquote,
        Content.blocks.orderedList,
        Content.blocks.unorderedList,
        Content.blocks.link,
        Content.blocks.heading,
      ],
      adminConfig: { isReadOnly: true },
    },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'name, status',
    defaultSort: 'name',
  },
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
});

keystone.createList('SomeLongNamedList', {
  fields: {
    name: { type: Text },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: staticRoute, src: staticPath }),
    new AdminUIApp({ name: 'Cypress Test Project Basic', enableDefaultRoute: true }),
  ],
};
