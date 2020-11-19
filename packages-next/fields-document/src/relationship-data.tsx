import { Relationships } from './DocumentEditor/relationship';
import { BaseGeneratedListTypes, KeystoneGraphQLAPI } from '@keystone-next/types';
import { Node } from 'slate';

export function removeRelationshipData(nodes: Node[]): Node[] {
  return nodes.map(node => {
    if (node.type === 'relationship') {
      return {
        ...node,
        data: (node.data as any)?.id != null ? { id: (node.data as any).id } : null,
      };
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

export function addRelationshipData(
  nodes: Node[],
  graphQLAPI: KeystoneGraphQLAPI<Record<string, BaseGeneratedListTypes>>,
  relationships: Relationships
): Promise<Node[]> {
  return Promise.all(
    nodes.map(async node => {
      if (node.type === 'relationship') {
        const relationship = relationships[node.relationship as string];
        const id = (node.data as any)?.id;
        if (id != null && relationship) {
          let val = await graphQLAPI.run({
            query: `query($id: ID!) {item:${relationship.listKey}(where: {id:$id}) {label:${relationship.labelField}}}`,
            variables: { id },
          });
          return {
            ...node,
            data: val.item ? { id, label: val.item.label } : null,
          };
        }
        return node;
      }
      if (Array.isArray(node.children)) {
        return {
          ...node,
          children: await addRelationshipData(node.children as Node[], graphQLAPI, relationships),
        };
      }
      return node;
    })
  );
}
