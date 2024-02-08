import { graphql, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { select, relationship, text, timestamp } from '@keystone-6/core/fields'
import { type Context, type Lists } from '.keystone/types'

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
          { label: 'Banned', value: 'banned' },
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

export const extendGraphqlSchema = graphql.extend(base => {
  const Statistics = graphql.object<{ authorId: string }>()({
    name: 'Statistics',
    fields: {
      draft: graphql.field({
        type: graphql.Int,
        resolve ({ authorId }, args, context: Context) {
          return context.query.Post.count({
            where: { author: { id: { equals: authorId } }, status: { equals: 'draft' } },
          })
        },
      }),
      published: graphql.field({
        type: graphql.Int,
        resolve ({ authorId }, args, context: Context) {
          return context.query.Post.count({
            where: { author: { id: { equals: authorId } }, status: { equals: 'published' } },
          })
        },
      }),
      latest: graphql.field({
        type: base.object('Post'),
        async resolve ({ authorId }, args, context: Context) {
          const [post] = await context.db.Post.findMany({
            take: 1,
            orderBy: { publishDate: 'desc' },
            where: { author: { id: { equals: authorId } } },
          })
          return post
        },
      }),
    },
  })

  return {
    mutation: {
      publishPost: graphql.field({
        // base.object will return an object type from the existing schema
        // with the name provided or throw if it doesn't exist
        type: base.object('Post'),
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        resolve (source, { id }, context: Context) {
          // Note we use `context.db.Post` here as we have a return type
          // of Post, and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.updateOne({
            where: { id },
            data: { status: 'published', publishDate: new Date().toISOString() },
          })
        },
      }),

      // only add this mutation for a sudo Context (this is not usable from the API)
      ...(base.schema.extensions.sudo
        ? {
            banPost: graphql.field({
              type: base.object('Post'),
              args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
              resolve (source, { id }, context: Context) {
                return context.db.Post.updateOne({
                  where: { id },
                  data: { status: 'banned' },
                })
              },
            }),
          }
        : {}),
    },
    query: {
      recentPosts: graphql.field({
        type: graphql.list(graphql.nonNull(base.object('Post'))),
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          seconds: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 600 }),
        },
        resolve (source, { id, seconds }, context: Context) {
          const cutoff = new Date(Date.now() - seconds * 1000)

          // Note we use `context.db.Post` here as we have a return type
          // of [Post], and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.findMany({
            where: { author: { id: { equals: id } }, publishDate: { gt: cutoff } },
          })
        },
      }),
      stats: graphql.field({
        type: Statistics,
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        resolve (source, { id }) {
          return { authorId: id }
        },
      }),
    },
  }
})
