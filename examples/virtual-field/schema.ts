import { list, gWithContext } from '@keystone-6/core'
import { text, checkbox, virtual } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

import type { Lists, Context } from '.keystone/types'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text({ validation: { isRequired: true } }),
      listed: checkbox({}),

      // primitive GraphQL type
      isActive: virtual({
        field: g.field({
          type: g.Boolean,
          resolve(item) {
            return item.title.length > 3 && item.content.length > 10 && item.listed === true
          },
        }),
      }),

      // object GraphQL type
      counts: virtual({
        field: g.field({
          type: g.object<{
            words: number
            sentences: number
            paragraphs: number
          }>()({
            name: 'PostCounts',
            fields: {
              words: g.field({ type: g.Int }),
              sentences: g.field({ type: g.Int }),
              paragraphs: g.field({ type: g.Int }),
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
        field: g.field({
          type: g.String,
          args: {
            length: g.arg({ type: g.nonNull(g.Int), defaultValue: 50 }),
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
        field: g.field({
          type: g.list(
            g.object<{
              id: string
              title: string
            }>()({
              name: 'RelatedPosts',
              fields: {
                id: g.field({ type: g.String }),
                title: g.field({ type: g.String }),
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
    },
  }),
} satisfies Lists
