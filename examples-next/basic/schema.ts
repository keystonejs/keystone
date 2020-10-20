import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-spike/keystone/schema';
import {
  text,
  relationship,
  checkbox,
  password,
  timestamp,
  integer,
  select,
  virtual,
} from '@keystone-spike/fields';
import { KeystoneCrudAPI } from '@keystone-spike/types';
import { KeystoneListsTypeInfo } from './.keystone/schema-types';

const randomNumber = () => Math.round(Math.random() * 10);

export const lists = createSchema({
  User: list({
    admin: {
      listView: {
        initialColumns: ['name', 'posts'],
      },
    },
    hooks: {
      resolveInput: ({ resolvedData, originalInput }) => {
        console.log('list hooks: resolveInput', { resolvedData, originalInput });
        return resolvedData;
      },
      beforeChange({ resolvedData, originalInput }) {
        console.log('list hooks: beforeChange', { resolvedData, originalInput });
      },
    },
    access: {
      //   read: ({ context }) => {
      //     let postFilter = {
      //       posts_some: {
      //         published: true,
      //       },
      //     };
      //     if (context.session?.itemId) {
      //       return {
      //         OR: [
      //           {
      //             id: context.session.itemId,
      //           },
      //           postFilter,
      //         ],
      //       };
      //     }
      //     return postFilter;
      //   },
      update: ({ itemId, context, originalInput }) => {
        console.log(originalInput);
        return itemId === context.session?.itemId;
      },
    },

    fields: {
      name: text({ isRequired: true, hooks: {} }),
      randomNumber: virtual({
        resolver() {
          return randomNumber();
        },
        graphQLReturnType: 'Float',
      }),
      email: text({
        isRequired: true,
        isUnique: true,
        hooks: {},
        // views: require.resolve('./admin/fieldViews/content'),
      }),
      password: password({
        hooks: {},
      }),
      isAdmin: checkbox({
        access: {
          read: ({ session }) => !!session?.item?.isAdmin,
          update: ({ session }) => !!session?.item?.isAdmin,
        },
        admin: {
          createView: {
            fieldMode: ({ session }) => (session?.item?.isAdmin ? 'edit' : 'hidden'),
          },
          // listView: {
          //   fieldMode: ({ session }) => (session?.item?.isAdmin ? 'read' : 'hidden'),
          // },
          itemView: {
            fieldMode: ({ session }) => (session?.item?.isAdmin ? 'edit' : 'read'),
          },
        },
      }),
      roles: text({}),
      posts: relationship({ ref: 'Post.author', many: true }),
      something: text({
        admin: {
          displayMode: 'textarea',
        },
      }),
      oneTimeThing: text({
        access: {
          create: true,
          read: true,
          update: false,
        },
      }),
    },
  }),
  Post: list({
    admin: {
      labelField: 'title',
    },
    fields: {
      title: text({
        hooks: {
          afterChange({}) {},
        },
      }),
      views: integer({}),
      content: text({}),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        admin: {
          displayMode: 'segmented-control',
        },
      }),
      publishDate: timestamp({}),
      author: relationship({ ref: 'User.posts' }),
    },
  }),
  // Settings: singleton({
  //   fields: {
  //     siteName: text(),
  //     primaryColor: text(),
  //   },
  // }),
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
        let crud: KeystoneCrudAPI<KeystoneListsTypeInfo> = ctx.crud;

        const data = Array.from({ length: 238 }).map((x, i) => ({ data: { title: `Post ${i}` } }));
        return crud.Post.createMany({ data });
      },
    },
    Query: {
      randomNumber: async (root: any, args: any, ctx: any) => {
        // await ctx.startSession({ something: true });
        console.log(ctx.session);
        // await ctx.verifyAccessControl(userIsAdmin);
        return {
          number: randomNumber(),
          generatedAt: Date.now(),
        };
      },
    },
  },
});
