import { list } from '@keystone-6/core'

import { allowAll } from '@keystone-6/core/access'
import { text } from './1-text-field'
import { stars } from './2-stars-field'
import { pair } from './3-pair-field'
import { pair as pairNested } from './3-pair-field-nested'
import { pair as pairJson } from './3-pair-field-json'
import { feedback } from './4-conditional-field'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      content: text({
        ui: {
          description: 'A text field, with no null support',
        },

        hooks: {
          resolveInput: async ({ resolvedData, operation, inputData, item, fieldKey }) => {
            console.log('Post.content.hooks.resolveInput', {
              resolvedData,
              operation,
              inputData,
              item,
              fieldKey,
            })
            return resolvedData[fieldKey]
          },

          validateInput: async ({
            resolvedData,
            inputData,
            item,
            addValidationError,
            fieldKey,
          }) => {
            console.log('Post.content.hooks.validateInput', {
              resolvedData,
              inputData,
              item,
              fieldKey,
            })
          },
        },
      }),
      rating: stars({
        ui: {
          description: 'A star rating, with a scale of 5',
        },
      }),

      feedback: feedback({
        dependency: {
          field: 'rating',
          minimumValue: 3,
        },
        ui: {
          description: 'Additional feedback as to the rating',
        },
      }),

      pair: pair({
        ui: {
          description: 'One string, two database string fields (e.g "foo bar")',
        },
      }),
      pairNested: pairNested({
        ui: {
          description: 'Two strings, two database string fields (e.g "foo", "bar")',
        },
      }),
      pairJson: pairJson({
        ui: {
          description: 'Two strings, one database JSON field (e.g "foo", "bar")',
        },
      }),
    },
    hooks: {
      // TODO: this is an example of how hooks can be used multiple-column fields,
      //   but it isn't very meaningful in context
      resolveInput: {
        create: async ({ resolvedData, operation, inputData, item }) => {
          console.log('Post.hooks.resolveInput.create', {
            resolvedData,
            operation,
            inputData,
            item,
          })
          return {
            ...resolvedData,
            pair: {
              left: resolvedData.pair?.left ?? null,
              right: resolvedData.pair?.right ?? null,
            },
          }
        },
      },

      validateInput: async ({ resolvedData, operation, inputData, item, addValidationError }) => {
        console.log('Post.hooks.validateInput', { resolvedData, operation, inputData, item })

        if (Math.random() > 0.95) {
          addValidationError('oh oh, try again, this is part of the example')
        }
      },
    },
  }),
} satisfies Lists
