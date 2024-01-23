import { list } from '@keystone-6/core'
import type { GraphQLSchema } from 'graphql'
import { mergeSchemas } from '@graphql-tools/schema'
import { allowAll } from '@keystone-6/core/access'
import { select, relationship, text, timestamp } from '@keystone-6/core/fields'

import { type Lists, type Context } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: text(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
} satisfies Lists

export function extendGraphqlSchema (baseSchema: GraphQLSchema) {
  return mergeSchemas({
    schemas: [baseSchema],
    typeDefs: `
    type Mutation {
      """ Publish a post """
      publishPost(id: ID!): Post

      """ Create or update an author based on email """
      upsertAuthor(where: AuthorWhereUniqueInput!, create: AuthorCreateInput!, update: AuthorUpdateInput!): Author
    }

    type Query {
      """ Return all posts for a user from the last <seconds> seconds """
      recentPosts(id: ID!, seconds: Int! = 600): [Post]

      """ Compute statistics for a user """
      stats(id: ID!): Statistics
    }

    """ A custom type to represent statistics for a user """
    type Statistics {
      draft: Int
      published: Int
      latest: Post
    }`,
    resolvers: {
      Mutation: {
        publishPost: (root, { id }, context: Context) => {
          // Note we use `context.db.Post` here as we have a return type
          // of Post, and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.updateOne({
            where: { id },
            data: { status: 'published', publishDate: new Date().toUTCString() },
          })
        },
        upsertAuthor: async (root, { where, update, create }, context: Context) => {
          try {
            // we need to await the update here so that if an error is thrown, it's caught
            // by the try catch here and not returned through the graphql api
            return await context.db.Author.updateOne({ where, data: update })
          } catch (updateError: any) {
            // updateOne will fail with the code KS_ACCESS_DENIED if the item isn't found,
            // so we try to create it. If the item does exist, the unique constraint on
            // email will prevent a duplicate being created, and we catch the error
            if (updateError.extensions?.code === 'KS_ACCESS_DENIED') {
              return await context.db.Author.createOne({ data: create })
            }
            throw updateError
          }
        },
      },
      Query: {
        recentPosts: (root, { id, seconds }, context: Context) => {
          const cutoff = new Date(Date.now() - seconds * 1000)

          // Note we use `context.db.Post` here as we have a return type
          // of [Post], and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.findMany({
            where: { author: { id: { equals: id } }, publishDate: { gt: cutoff } },
          })
        },
        stats: async (root, { id }) => {
          return { authorId: id }
        },
      },
      Statistics: {
        // The stats resolver returns an object which is passed to this resolver as
        // the root value. We use that object to further resolve ths specific fields.
        // In this case we want to take root.authorId and get the latest post for that author
        //
        // As above we use the context.db.Post API to achieve this.
        latest: async (val, args, context: Context) => {
          const [post] = await context.db.Post.findMany({
            take: 1,
            orderBy: { publishDate: 'desc' },
            where: { author: { id: { equals: val.authorId } } },
          })
          return post
        },
        draft: (val, args, context: Context) => {
          return context.query.Post.count({
            where: { author: { id: { equals: val.authorId } }, status: { equals: 'draft' } },
          })
        },
        published: (val, args, context: Context) => {
          return context.query.Post.count({
            where: { author: { id: { equals: val.authorId } }, status: { equals: 'published' } },
          })
        },
      },
    },
  })
}
