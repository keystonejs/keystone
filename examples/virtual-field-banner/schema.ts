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
      banner: virtual({
        field: g.field({
          type: g.object<{
            messages: string[]
          }>()({
            name: 'Banner',
            fields: {
              messages: g.field({ type: g.list(g.String) }),
            },
          }),
          resolve(item) {
            const messages = []
            if (/profanity/i.test(item.content)) {
              messages.push('This post contains profanity')
            }
            if (item.archived) {
              messages.push('This post is archived')
            }
            return { messages }
          },
        }),
        ui: {
          views: './banner-field/views',
          query: '{ messages }',
          itemView: { fieldMode: 'read' },
          listView: { fieldMode: 'hidden' },
        },
      }),

      title: text({ validation: { isRequired: true } }),
      content: text({ validation: { isRequired: true } }),
      archived: checkbox({}),
    },
  }),
} satisfies Lists
