import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-next/keystone/schema';
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
} from '@keystone-next/fields';
import { document } from '@keystone-next/fields-document';
// import { cloudinaryImage } from '@keystone-next/cloudinary';
import { types } from '@keystone-next/types';
import { componentBlocks } from './admin/fieldViews/Content';

// TODO: Can we generate this type based on withItemData in the main config?
type AccessArgs = {
  session?: {
    itemId?: string;
    listKey?: string;
    data?: {
      name?: string;
      isAdmin: boolean;
    };
  };
  item?: any;
};
export const access = {
  isAdmin: ({ session }: AccessArgs) => true,
  // !!session?.data?.isAdmin
};

const randomNumber = () => Math.round(Math.random() * 10);

export const lists = createSchema({
  User: list({
    ui: {
      listView: {
        initialColumns: ['name', 'posts', 'avatar'],
      },
    },
    fields: {
      /** The user's first and last name. */
      name: text({ isRequired: true }),
      /** Email is used to log into the system. */
      email: text({ isRequired: true, index: 'unique' }),
      /** Avatar upload for the users profile, stored locally */
      avatar: image(),
      attachment: file(),
      /** Used to log in. */
      password: password(),
      /** Administrators have more access to various lists and fields. */
      isAdmin: checkbox({
        access: {
          create: access.isAdmin,
          read: access.isAdmin,
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
        field: types.field({
          type: types.nonNull(types.Float),
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
        field: types.field({
          type: types.String,
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
            selection: `posts(first: 10) {
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
});

// export const extendGraphqlSchema = graphQLSchemaExtension({
//   typeDefs: gql`
//     type Query {
//       randomNumber: RandomNumber
//     }
//     type RandomNumber {
//       number: Int
//       generatedAt: Int
//     }
//     type Mutation {
//       createRandomPosts: [Post!]!
//     }
//   `,
//   resolvers: {
//     RandomNumber: {
//       number(rootVal: { number: number }) {
//         return rootVal.number * 1000;
//       },
//     },
//     Mutation: {
//       createRandomPosts(root, args, context) {
//         // TODO: add a way to verify access control here, e.g
//         // await context.verifyAccessControl(userIsAdmin);
//         const data = Array.from({ length: 238 }).map((x, i) => ({ data: { title: `Post ${i}` } }));
//         return context.lists.Post.createMany({ data });
//       },
//     },
//     Query: {
//       randomNumber: () => ({
//         number: randomNumber(),
//         generatedAt: Date.now(),
//       }),
//     },
//   },
// });
