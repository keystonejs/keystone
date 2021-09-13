import {
  BaseGeneratedListTypes,
  GqlNames,
  KeystoneGraphQLAPI,
} from '@keystone-next/keystone/types';
import { Descendant } from 'slate';
import { GraphQLSchema, executeSync, parse } from 'graphql';
import weakMemoize from '@emotion/weak-memoize';
import { ComponentBlock, ComponentPropField } from './DocumentEditor/component-blocks/api';
import { assertNever } from './DocumentEditor/component-blocks/utils';
import { Relationships } from './DocumentEditor/relationship';

const labelFieldAlias = '____document_field_relationship_item_label';
const idFieldAlias = '____document_field_relationship_item_id';

export function addRelationshipData(
  nodes: Descendant[],
  graphQLAPI: KeystoneGraphQLAPI<Record<string, BaseGeneratedListTypes>>,
  relationships: Relationships,
  componentBlocks: Record<string, ComponentBlock>,
  gqlNames: (listKey: string) => GqlNames
): Promise<Descendant[]> {
  let fetchData = async (relationshipKey: string, data: any) => {
    const relationship = relationships[relationshipKey];
    if (!relationship) return data;
    if (relationship.kind === 'prop' && relationship.many) {
      const ids = Array.isArray(data) ? data.filter(item => item.id != null).map(x => x.id) : [];

      if (ids.length) {
        const labelField = getLabelFieldsForLists(graphQLAPI.schema)[relationship.listKey];
        let val = await graphQLAPI.run({
          query: `query($ids: [ID!]!) {items:${
            gqlNames(relationship.listKey).listQueryName
          }(where: { id: { in: $ids } }) {${idFieldAlias}:id ${labelFieldAlias}:${labelField}\n${
            relationship.selection || ''
          }}}`,
          variables: { ids },
        });

        return Array.isArray(val.items)
          ? val.items.map(({ [labelFieldAlias]: label, [idFieldAlias]: id, ...data }) => {
              return { id, label, data };
            })
          : [];
      }
      return [];
    } else {
      // Single related item
      const id = data?.id;
      if (id != null) {
        const labelField = getLabelFieldsForLists(graphQLAPI.schema)[relationship.listKey];
        // An exception here indicates something wrong with either the system or the
        // configuration (e.g. a bad selection field). These will surface as system
        // errors from the GraphQL field resolver.
        const val = await graphQLAPI.run({
          query: `query($id: ID!) {item:${
            gqlNames(relationship.listKey).itemQueryName
          }(where: {id:$id}) {${labelFieldAlias}:${labelField}\n${relationship.selection || ''}}}`,
          variables: { id },
        });
        if (val.item === null) {
          if (!process.env.TEST_ADAPTER) {
            // If we're unable to find the item (e.g. we have a dangling reference), or access was denied
            // then simply return { id } and leave `label` and `data` undefined.
            const r = JSON.stringify(relationship);
            console.error(`Unable to fetch relationship data: relationship: ${r}, id: ${id} `);
          }
          return { id };
        }
        return {
          id,
          label: val.item[labelFieldAlias],
          data: (() => {
            const { [labelFieldAlias]: _ignore, ...otherData } = val.item;
            return otherData;
          })(),
        };
      } else {
        return null;
      }
    }
  };
  return Promise.all(
    nodes.map(async node => {
      if (node.type === 'relationship') {
        return { ...node, data: await fetchData(node.relationship as string, node.data) };
      }
      if (node.type === 'component-block') {
        const componentBlock = componentBlocks[node.component as string];
        if (componentBlock) {
          const [props, children] = await Promise.all([
            addRelationshipDataToComponentProps(
              { kind: 'object', value: componentBlock.props },
              node.props,
              fetchData
            ),
            addRelationshipData(
              node.children,
              graphQLAPI,
              relationships,
              componentBlocks,
              gqlNames
            ),
          ]);
          return {
            ...node,
            props,
            children,
          };
        }
      }
      if ('children' in node && Array.isArray(node.children)) {
        return {
          ...node,
          children: await addRelationshipData(
            node.children,
            graphQLAPI,
            relationships,
            componentBlocks,
            gqlNames
          ),
        };
      }
      return node;
    })
  );
}

async function addRelationshipDataToComponentProps(
  prop: ComponentPropField,
  val: any,
  fetchData: (relationship: string, data: any) => Promise<any>
): Promise<any> {
  switch (prop.kind) {
    case 'child':
    case 'form': {
      return val;
    }
    case 'relationship': {
      return fetchData(prop.relationship, val);
    }
    case 'object': {
      return Object.fromEntries(
        await Promise.all(
          Object.keys(prop.value).map(async key => [
            key,
            await addRelationshipDataToComponentProps(prop.value[key], val[key], fetchData),
          ])
        )
      );
    }
    case 'conditional': {
      return {
        discriminant: val.discriminant,
        value: await addRelationshipDataToComponentProps(
          prop.values[val.discriminant],
          val.value,
          fetchData
        ),
      };
    }
  }
  assertNever(prop);
}

const document = parse(`
  query {
    keystone {
      adminMeta {
        lists {
          key
          labelField
        }
      }
    }
  }
`);

export const getLabelFieldsForLists = weakMemoize(function getLabelFieldsForLists(
  schema: GraphQLSchema
): Record<string, string> {
  const { data, errors } = executeSync({
    schema,
    document,
    contextValue: { isAdminUIBuildProcess: true },
  });
  if (errors?.length) {
    throw errors[0];
  }
  return Object.fromEntries(
    data!.keystone.adminMeta.lists.map((x: any) => [x.key, x.labelField as string])
  );
});
