/* eslint-disable @typescript-eslint/consistent-type-imports */
import { list, gWithContext } from '@keystone-6/core'
import { relationship, text, timestamp, virtual } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { gql } from '@ts-gql/tag/no-transform'

import type { Lists, Context } from '.keystone/types'

const LatestPostQuery = gql`
  query LastestPostQuery($id: ID!) {
    author(where: { id: $id }) {
      id
      posts(orderBy: { publishDate: desc }, take: 1) {
        id
        title
      }
    }
  }
` as import('./__generated__/ts-gql/LastestPostQuery').type

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      publishDate: timestamp({ validation: { isRequired: true }, defaultValue: { kind: 'now' } }),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
      // A virtual field which returns a type derived from a Keystone list.
      latestPost: virtual({
        field: lists =>
          g.field({
            type: lists.Post.types.output,
            async resolve(item, args, context) {
              const data = await context.graphql.run({
                query: LatestPostQuery,
                variables: { id: item.id },
              })
              const posts = data?.author?.posts
              if (posts && posts.length > 0) {
                return context.db.Post.findOne({ where: { id: posts[0].id } })
              }
            },
          }),
        ui: { query: '{ title publishDate }' },
      }),
    },
  }),
} satisfies Lists
