import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import { document, type Node } from '@keystone-6/fields-document'

import type { Lists } from '.keystone/types'

function mapNodes(
  nodes: Node[],
  cb: (node: Node, parents: Node[]) => Node | undefined,
  parents: Node[] = []
) {
  const result: Node[] = []
  for (const node of nodes) {
    const innerResult = cb(node, parents)
    if (!innerResult) continue
    if (!('children' in innerResult)) {
      result.push(innerResult)
      continue
    }
    result.push({
      ...innerResult,
      children: mapNodes(innerResult.children, cb, [...parents, node]),
    })
  }
  return result
}

export const lists = {
  Post: list({
    access: allowAll, // WARNING: public
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: document({
        relationships: {
          link: {
            listKey: 'Post',
            label: 'Link',
            labelField: 'title',
          },
          tag: {
            listKey: 'Tag',
            label: 'Tag',
            labelField: 'name',
          },
        },
        hooks: {
          validate({ resolvedFieldData, addValidationError }) {
            mapNodes(resolvedFieldData as Node[], (node, __parents) => {
              if ('text' in node) {
                if (/profanity/i.test(node.text))
                  addValidationError(`${node.text} is unacceptable content`)
              }

              return node
            })
          },
        },
      }),
      related: relationship({
        ref: 'Post',
        many: true,
        graphql: {
          omit: {
            create: true,
            update: true,
          },
        },
      }),
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
        graphql: {
          omit: {
            create: true,
            update: true,
          },
        },
      }),
    },
    hooks: {
      resolveInput({ operation, resolvedData }) {
        const { content } = resolvedData
        const posts: string[] = []
        const tags: string[] = []

        if (content) {
          mapNodes(content as Node[], (node, __parents) => {
            if (node.type === 'relationship' && node.data) {
              if (node.relationship === 'link') posts.push(node.data.id)
              if (node.relationship === 'tag') tags.push(node.data.id)
            }

            return node
          })
        }

        if (operation === 'create') {
          return {
            ...resolvedData,
            related: {
              connect: posts.map(id => ({ id })),
            },
            tags: {
              connect: tags.map(id => ({ id })),
            },
          }
        }

        return {
          ...resolvedData,
          related: {
            set: posts.map(id => ({ id })),
          },
          tags: {
            set: tags.map(id => ({ id })),
          },
        }
      },
    },
  }),

  Tag: list({
    access: allowAll, // WARNING: public
    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
