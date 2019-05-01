import { Node } from 'slate';
import { walkSlateNode } from './slate-walker';

// Convert a Node to JSON without the .nodes list, which avoids recursively
// calling .toJSON() on all child nodes.
function shallowNodeToJson(node) {
  if (node.nodes) {
    return node.set('nodes', Node.createList()).toJSON();
  }
  return node.toJSON();
}

/**
 * @param document Object For example:
 * [
 *   { object: 'block', type: 'cloudinaryImage', data: { file: <FileObject>, align: 'center' } },
 *   { object: 'block', type: 'cloudinaryImage', data: { file: <FileObject>, align: 'center' } },
 *   { object: 'block', type: 'relationshipTag', data: { name: 'foobar' } }
 *   { object: 'block', type: 'relationshipUser', data: { _joinIds: ['xyz789'], id: 'uoi678' } }
 * ]
 *
 * @return Object For example:
 * {
 *   document: [
 *     { object: 'block', type: 'cloudinaryImage', data: { _mutationPath: 'cloudinaryImages.create[0]' } },
 *     { object: 'block', type: 'cloudinaryImage', data: { _mutationPath: 'cloudinaryImages.create[1]' } },
 *     { object: 'block', type: 'relationshipTag', data: { _mutationPath: 'relationshipTags.create[0]' } }
 *     { object: 'block', type: 'relationshipUser', data: { _mutationPath: 'relationshipUsers.connect[0]' } }
 *   ],
 *   cloudinaryImages: {
 *     create: [
 *       { image: <FileObject>, align: 'center' },
 *       { image: <FileObject>, align: 'center' },
 *     ]
 *   },
 *   relationshipTags: {
 *     create: [{ tag: { create: { name: 'foobar' } } }],
 *   },
 *   relationshipUsers: {
 *     connect: [{ id: 'xyz789' }],
 *   },
 * }
 */
export function serialiseSlateValue(value, blocks) {
  const allMutations = {};

  const serializedDocument = walkSlateNode(value.document, {
    visitBlock(node) {
      const block = blocks[node.type];

      // No matching block that we're in charge of
      if (!block) {
        return;
      }

      const { mutations, node: serializedNode } = block.serialize({ value, node });

      if (mutations && Object.keys(mutations).length) {
        if (!serializedNode) {
          throw new Error(
            `Must return a serialized 'node' when returning 'mutations'. See '${
              block.constructor.name
            }#serialize()'.`
          );
        }

        // Ensure the mutation group exists
        allMutations[block.path] = allMutations[block.path] || {
          // TODO: Don't forcible disconnect & reconnect. (It works because we know
          // the entire document, so all creations & connections exist below).
          // Really, we should do a diff and only perform the things that have
          // actually changed. Although, this may be quite complex.
          disconnectAll: true,
        };

        // Ensure there's a .data._mutationPaths array
        serializedNode.data = serializedNode.data || {};
        serializedNode.data._mutationPaths = serializedNode.data._mutationPaths || [];

        // Gather up all the mutations, keyed by the block's path & the
        // "action" returned by the serialize call.
        Object.entries(mutations).forEach(([action, mutationData]) => {
          allMutations[block.path][action] = allMutations[block.path][action] || [];

          mutationData = Array.isArray(mutationData) ? mutationData : [mutationData];

          mutationData.forEach(mutation => {
            const insertedBefore = allMutations[block.path][action].push(mutation);

            const mutationPath = `${block.path}.${action}[${insertedBefore - 1}]`;

            serializedNode.data._mutationPaths.push(mutationPath);
          });
        });
      }

      return serializedNode ? serializedNode : null;
    },
    // Everything we don't handle, we turn into JSON, but still visit all
    // the child nodes.
    defaultVisitor(node, visitNode) {
      // visit this node first
      const visitedNode = shallowNodeToJson(node);

      if (node.nodes) {
        // Now we recurse into the child nodes array
        visitedNode.nodes = node.nodes.map(childNode => visitNode(childNode)).toJSON();
      }

      return visitedNode;
    },
  });

  return {
    document: serializedDocument,
    ...allMutations,
  };
}
