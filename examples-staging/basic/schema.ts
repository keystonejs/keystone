import { list, graphQLSchemaExtension, gql, graphql } from '@keystone-next/keystone';
import {
  text,
  relationship,
  checkbox,
  password,
  timestamp,
  select,
  virtual,
  image,
  file,
} from '@keystone-next/keystone/fields';
import { document } from '@keystone-next/fields-document';
// import { cloudinaryImage } from '@keystone-next/cloudinary';
import { KeystoneListsAPI } from '@keystone-next/keystone/types';
import { componentBlocks } from './admin/fieldViews/Content';
import { KeystoneListsTypeInfo } from '.keystone/types';

type AccessArgs = {
  session?: {
    itemId?: string;
    listKey?: string;
    data: {
      name?: string;
      isAdmin: boolean;
    };
  };
  item?: any;
};

export const access = {
  isAdmin: ({ session }: AccessArgs) => !!session?.data.isAdmin,
};

const randomNumber = () => Math.round(Math.random() * 10);

export const lists = {
  User: list({
    ui: {
      listView: {
        initialColumns: ['name', 'posts', 'avatar'],
      },
    },
    fields: {
      /** The user's first and last name. */
      name: text({ validation: { isRequired: true } }),
      /** Email is used to log into the system. */
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      /** Avatar upload for the users profile, stored locally */
      avatar: image(),
      attachment: file(),
      /** Used to log in. */
      password: password(),
      /** Administrators have more access to various lists and fields. */
      isAdmin: checkbox({
        access: {
          read: access.isAdmin,
          create: access.isAdmin,
          update: access.isAdmin,
        },
        ui: {
          createView: {
            fieldMode: args => (access.isAdmin(args) ? 'edit' : 'hidden'),
          },
          itemView: {
            fieldMode: args => (access.isAdmin(args) ? 'edit' : 'read'),
          },
        },
      }),
      roles: text({}),
      phoneNumbers: relationship({
        ref: 'PhoneNumber.user',
        many: true,
        ui: {
          // TODO: Work out how to use custom views to customise the card + edit / create forms
          // views: './admin/fieldViews/user/phoneNumber',
          displayMode: 'cards',
          cardFields: ['type', 'value'],
          inlineEdit: { fields: ['type', 'value'] },
          inlineCreate: { fields: ['type', 'value'] },
          linkToItem: true,
          // removeMode: 'delete',
        },
      }),
      posts: relationship({ ref: 'Post.author', many: true }),
      randomNumber: virtual({
        field: graphql.field({
          type: graphql.Float,
          resolve() {
            return randomNumber();
          },
        }),
      }),
    },
  }),
  PhoneNumber: list({
    ui: {
      isHidden: true,
      // parentRelationship: 'user',
    },
    fields: {
      label: virtual({
        field: graphql.field({
          type: graphql.String,
          resolve(item) {
            return `${item.type} - ${item.value}`;
          },
        }),
        ui: {
          listView: {
            fieldMode: 'hidden',
          },
          itemView: {
            fieldMode: 'hidden',
          },
        },
      }),
      user: relationship({ ref: 'User.phoneNumbers' }),
      type: select({
        options: [
          { label: 'Home', value: 'home' },
          { label: 'Work', value: 'work' },
          { label: 'Mobile', value: 'mobile' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      value: text({}),
    },
  }),
  Post: list({
    fields: {
      title: text(),
      // TODO: expand this out into a proper example project
      // Enable this line to test custom field views
      // test: text({ ui: { views: require.resolve('./admin/fieldViews/Test.tsx') } }),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
        validation: {
          isRequired: true,
        },
        defaultValue: 'draft',
      }),
      content: document({
        ui: { views: require.resolve('./admin/fieldViews/Content.tsx') },
        relationships: {
          mention: {
            kind: 'inline',
            label: 'Mention',
            listKey: 'User',
          },
          featuredAuthors: {
            kind: 'prop',
            listKey: 'User',
            many: true,
            selection: `posts(take: 10) {
            title
          }`,
          },
        },
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
        componentBlocks,
      }),
      publishDate: timestamp(),
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineCreate: { fields: ['name', 'email'] },
        },
      }),
    },
  }),
};

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: gql`
    type Query {
      randomNumber: RandomNumber
    }
    type RandomNumber {
      number: Int
      generatedAt: Int
    }
    type Mutation {
      createRandomPosts: [Post!]!
    }
  `,
  resolvers: {
    RandomNumber: {
      number(rootVal: { number: number }) {
        return rootVal.number * 1000;
      },
    },
    Mutation: {
      createRandomPosts(root, args, context) {
        // TODO: add a way to verify access control here, e.g
        // await context.verifyAccessControl(userIsAdmin);
        const data = Array.from({ length: 238 }).map((x, i) => ({ title: `Post ${i}` }));
        // note this usage of the type is important because it tests that the generated
        // KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
        const query = context.query as KeystoneListsAPI<KeystoneListsTypeInfo>;
        return query.Post.createMany({ data });
      },
    },
    Query: {
      randomNumber: () => ({
        number: randomNumber(),
        generatedAt: Date.now(),
      }),
    },
  },
});
