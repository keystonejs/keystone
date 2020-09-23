import { createSchema, list, graphQLSchemaExtension, gql } from '@keystone-spike/keystone/schema';
import { text, relationship, checkbox, password, timestamp } from '@keystone-spike/fields';

const randomNumber = () => Math.round(Math.random() * 10);

/*
type KeystoneQueryFns = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args: KeystoneListsTypeInfo[Key]['args']['listQuery']
    ): Promise<readonly KeystoneListsTypeInfo[Key]['backing'][]>;
    findOne(args: {
      readonly where: { readonly id: string };
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
  };
};

() => {
  let keystoneQueryStuff: KeystoneQueryFns = undefined as any;

  keystoneQueryStuff.Post.findMany({ where: {} });
};
*/

export const lists = createSchema({
  User: list({
    admin: {
      listView: {
        initialColumns: ['name', 'posts'],
      },
    },
    hooks: {
      resolveInput: ({ resolvedData, originalInput }) => {
        console.log({ resolvedData, originalInput });
        return resolvedData;
      },
      beforeChange({ resolvedData, originalInput }) {
        console.log({ resolvedData, originalInput });
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
      email: text({
        isRequired: true,
        isUnique: true,
        hooks: {},
        // views: require.resolve('./admin/fieldViews/content'),
      }),
      password: password({
        hooks: {},
      }),
      isAdmin: checkbox({}),
      roles: text({}),
      posts: relationship({ ref: 'Post.author', many: true }),
      something: text({ isMultiline: true }),
    },
  }),
  Post: list({
    fields: {
      title: text({
        hooks: {
          afterChange({}) {},
        },
      }),
      content: text({}),
      published: checkbox({ defaultValue: false }),
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
  `,
  resolvers: {
    RandomNumber: {
      number(rootVal: { number: number }) {
        return rootVal.number * 1000;
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
