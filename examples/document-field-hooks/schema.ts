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
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: document({
        relationships: {
          link: {
            listKey: 'Post',
            label: 'Link',
            labelField: 'title',
            selection: 'id title',
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
    },
    hooks: {
      resolveInput({ resolvedData }) {
        const { content } = resolvedData
        const related: string[] = []

        if (content) {
          mapNodes(content as Node[], (node, __parents) => {
            if (node.type === 'relationship' && node.data) {
              related.push(node.data.id)
            }

            return node
          })
        }
        return {
          ...resolvedData,
          related: {
            connect: related.map(id => ({ id })),
          },
        }
      },
    },
  }),
} satisfies Lists
