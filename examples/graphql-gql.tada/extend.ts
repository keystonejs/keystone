import { g } from '@keystone-6/core'
import type { Context } from '.keystone/types'
import { graphql } from './tada'
// this import is necessary to have somewhere in your project
// to cause the types for `context.graphql.fields` to be included
import '@keystone-6/core/gql.tada'

export const extension = g.extend(() => ({
  query: {
    latestPostPublishDate: g.field({
      type: g.String,
      async resolve(source, args, context: Context) {
        const posts = await context.db.Post.findMany({ take: 1, orderBy: { publishDate: 'desc' } })
        const result = await context.graphql.fields({
          fragment: graphql(`
            fragment _ on Post {
              publishDate
            }
          `),
          source: posts[0],
        })
        return result.publishDate
      },
    }),
  },
}))
