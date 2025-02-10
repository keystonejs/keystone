import { g } from "@keystone-6/core";
import type { Context } from '.keystone/types'
import { graphql } from "./tada";

export const extension = g.extend(schema => ({
  query: {
    latestPostReadingTime: g.field({
      type:g.Int,
      async resolve(source, args, context: Context) { 
        const x = await context.db.Post.findMany({where:{content:{contains:'something'}}})
        const result = await  context.graphql.fields({
          fragment:graphql(`fragment _ on Post {
            readingTime
          }`),
          source: x[0]
        })
        return result.readingTime
      }
    })
  }
}))