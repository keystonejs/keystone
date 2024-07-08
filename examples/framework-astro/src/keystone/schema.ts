// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import { text, select } from '@keystone-6/core/fields'

// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: {
      operation: allowAll,
      filter: {
        query: ({ session }) => {
          console.log('Post.access.filter session', session)

          // if it is an Astro user, return posts where the user's browser is what the Post is written for
          if (session?.user === 'astro' && session?.browser) {
            return {
              browser: { equals: session.browser },
            }
          }
          return true
        },
      },
    },

    // this is the fields for our Post list
    fields: {
      title: text({ validation: { isRequired: true } }),
      // we use this field to arbitrarily restrict Posts to only be viewed on a particular browser (using Post.access.filter)
      browser: select({
        validation: { isRequired: true },
        options: [
          { label: 'Chrome', value: 'chrome' },
          { label: 'Firefox', value: 'firefox' },
        ],
      }),
    },
  }),
} satisfies Lists
