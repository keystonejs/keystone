import { gWithContext, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import type { Context, Lists } from '.keystone/types'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
} satisfies Lists

export const extendGraphqlSchema = g.extend(base => {
  return {
    query: {
      searchPosts: g.field({
        type: g.list(g.nonNull(base.object('Post'))),
        args: {
          query: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve(source, { query }, context) {
          // The `search` operator is a Prisma preview feature (fullTextSearchPostgres)
          // and is not available through Keystone's context.db layer, so we use the
          // raw Prisma client directly here.
          //
          // PostgreSQL full-text search operators:
          //   &   AND  — "cat & dog"  matches text containing both words
          //   |   OR   — "cat | dog"  matches text containing either word
          //   !   NOT  — "!cat"       matches text that does not contain the word
          //   <-> Phrase — "fox <-> dog" matches when "dog" immediately follows "fox"
          const matches = await context.prisma.post.findMany({
            where: {
              OR: [{ title: { search: query } }, { content: { search: query } }],
            },
            select: { id: true },
          })

          const ids = matches.map(p => p.id)

          // Fetch proper Keystone-typed Post objects using the matched IDs
          return context.db.Post.findMany({
            where: { id: { in: ids } },
          })
        },
      }),
    },
  }
})
