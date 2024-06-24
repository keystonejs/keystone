import path from 'path'
import type { GraphQLSchema } from 'graphql'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { select, relationship, text, timestamp } from '@keystone-6/core/fields'
import * as nexus from 'nexus'

import type { Lists } from './keystone-types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: text(),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
} satisfies Lists

export function extendGraphqlSchema (baseSchema: GraphQLSchema) {
  const NexusPostQuery = nexus.extendType({
    type: 'Query',
    definition (t) {
      t.field('nexusPosts', {
        type: nexus.nonNull(nexus.list('Post')),
        args: {
          id: nexus.nonNull(nexus.stringArg()),
          seconds: nexus.nonNull(nexus.intArg({ default: 600 })),
        },

        async resolve (root, { id, seconds }, context) {
          const cutoff = new Date(Date.now() - seconds * 1000)

          // Note we use `context.db.Post` here as we have a return type
          // of [Post], and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.findMany({
            where: { author: { id: { equals: id } }, publishDate: { gt: cutoff } },
          }) as Promise<Lists.Post.Item[]> // TODO: nexus doesn't like <readonly Post[]>
        },
      })
    },
  })

  const NexusThing = nexus.objectType({
    name: 'NexusThing',
    definition (t) {
      t.int('id')
      t.string('title')
    },
  })

  const NexusThingQuery = nexus.extendType({
    type: 'Query',
    definition (t) {
      t.nonNull.list.field('things', {
        type: NexusThing,
        resolve () {
          return [
            { id: 1, title: 'Keystone' },
            { id: 2, title: 'Prisma' },
            { id: 3, title: 'Nexus' },
          ]
        },
      })
    },
  })

  return nexus.makeSchema({
    mergeSchema: {
      schema: baseSchema,
    },
    types: {
      NexusThing,
      NexusPostQuery,
      NexusThingQuery,
    },

    // Typescript output settings, probably something you might commit in dev
    //   TODO: remove false ??, it is not part of the example, but we are having monorepo issues
    // eslint-disable-next-line no-constant-binary-expression
    shouldGenerateArtifacts: false ?? process.env.NODE_ENV !== 'production',
    outputs: {
      typegen: path.join(process.cwd(), 'nexus-types.ts'),
    },
    contextType: {
      module: path.join(process.cwd(), 'keystone-types.ts'),
      export: 'Context',
    },
  })
}
