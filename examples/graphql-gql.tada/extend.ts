import { g } from "@keystone-6/core";
import type { Context } from '.keystone/types'
import { graphql } from "./tada";

export const extension = g.extend(() => ({
  query: {
    latestPostReadingTime: g.field({
      type: g.Int,
      async resolve(source, args, context: Context) { 
        const posts = await context.db.Post.findMany({ take: 1, orderBy: { publishDate: 'desc' } })
        const result = await context.graphql.fields({
          fragment: graphql(`
            fragment _ on Post {
              readingTime
            }
          `),
          source: posts[0]
        })
        return result.readingTime
      }
    })
  }
}))
