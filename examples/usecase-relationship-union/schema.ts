import { list, group, gWithContext } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship, virtual, select } from '@keystone-6/core/fields'
import type { Lists, Context } from '.keystone/types'

const hiddenIfWrongKind = (kind: 'post' | 'link') =>
  ({
    createView: {
      fieldMode: {
        edit: { type: { equals: kind } },
      },
    },
    itemView: {
      fieldMode: {
        edit: { type: { equals: kind } },
      },
    },
    listView: {
      fieldMode: 'hidden',
    },
  }) as const

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const lists: Lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text(),
      content: text(),
    },
  }),

  Link: list({
    access: allowAll,
    fields: {
      title: text(),
      url: text(),
    },
  }),

  // an unoptimised union relationship list type, each item represents only a Post, or a Link
  Media: list({
    access: allowAll,
    graphql: {
      plural: 'Medias',
    },
    fields: {
      label: virtual({
        field: g.field({
          type: g.String,
          resolve: async (item, _, context) => {
            const { postId, linkId } = item
            if (postId) {
              return (
                (await context.db.Post.findOne({ where: { id: postId } }))?.title ?? '[missing]'
              )
            }
            if (linkId) {
              return (
                (await context.db.Link.findOne({ where: { id: linkId } }))?.title ?? '[missing]'
              )
            }
            return '?'
          },
        }),
      }),
      description: text(),

      ...group({
        label: 'Media Type',
        fields: {
          type: select({
            options: [
              { label: 'Post', value: 'post' },
              { label: 'Link', value: 'link' },
            ],
            defaultValue: 'post',
            validation: { isRequired: true },
            type: 'enum',
          }),
          post: relationship({
            ref: 'Post',
            ui: hiddenIfWrongKind('post'),
          }),

          link: relationship({
            ref: 'Link',
            ui: hiddenIfWrongKind('link'),
          }),
        },
      }),
    },

    hooks: {
      validate: {
        create: async ({ resolvedData, addValidationError }) => {
          const { post, link, type } = resolvedData
          if (!type) return addValidationError('Media type is required')
          if (type === 'post' && !post?.connect && !post?.create)
            return addValidationError('A post relationship is required')
          if ((type === 'post' && link?.connect) || link?.create)
            return addValidationError('A link relationship cannot be selected with a post')
          if (type === 'link' && !link?.connect && !link?.create)
            return addValidationError('A link relationship is required')
          if ((type === 'link' && post?.connect) || post?.create)
            return addValidationError('A post relationship cannot be selected with a link')
        },
        update: async ({ resolvedData, addValidationError, item }) => {
          let { post, link, type } = resolvedData
          if (!type) type = item.type
          if (type === 'post' && !post?.disconnect)
            return addValidationError('A post relationship is required')
          if ((type === 'post' && link?.connect) || link?.create)
            return addValidationError('A link relationship cannot be selected with a post')
          if (type === 'link' && link?.disconnect)
            return addValidationError('A link relationship is required')
          if ((type === 'link' && post?.connect) || post?.create)
            return addValidationError('A post relationship cannot be selected with a link')
          // TODO: prevent item from changing types with implicit disconnect
        },
      },
      resolveInput: {
        update: async ({ resolvedData, item }) => {
          const type = (typeof resolvedData.type === 'string' ? resolvedData.type : item.type) as
            | 'post'
            | 'link'
          // disconnect everything else
          return {
            ...resolvedData,
            post: { disconnect: true },
            link: { disconnect: true },
            [type]: resolvedData[type],
          }
        },
      },
    },
  }),
} satisfies Lists
