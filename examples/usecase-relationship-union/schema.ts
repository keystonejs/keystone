import { list, graphql } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, relationship, virtual } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

function ifUnsetHideUI (field: string, mode = 'edit' as const) {
  return {
    itemView: {
      fieldMode: ({ item }: any) => item[field] ? mode : 'hidden',
    },
    listView: {
      fieldMode: () => 'hidden' as const,
    },
  }
}

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
      plural: 'Medias'
    },
    fields: {
      label: virtual({
        field: graphql.field({
          type: graphql.String,
          resolve: async (item, _, context) => {
            const { postId, linkId } = item;
            if (postId) return (await context.db.Post.findOne({ where: { id: postId } }))?.title ?? '[missing]';
            if (linkId) return (await context.db.Link.findOne({ where: { id: linkId } }))?.title ?? '[missing]';
            return '?';
          },
        }),
      }),
      description: text(),

      post: relationship({
        ref: 'Post',
        ui: {
          ...ifUnsetHideUI('postId')
        }
      }),

      link: relationship({
        ref: 'Link',
        ui: {
          ...ifUnsetHideUI('linkId')
        }
      }),
    },

    hooks: {
      validateInput: async ({ operation, inputData, addValidationError }) => {
        if (operation === 'create') {
          const { post, link } = inputData;
          const values = [post, link].filter(x => x?.connect ?? x?.create)
          if (values.length === 0) {
            return addValidationError('A relationship is required')
          }
        }

        if (operation === 'update') {
          const { post, link } = inputData;
          if ([post, link].some(x => x?.disconnect)) {
            return addValidationError('Cannot change relationship type')
          }

          const values = [post, link].filter(x => x?.connect ?? x?.create)
          if (values.length > 1) {
            addValidationError('Only one relationship at a time')
          }

          // TODO: prevent item from changing types with implicit disconnect
        }
      },
      resolveInput: {
        update: async ({ context, operation, resolvedData }) => {
          const { post, link, ...rest } = resolvedData;
          for (const [key, value] of Object.entries({ post, link })) {
            if (!value) continue
            if (value.disconnect) continue // TODO: null should disconnect

            // disconnect everything else
            return {
              ...rest,
              post: { disconnect: true },
              link: { disconnect: true },
              [key]: value
            }
          }

          return rest
        }
      }
    }
  }),
};
