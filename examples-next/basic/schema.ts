import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-next/keystone/schema';
import {
  text,
  relationship,
  checkbox,
  password,
  timestamp,
  select,
  virtual,
} from '@keystone-next/fields';
import { KeystoneCrudAPI } from '@keystone-next/types';
import { KeystoneListsTypeInfo } from './.keystone/schema-types';

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
  isAdmin: ({ session }: AccessArgs) => !!session?.data?.isAdmin,
};

const randomNumber = () => Math.round(Math.random() * 10);

export const lists = createSchema({
  User: list({
    admin: {
      listView: {
        initialColumns: ['name', 'posts'],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password(),
      isAdmin: checkbox({
        access: {
          create: access.isAdmin,
          read: access.isAdmin,
          update: access.isAdmin,
        },
        admin: {
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
        admin: {
          // TODO: Work out how to use custom views to customise the card + edit / create forms
          // views: './admin/fieldViews/user/phoneNumber',
          displayMode: 'cards',
          cardFields: ['type', 'value'],
          inlineEdit: { fields: ['type', 'value'] },
          inlineCreate: { fields: ['type', 'value'] },
          linkToItem: true,
          removeMode: 'delete',
        },
      }),
      posts: relationship({ ref: 'Post.author', many: true }),
      randomNumber: virtual({
        graphQLReturnType: 'Float',
        resolver() {
          return randomNumber();
        },
      }),
    },
  }),
  PhoneNumber: list({
    admin: {
      isHidden: true,
      parentRelationship: 'user',
    },
    fields: {
      user: relationship({ ref: 'User.phoneNumbers' }),
      type: select({
        options: [
          { label: 'Home', value: 'home' },
          { label: 'Work', value: 'work' },
          { label: 'Mobile', value: 'mobile' },
        ],
        admin: {
          displayMode: 'segmented-control',
        },
      }),
      value: text({}),
    },
  }),
  Post: list({
    admin: {
      labelField: 'title',
    },
    fields: {
      title: text(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        admin: {
          displayMode: 'segmented-control',
        },
      }),
      content: text({
        admin: {
          displayMode: 'textarea',
        },
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
});

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
      createRandomPosts(root: any, args: any, ctx: any) {
        // TODO: add a way to verify access control here, e.g
        // await ctx.verifyAccessControl(userIsAdmin);
        const crud: KeystoneCrudAPI<KeystoneListsTypeInfo> = ctx.crud;
        const data = Array.from({ length: 238 }).map((x, i) => ({ data: { title: `Post ${i}` } }));
        return crud.Post.createMany({ data });
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
