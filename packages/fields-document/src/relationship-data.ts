import { type KeystoneContext } from '@keystone-6/core/types'
import { type Descendant } from 'slate'
import {
  type ExecutionResult,
  type GraphQLSchema,
  executeSync,
  parse,
} from 'graphql'
import weakMemoize from '@emotion/weak-memoize'

import {
  type ComponentBlock,
  type ComponentSchema,
  type RelationshipField,
} from './DocumentEditor/component-blocks/api-shared'

import { assertNever } from './DocumentEditor/component-blocks/utils'
import { type Relationships } from './DocumentEditor/relationship-shared'

const labelFieldAlias = '____document_field_relationship_item_label'
const idFieldAlias = '____document_field_relationship_item_id'

export function addRelationshipData (
  nodes: Descendant[],
  context: KeystoneContext,
  relationships: Relationships,
  componentBlocks: Record<string, ComponentBlock>
): Promise<Descendant[]> {
  return Promise.all(
    nodes.map(async (node): Promise<Descendant> => {
      if (node.type === 'relationship') {
        const relationship = relationships[node.relationship]
        if (!relationship) return node

        return {
          ...node,
          data: await fetchDataForOne(
            context,
            relationship.listKey,
            relationship.selection || '',
            node.data
          ),
        }
      }
      if (node.type === 'component-block') {
        const componentBlock = componentBlocks[node.component as string]
        if (componentBlock) {
          const [props, children] = await Promise.all([
            addRelationshipDataToComponentProps(
              { kind: 'object', fields: componentBlock.schema },
              node.props,
              (relationship, data) =>
                fetchRelationshipData(
                  context,
                  relationship.listKey,
                  relationship.many,
                  relationship.selection || '',
                  data
                )
            ),
            addRelationshipData(node.children, context, relationships, componentBlocks),
          ])
          return {
            ...node,
            props,
            children,
          }
        }
      }
      if ('children' in node && Array.isArray(node.children)) {
        return {
          ...node,
          children: await addRelationshipData(
            node.children,
            context,
            relationships,
            componentBlocks
          ),
        }
      }
      return node
    })
  )
}

export async function fetchRelationshipData (
  context: KeystoneContext,
  listKey: string,
  many: boolean,
  selection: string,
  data: any
) {
  if (!many) return fetchDataForOne(context, listKey, selection, data)

  const ids = Array.isArray(data) ? data.filter(item => item.id != null).map(x => x.id) : []
  if (!ids.length) return []

  const {
    graphql: {
      names: {
        listQueryName
      },
    },
    ui: {
      labelField
    }
  } = context.__internal.lists[listKey]
  const value = (await context.graphql.run({
    query: `query($ids: [ID!]!) {items:${listQueryName}(where: { id: { in: $ids } }) {${idFieldAlias}:id ${labelFieldAlias}:${labelField}\n${
      selection || ''
    }}}`,
    variables: { ids },
  })) as { items: { [idFieldAlias]: string | number, [labelFieldAlias]: string }[] }

  return Array.isArray(value.items)
    ? value.items.map(({ [labelFieldAlias]: label, [idFieldAlias]: id, ...data }) => {
        return { id, label, data }
      })
    : []
}

async function fetchDataForOne (
  context: KeystoneContext,
  listKey: string,
  selection: string,
  data: any
) {
  // Single related item
  const id = data?.id
  if (id == null) return null

  // An exception here indicates something wrong with either the system or the
  // configuration (e.g. a bad selection field). These will surface as system
  // errors from the GraphQL field resolver.
  const {
    graphql: {
      names: {
        itemQueryName
      },
    },
    ui: {
      labelField
    }
  } = context.__internal.lists[listKey]
  const value = (await context.graphql.run({
    query: `query($id: ID!) {item:${itemQueryName}(where: {id:$id}) {${labelFieldAlias}:${labelField}\n${selection}}}`,
    variables: { id },
  })) as { item: Record<string, any> | null }

  if (value.item === null) return { id, data: undefined, label: undefined }
  return {
    id,
    label: value.item[labelFieldAlias],
    data: (() => {
      const { [labelFieldAlias]: _ignore, ...otherData } = value.item
      return otherData
    })(),
  }
}

export async function addRelationshipDataToComponentProps (
  schema: ComponentSchema,
  value: any,
  fetchData: (relationship: RelationshipField<boolean>, data: any) => Promise<any>
): Promise<any> {
  switch (schema.kind) {
    case 'child': return value
    case 'form': return value
    case 'relationship': return fetchData(schema, value)
    case 'object': {
      return Object.fromEntries(
        await Promise.all(
          Object.keys(schema.fields).map(async key => [
            key,
            // if val[key] === undefined, we know a new field was added to the schema
            // but there is old data in the database that doesn't have the new field
            // we're intentionally not just magically adding it because we may want to
            // have a more optimised strategy of hydrating relationships so we don't
            // want to add something unrelated that requires the current "traverse everything" strategy
            value[key] === undefined
              ? undefined
              : await addRelationshipDataToComponentProps(schema.fields[key], value[key], fetchData),
          ])
        )
      )
    }
    case 'conditional': {
      return {
        discriminant: value.discriminant,
        value: await addRelationshipDataToComponentProps(
          schema.values[value.discriminant],
          value.value,
          fetchData
        ),
      }
    }
    case 'array': {
      return await Promise.all(
        (value as any[]).map(async innerVal =>
          addRelationshipDataToComponentProps(schema.element, innerVal, fetchData)
        )
      )
    }
  }
  assertNever(schema)
}
