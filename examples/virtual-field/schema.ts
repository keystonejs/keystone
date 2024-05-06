import { list, graphql } from '@keystone-6/core'
import { checkbox, integer, relationship, text, virtual } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text({ validation: { isRequired: true } }),
      listed: checkbox({}),

      // primitive GraphQL type
      isActive: virtual({
        field: graphql.field({
          type: graphql.Boolean,
          resolve(item) {
            return item.title.length > 3 && item.content.length > 10 && item.listed === true
          },
        }),
      }),

      // object GraphQL type
      counts: virtual({
        field: graphql.field({
          type: graphql.object<{
            words: number
            sentences: number
            paragraphs: number
          }>()({
            name: 'PostCounts',
            fields: {
              words: graphql.field({ type: graphql.Int }),
              sentences: graphql.field({ type: graphql.Int }),
              paragraphs: graphql.field({ type: graphql.Int }),
            },
          }),
          resolve(item) {
            const content = item.content ?? ''
            return {
              words: content.split(' ').length,
              sentences: content.split('.').length,
              paragraphs: content.split('\n\n').length,
            }
          },
        }),
        ui: {
          itemView: { fieldMode: 'hidden' },
          listView: { fieldMode: 'hidden' },
        },
      }),

      // accepts GraphQL arguments
      excerpt: virtual({
        field: graphql.field({
          type: graphql.String,
          args: {
            length: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 50 }),
          },
          resolve(item, { length }) {
            const { content = '' } = item
            if (content.length <= length) return content
            return content.slice(0, length) + '...'
          },
        }),
        ui: { query: '(length: 10)' },
      }),

      // using a context
      related: virtual({
        field: graphql.field({
          type: graphql.list(
            graphql.object<{
              id: string
              title: string
            }>()({
              name: 'RelatedPosts',
              fields: {
                id: graphql.field({ type: graphql.String }),
                title: graphql.field({ type: graphql.String }),
              },
            })
          ),

          async resolve(item, _, context) {
            // TODO: this could probably be better
            const posts = await context.db.Post.findMany({
              where: {
                id: {
                  not: {
                    equals: item.id,
                  },
                },
              },
              take: 10,
            })

            return posts.map(post => ({
              id: post.id,
              title: post.title,
            }))
          },
        }),
        ui: { query: '{ id, title }' },
      }),
      tags: virtual({
        field: (lists) => {
          return graphql.field({
            args: lists.Tag.types.findManyArgs,
            type: graphql.list(graphql.nonNull(lists.Tag.types.output)),
            async resolve(item, args, context) {
              return (await context.query.PostTag.findMany({
                where: {
                  post: {
                    id: {
                      equals: item.id,
                    }
                  },
                  tag: args.where
                },
                orderBy: { order: "asc" },
                query: `tag { ${Object.keys(context.__internal.lists.Tag.fields).join(" ")} }`
              })).map(x => ({ ...x.tag }))
            },
          })
        },
        ui: {
          views: "./fields/virtual/tags",
          query: "{ id title }"
        },
        hooks: {
          afterOperation: async ({ context, inputData, item, operation }) => {
            if (inputData && inputData.tags && Array.isArray(inputData.tags)) {
              await context.prisma.postTag.deleteMany({
                where: { postId: { equals: item.id } }
              })
              const PostTags = inputData.tags.map((t, order) => ({
                post: { connect: { id: item.id } },
                tag: { connect: { id: t.id.toString() } },
                order
              }))
              await context.query.PostTag.createMany({ data: PostTags })
            }
          }
        }
      }),
    },
    hooks: {
      // delete all PostTag records related to the Post being deleted
      beforeOperation: async ({ item, operation, context }) => {
        if (operation === "delete") {
          await context.prisma.postTag.deleteMany({
            where: { postId: { equals: item.id } }
          })
        }
      },
    },
  }),
  Tag: list({
    access: allowAll,
    fields: {
      title: text(),
    },
    hooks: {
      beforeOperation: async ({ item, operation, context }) => {
        // delete all PostTag records related to the Tag being deleted
        if (operation === "delete") {
          await context.prisma.postTag.deleteMany({
            where: { tagId: { equals: item.id } }
          })
        }
      },
    },
  }),
  PostTag: list({
    access: allowAll,
    fields: {
      post: relationship({ ref: "Post" }),
      tag: relationship({ ref: "Tag" }),
      order: integer({ defaultValue: 0 }),
    },
    ui: {
      // isHidden: true
    },
    db: {
      // Ensure a post can't bre related to the same tag multiple times
      extendPrismaSchema(schema) {
        return schema.replace(/\}/g, `
          @@unique([postId, tagId])
          @@unique([postId, order])
        }`)
      },
    }
  })
} satisfies Lists
