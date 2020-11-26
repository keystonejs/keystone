import { Relationships } from './DocumentEditor/relationship';
import { BaseGeneratedListTypes, GqlNames, KeystoneGraphQLAPI } from '@keystone-next/types';
import { Node } from 'slate';

export function removeRelationshipData(nodes: Node[]): Node[] {
  return nodes.map(node => {
    if (node.type === 'relationship') {
      return {
        ...node,
        data: (node.data as any)?.id != null ? { id: (node.data as any).id } : null,
      };
    }
    if (node.type === 'component-block') {
      let newRelationshipValues: Record<string, any> = {};
      Object.keys(node.relationships as any).forEach(key => {
        const relationshipValue = (node.relationships as any)[key];
        newRelationshipValues[key] = {
          relationship: relationshipValue.relationship,
          data: Array.isArray(relationshipValue.data)
            ? relationshipValue.data.map(({ id }: any) => ({ id }))
            : relationshipValue.data?.id != null
            ? { id: relationshipValue.id }
            : null,
        };
      });
      return { ...node, relationships: newRelationshipValues };
    }

    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: removeRelationshipData(node.children as Node[]),
      };
    }
    return node;
  });
}

const labelField = '____document_field_relationship_item_label';
const idField = '____document_field_relationship_item_id';

export function addRelationshipData(
  nodes: Node[],
  graphQLAPI: KeystoneGraphQLAPI<Record<string, BaseGeneratedListTypes>>,
  relationships: Relationships,
  gqlNames: (listKey: string) => GqlNames
): Promise<Node[]> {
  let fetchData = async (relationship: Relationships[string], data: any) => {
    if (relationship.kind === 'prop' && relationship.many) {
      const ids = Array.isArray(data) ? data.filter(item => item.id != null).map(x => x.id) : [];

      if (ids.length) {
        let val = await graphQLAPI.run({
          query: `query($ids: [ID!]!) {items:${
            gqlNames(relationship.listKey).listQueryName
          }(where: {id_in:$ids}) {${idField}:id ${labelField}:${relationship.labelField}\n${
            relationship.selection || ''
          }}}`,
          variables: { ids },
        });

        return Array.isArray(val.items)
          ? val.items.map(({ [labelField]: label, [idField]: id, ...data }) => {
              return { id, label, data };
            })
          : [];
      }
      return [];
    } else {
      const id = data?.id;
      if (id != null) {
        let val = await graphQLAPI.run({
          query: `query($id: ID!) {item:${relationship.listKey}(where: {id:$id}) {${labelField}:${
            relationship.labelField
          }\n${relationship.selection || ''}}}`,
          variables: { id },
        });

        return val.item
          ? {
              id,
              label: val.item[labelField],
              data: (() => {
                const { [labelField]: _ignore, ...otherData } = val.item;
                return otherData;
              })(),
            }
          : null;
      }
    }
  };
  return Promise.all(
    nodes.map(async node => {
      if (node.type === 'relationship') {
        const relationship = relationships[node.relationship as string];
        if (relationship) {
          return { ...node, data: await fetchData(relationship, node.data) };
        }
        return node;
      }
      if (node.type === 'component-block') {
        let newRelationshipValues: Record<string, any> = {};
        await Promise.all(
          Object.keys(node.relationships as any).map(async key => {
            const relationshipValue = (node.relationships as any)[key];
            newRelationshipValues[key] = {
              relationship: relationshipValue.relationship,
              data: await fetchData(
                relationships[relationshipValue.relationship],
                relationshipValue.data
              ),
            };
          })
        );
        return { ...node, relationships: newRelationshipValues };
      }
      if (Array.isArray(node.children)) {
        return {
          ...node,
          children: await addRelationshipData(
            node.children as Node[],
            graphQLAPI,
            relationships,
            gqlNames
          ),
        };
      }
      return node;
    })
  );
}
