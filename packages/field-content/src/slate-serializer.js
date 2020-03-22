import { Node } from 'slate';
import assert from 'nanoassert';
import { walkSlateTree } from './slate-walker';

/**
 * A normalized & serialized version of a Slate.js Node
 * @typedef {Object} SerializedNode
 * @property {Object} mutations KS5 GraphQL nested mutations, the IDs of which
 * will be stored in a `data._joinIds` array.
 * @property {Object} node A JSON representation of a Slate.js Node with
 * mutation data removed.
 */

/**
 * Convert a Slate.js Node into a JSON representation while extracting out any
 * GraphQL mutations which can be executed by the Keystone API.
 * @callback serialize
 * @param {Object} input
 * @param {Object} input.value A Slate.js Value
 * @param {Object} input.node A Slate.js Node
 * @return {SerializedNode}
 */

/**
 * @callback deserialize
 * @param {Object} input
 * @param {Object} input.node A Slate.js Node which will have a `data._joins`
 * array containing values that are IDs in the `input.joins` array
 * @param {Object[]} input.joins Array of joins data as plucked from
 * deserialize()
 * @return {Object} A Slate.js Node
 */

/**
 * @typedef {Object} Block
 * @property {String} type The unique type this block is for
 * @property {String} path The path into the data to lookup joined values
 * @property {serialize} serialize
 * @property {deserialize} deserialize
 */

/**
 * @param value Object A Slate.js Value. For example:
 * {
 *   document: [
 *     { object: 'block', type: 'cloudinaryImage', data: { file: <FileObject>, align: 'center' } },
 *     { object: 'block', type: 'cloudinaryImage', data: { file: <FileObject>, align: 'center' } },
 *     { object: 'block', type: 'relationshipTag', data: { name: 'foobar' } }
 *     { object: 'block', type: 'relationshipUser', data: { _joinIds: ['xyz789'], id: 'uoi678' } }
 *   ]
 * }
 * @param {Object.<string, Block>} blocks Blocks keyed by their type
 *
 * @return Object For example:
 * @example
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
export function serialize(value, blocks) {
  const allMutations = {};

  const serializedDocument = walkSlateTree(value, node => {
    const block = blocks[node.type];

    // No matching block that we're in charge of
    if (!block || typeof block.serialize !== 'function') {
      return node;
    }

    const { mutations, node: serializedNode } = block.serialize({ value, node, blocks });

    if (mutations && Object.keys(mutations).length) {
      if (!serializedNode) {
        throw new Error(
          `Must return a serialized 'node' when returning 'mutations'. See '${block.constructor.name}#serialize()'.`
        );
      }

      if (!block.path) {
        throw new Error(
          `No mutation path set for block view type '${block.type}'. Ensure the block's view exports a 'path' key corresponding to the mutation path for saving block data`
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

      // Ensure there's a _mutationPaths array
      serializedNode._mutationPaths = serializedNode._mutationPaths || [];

      // Gather up all the mutations, keyed by the block's path & the
      // "action" returned by the serialize call.
      Object.entries(mutations).forEach(([action, mutationData]) => {
        allMutations[block.path][action] = allMutations[block.path][action] || [];

        mutationData = Array.isArray(mutationData) ? mutationData : [mutationData];

        mutationData.forEach(mutation => {
          const insertedBefore = allMutations[block.path][action].push(mutation);

          const mutationPath = `${block.path}.${action}[${insertedBefore - 1}]`;

          serializedNode._mutationPaths.push(mutationPath);
        });
      });
    }

    return serializedNode ? serializedNode : node;
  });

  return {
    document: serializedDocument,
    ...allMutations,
  };
}

/**
 * @param {Object} data Object For example:
 * {
 *   document: [
 *     { object: 'block', type: 'cloudinaryImage', data: { _joinIds: ['abc123'] } },
 *     { object: 'block', type: 'cloudinaryImage', data: { _joinIds: ['qwe345'] } },
 *     { object: 'block', type: 'relationshipUser', data: { _joinIds: ['ert567'] } }
 *     { object: 'block', type: 'relationshipUser', data: { _joinIds: ['xyz890'] } }
 *   ],
 *   cloudinaryImages: [
 *     { id: 'abc123', publicUrl: '...', align: 'center' },
 *     { id: 'qwe345', publicUrl: '...', align: 'center' },
 *   ],
 *   relationshipUsers: [
 *     { id: 'ert567', user: { id: 'dfg789' } },
 *     { id: 'xyz890', user: { id: 'uoi678' } },
 *   ],
 * }
 * @param {Object.<string, Block>} blocks Blocks keyed by their type
 *
 * @return Object A Slate.js Document with all the _joinIds data inlined into
 * the appropriate blocks
 */
export function deserialize({ document, ...serializations }, blocks) {
  assert(!!document, 'Must pass document to deserialize()');
  assert(!!blocks, 'Must pass blocks to deserialize()');

  return walkSlateTree(document, node => {
    const { type, _joinIds = [] } = node;

    const block = blocks[type];

    // No matching block that we're in charge of
    if (!block || typeof block.deserialize !== 'function') {
      return node;
    }

    // Pick out the data set based on the block's path
    const data = serializations[block.path];

    const joins = _joinIds.map(joinId => data.find(({ id }) => joinId === id));

    // NOTE: deserialize _may_ return null.
    const newNode = block.deserialize({ node, joins, blocks });

    if (!newNode) {
      return node;
    }

    if (!Node.isNode(newNode)) {
      throw new Error(`${block.constructor.name}#deserialize() must return a Slate.js Node.`);
    }

    return newNode;
  });
}
