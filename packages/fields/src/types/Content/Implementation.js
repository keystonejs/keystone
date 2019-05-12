import getByPath from 'lodash.get';
import {
  MongoRelationshipInterface,
  KnexRelationshipInterface,
  Relationship,
} from '../Relationship/Implementation';
import { flatMap, unique, objMerge } from '@keystone-alpha/utils';
import paragraph from './blocks/paragraph';
import { walkSlateNode } from './slate-walker';
import RelationshipType from '../Relationship';
import TextType from '../Text';

const GQL_TYPE_PREFIX = '_ContentType';

const DEFAULT_BLOCKS = [paragraph];

function flattenBlockViews(block) {
  return [
    block.viewPath,
    ...(block.dependencies ? flatMap(block.dependencies, flattenBlockViews) : []),
  ];
}

/**
 * @param data Object For example:
 * {
 *   document: [
 *     { object: 'block', type: 'cloudinaryImage', data: { _mutationPath: 'cloudinaryImages.create[0]' },
 *     { object: 'block', type: 'cloudinaryImage', data: { _mutationPath: 'cloudinaryImages.create[1]' },
 *     { object: 'block', type: 'relationshipUser', data: { _mutationPath: 'relationshipUsers.create[0]' } }
 *     { object: 'block', type: 'relationshipUser', data: { _mutationPath: 'relationshipUsers.connect[0]' } }
 *   ],
 *   cloudinaryImages: {
 *     create: [
 *       { data: { image: <FileObject>, align: 'center' } },
 *       { data: { image: <FileObject>, align: 'center' } }
 *     ]
 *   },
 *   relationshipUsers: {
 *     create: [{ data: { id: 'abc123' } }],
 *     connect: [{ id: 'xyz789' }],
 *   },
 * }
 */
async function processSerialised(document, blocks, graphQlArgs) {
  // Each block retreives its mutations
  const resolvedMutations = blocks.reduce(
    (mutations, block) => ({
      ...mutations,
      ...block.getMutationOperationResults(graphQlArgs),
    }),
    {}
  );

  const result = {
    document: walkSlateNode(document, {
      visitBlock(node) {
        const block = blocks.find(({ type }) => type === node.type);

        if (!block) {
          if (node.data && node.data._mutationPath) {
            throw new Error(
              `Received mutation for ${node.type}, but no block types can handle it.`
            );
          }

          // A regular slate.js node - pass it through
          return node;
        }

        const _joinIds = node.data._mutationPaths.map(mutationPath => {
          const joinId = getByPath(resolvedMutations, mutationPath);
          if (!joinId) {
            throw new Error(`Slate document refers to unknown mutation '${mutationPath}'.`);
          }
          return joinId;
        });

        // NOTE: We don't recurse on the children; we only process the outer
        // most block, any child blocks are left as-is.
        return {
          ...node,
          data: { _joinIds },
        };
      },

      defaultVisitor(node, visitNode) {
        if (node.nodes) {
          // Recurse into the child nodes array
          node.nodes = node.nodes.map(childNode => visitNode(childNode));
        }

        return node;
      },
    }),
  };

  return result;
}

export class Content extends Relationship {
  constructor(path, { blocks, ...fieldConfig }, listConfig) {
    // To maintain consistency with other types, we grab the sanitised name
    // directly from the list.
    const { itemQueryName } = listConfig.getListByKey(listConfig.listKey).gqlNames;

    // We prefix with `_` here to avoid any possible conflict with a list called
    // `ContentType`.
    // Including the list name + path to make sure these input types are unique
    // to this list+field and don't collide.
    const type = `${GQL_TYPE_PREFIX}_${itemQueryName}_${path}`;

    const _blocks = Array.isArray(blocks) ? blocks : [];

    _blocks.push(
      ...DEFAULT_BLOCKS.filter(
        defaultBlock =>
          !_blocks.find(
            block => (Array.isArray(block) ? block[0] : block).type === defaultBlock.type
          )
      )
    );

    // Checking for duplicate block types
    for (let currentIndex = 0; currentIndex < _blocks.length; currentIndex++) {
      const currentBlock = blocks[currentIndex];
      const currentType = (Array.isArray(currentBlock) ? currentBlock[0] : currentBlock).type;
      for (let checkIndex = currentIndex + 1; checkIndex < blocks.length; checkIndex++) {
        const checkBlock = blocks[checkIndex];
        const checkType = (Array.isArray(checkBlock) ? checkBlock[0] : checkBlock).type;
        if (currentType === checkType) {
          throw new Error(`Encountered duplicate Content block type '${currentType}'.`);
        }
      }
    }

    const complexBlocks = _blocks
      .map(block => (Array.isArray(block) ? block : [block, {}]))
      .filter(([block]) => block.implementation)
      .map(
        ([block, blockConfig]) =>
          new block.implementation(blockConfig, {
            type: block.type,
            fromList: listConfig.listKey,
            joinList: type,
            createAuxList: listConfig.createAuxList,
            getListByKey: listConfig.getListByKey,
            listConfig,
          })
      );

    // Ensure the list is only instantiated once per server instance.
    let auxList = listConfig.getListByKey(type);

    if (!auxList) {
      auxList = listConfig.createAuxList(type, {
        fields: {
          // TODO: Change to a native JSON type
          document: {
            type: TextType,
            isRequired: true,
            schemaDoc: 'The serialized Slate.js Document structure',
          },

          // Used to do reverse lookups of Document -> Original Item
          from: {
            type: RelationshipType,
            ref: `${listConfig.listKey}.${path}`,
            schemaDoc: 'A reference back to the item this document belongs to',
          },

          // Gather up all the fields which blocks want to specify
          // (note: They may be Relationships to Aux Lists themselves!)
          ...objMerge(complexBlocks.map(block => block.fieldDefinitions)),
        },
        hooks: {
          async resolveInput({ resolvedData, ...args }) {
            // This method will get called twice;
            // 1. The incoming graphql request data
            // 2. Registering the back link in the `from` field
            // We only want to handle the first case, so we bail early otherwise
            if (!resolvedData.document) {
              return resolvedData;
            }

            // TODO: Remove JSON.parse once using native JSON type
            const documentObj = JSON.parse(resolvedData.document);
            const { document } = await processSerialised(documentObj, complexBlocks, args);
            return {
              ...resolvedData,
              // TODO: FIXME: Use a JSON type
              document: JSON.stringify(document),
            };
          },
        },
      });
    }

    // Link up the back reference to keep things in sync
    const config = { ...fieldConfig, many: false, ref: `${type}.from` };
    super(path, config, listConfig);

    this.auxList = auxList;
    this.listConfig = listConfig;
    this.blocks = _blocks;
  }

  /*
   * Blocks come in 2 halves:
   * 1. The block implementation (eg; ./views/editor/blocks/embed.js)
   * 2. The config (eg; { apiKey: process.env.EMBEDLY_API_KEY })
   * Because of the way we bundle the admin UI, we have to split apart these
   * two halves and send them seperately (see `@keystone-alpha/field-views-loader`):
   * 1. Sent as a "view" (see `extendViews` below), which will be required (so
   *    it's included in the bundle).
   * 2. Sent as a serialized JSON object (see `extendAdminMeta` below), which
   *    will be injected into the `window` and read back ready for use.
   * We then stitch those two halves back together within `views/Field.js`.
   */
  extendAdminMeta(meta) {
    return {
      ...meta,

      // These are the blocks which have been directly passed in to the Content
      // field (ie; it doesn't include dependencies unless they too were passed
      // in)
      blockTypes: this.blocks.map(block => (Array.isArray(block) ? block[0] : block).type),

      // Key the block options by type to be serialised and passed to the client
      blockOptions: this.blocks
        .filter(block => Array.isArray(block) && !!block[1])
        .reduce(
          (options, block) => ({
            ...options,
            [block[0].type]: block[1],
          }),
          {}
        ),
    };
  }

  // Add the blocks config to the views object for usage in the admin UI
  // (ie; { Cell: , Field: , Filters: , blocks: ...})
  extendViews(views) {
    return {
      ...views,
      blocks: unique(
        flatMap(this.blocks, block => flattenBlockViews(Array.isArray(block) ? block[0] : block))
      ),
    };
  }

  getGqlAuxTypes(...args) {
    return [...super.getGqlAuxTypes(...args), ...this.auxList.getGqlTypes(...args)];
  }

  get gqlAuxFieldResolvers() {
    return this.auxList.gqlFieldResolvers;
  }
}

export class MongoContentInterface extends MongoRelationshipInterface {}

export class KnexContentInterface extends KnexRelationshipInterface {}
