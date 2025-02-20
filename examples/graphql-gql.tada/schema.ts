import { list, g } from '@keystone-6/core'
import { relationship, text, timestamp, virtual } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { graphql } from './tada'
import type { Lists } from '.keystone/types'
// this import will add support for using gql.tada fragments in `context.query`
import type {} from '@keystone-6/core/gql.tada'

const LatestPostQuery = graphql(`
  query LastestPostQuery($id: ID!) {
    author(where: { id: $id }) {
      id
      posts(orderBy: { publishDate: desc }, take: 1) {
        id
      }
    }
  }
`)

export const lists: Lists = {
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
      latestPostTitle: virtual({
        field: g.field({
          type: g.String,
          async resolve(item, args, context) {
            const data = await context.query.Post.findMany({
              where: { author: { id: { equals: item.id } } },
              orderBy: { publishDate: 'desc' },
              query: graphql(`
                fragment _ on Post {
                  title
                }
              `),
              take: 1,
            })
            return data[0]?.title
          },
        }),
      }),
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
