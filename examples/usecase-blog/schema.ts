import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import { text, relationship, timestamp } from '@keystone-6/core/fields'

// the document field is a more complicated field, so it has it's own package
import { document } from '@keystone-6/fields-document'
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from '.keystone/types'

export const lists = {
  Author: list({
    // WARNING
    //   for this example, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our Author list
    fields: {
      // by adding isRequired, we enforce that every Author should have a name
      //   if no name is provided, an error is displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },

        // by adding isIndexed: 'unique', we are saying that an author cannot have the same
        // email as another author - this may or may not be a good idea for your project
        isIndexed: 'unique',
      }),

      // we can use this field to see what Posts this Author has authored
      //   more on that in the Post list below
      posts: relationship({ ref: 'Post.author', many: true }),

      createdAt: timestamp({
        // default this timestamp to Date.now() when first created
        defaultValue: { kind: 'now' },
      }),
    },
  }),

  Post: list({
    // WARNING - for this example, anyone can create, query, update and delete anything
    access: allowAll,

    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   learn more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      // with this field, you can set a Author as the author for a Post
      author: relationship({
        // we could have used 'Author', but then the relationship would only be 1-way
        ref: 'Author.posts',

        // we customise how this will look in the AdminUI, for fun
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },

        many: false, // only 1 author for each Post (the default)
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        ref: 'Tag.posts',
        many: true, // a Post can have many Tags, not just one

        // we customise how this will look in the AdminUI, for fun
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
    },
  }),

  // this last list is our Tag list, it only has a name field for now
  Tag: list({
    // WARNING - for this example, anyone can create, query, update and delete anything
    access: allowAll,

    // we want to hide this list in the AdminUI
    ui: {
      isHidden: true,
    },

    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
