import getByPath from 'lodash.get';
import { MongoTextInterface, KnexTextInterface, Text } from '../Text/Implementation';
import { flatMap, unique, resolveAllKeys, mapKeys } from '@keystone-alpha/utils';
import paragraph from './blocks/paragraph';
import { walkSlateNode } from './slate-walker';

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
async function processSerialised({ document, ...nestedMutations }, blocks, graphQlArgs) {
  // TODO: Remove this once we use a JSON input type for the value
  const inputDocument = JSON.parse(document);

  // Each block executes its mutations
  const resolvedMutations = await resolveAllKeys(
    mapKeys(nestedMutations, (mutations, path) => {
      const block = blocks.find(aBlock => aBlock.path === path);

      if (!block) {
        throw new Error(
          `Unable to perform '${path}' mutations: No known block can handle this path.`
        );
      }

      return block.processMutations(mutations, graphQlArgs);
    })
  );

  const result = {
    document: walkSlateNode(inputDocument, {
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

export class Content extends Text {
  constructor(path, config, listConfig) {
    super(...arguments);

    this.listConfig = listConfig;

    // To maintain consistency with other types, we grab the sanitised name
    // directly from the list.
    const { itemQueryName } = this.getListByKey(this.listKey).gqlNames;

    // We prefix with `_` here to avoid any possible conflict with a list called
    // `ContentType`.
    // Including the list name + path to make sure these input types are unique
    // to this list+field and don't collide.
    const type = `${GQL_TYPE_PREFIX}_${itemQueryName}_${this.path}`;

    this.gqlTypes = {
      create: `${type}_CreateInput`,
      update: `${type}_UpdateInput`,
      output: type,
    };

    this.blocks = Array.isArray(this.config.blocks) ? this.config.blocks : [];

    this.blocks.push(
      ...DEFAULT_BLOCKS.filter(
        defaultBlock =>
          !this.blocks.find(
            block => (Array.isArray(block) ? block[0] : block).type === defaultBlock.type
          )
      )
    );

    // Checking for duplicate block types
    for (let currentIndex = 0; currentIndex < this.blocks.length; currentIndex++) {
      const currentBlock = this.blocks[currentIndex];
      const currentType = (Array.isArray(currentBlock) ? currentBlock[0] : currentBlock).type;
      for (let checkIndex = currentIndex + 1; checkIndex < this.blocks.length; checkIndex++) {
        const checkBlock = this.blocks[checkIndex];
        const checkType = (Array.isArray(checkBlock) ? checkBlock[0] : checkBlock).type;
        if (currentType === checkType) {
          throw new Error(`Encountered duplicate Content block type '${currentType}'.`);
        }
      }
    }

    this.complexBlocks = this.blocks
      .map(block => (Array.isArray(block) ? block : [block, {}]))
      .filter(([block]) => block.implementation)
      .map(
        ([block, blockConfig]) =>
          new block.implementation(blockConfig, {
            type: block.type,
            fromList: this.listKey,
            createAuxList: listConfig.createAuxList,
            getListByKey: listConfig.getListByKey,
            listConfig: this.listConfig,
          })
      );
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

  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.gqlTypes.update}`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ${this.gqlTypes.create}`];
  }
  getGqlAuxTypes() {
    const inputFields = `
      document: String
    `;

    return [
      ...super.getGqlAuxTypes(),
      /*
       * For example:
       *
         document: String
         cloudinaryImages: _ContentType_cloudinaryImageRelateToManyInput
         relationships_User: _ContentType_relationship_UserRelateToManyInput
       */
      `
      input ${this.gqlTypes.create} {
        ${inputFields}
        ${flatMap(this.complexBlocks, block =>
          flatMap(block.getGqlInputFields(), field => field.gqlCreateInputFields)
        ).join('\n')}
      }
      `,
      `
      input ${this.gqlTypes.update} {
        ${inputFields}
        ${flatMap(this.complexBlocks, block =>
          flatMap(block.getGqlInputFields(), field => field.gqlUpdateInputFields)
        ).join('\n')}
      }
      `,
      ...flatMap(this.complexBlocks, block =>
        flatMap(block.getGqlInputFields(), field => field.getGqlAuxTypes())
      ),
      `
      type ${this.gqlTypes.output} {
        document: String
        ${flatMap(this.complexBlocks, block =>
          flatMap(block.getGqlOutputFields(), field => field.gqlOutputFields)
        ).join('\n')}
      }
      `,
    ];
  }

  get gqlAuxFieldResolvers() {
    return {
      [this.gqlTypes.output]: item => item,
    };
  }

  get gqlOutputFields() {
    return [`${this.path}: ${this.gqlTypes.output}`];
  }

  get gqlOutputFieldResolvers() {
    // TODO: serialize / etc
    return {
      [this.path]: item => ({
        document: item[this.path],
      }),
    };
  }

  async resolveInput({ resolvedData, ...args }) {
    const { document } = await processSerialised(resolvedData[this.path], this.complexBlocks, args);
    // TODO: FIXME: Use a JSON type
    return JSON.stringify(document);
  }
}

export class MongoContentInterface extends MongoTextInterface {}

export class KnexContentInterface extends KnexTextInterface {}
