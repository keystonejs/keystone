import { list, graphql } from '@keystone-6/core'
import { text, checkbox, virtual } from '@keystone-6/core/fields'
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
          resolve (item) {
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
          resolve (item) {
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
          resolve (item, { length }) {
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

          async resolve (item, _, context) {
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
    },
  }),
} satisfies Lists
