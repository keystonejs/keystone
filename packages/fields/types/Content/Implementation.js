const { MongoTextInterface, KnexTextInterface, Text } = require('../Text/Implementation');
const { flatMap, unique } = require('@keystone-alpha/utils');
const paragraph = require('./blocks/paragraph');

const GQL_TYPE_PREFIX = '_ContentType';

const DEFAULT_BLOCKS = [paragraph];

function flattenBlockViews(block) {
  return [
    block.viewPath,
    ...(block.dependencies ? flatMap(block.dependencies, flattenBlockViews) : []),
  ];
}

class Content extends Text {
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
      .map(blockConfig => {
        let Impl = blockConfig;
        let fieldConfig = {};

        if (Array.isArray(blockConfig)) {
          Impl = blockConfig[0];
          fieldConfig = blockConfig[1];
        }

        if (!Impl.isComplexDataType) {
          return null;
        }

        return new Impl(fieldConfig, {
          fromList: this.listKey,
          createAuxList: listConfig.createAuxList,
          getListByKey: listConfig.getListByKey,
          listConfig: this.listConfig,
        });
      })
      .filter(block => block);
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

  async resolveInput({ resolvedData }) {
    return resolvedData[this.path].document;
  }
}

class MongoContentInterface extends MongoTextInterface {}

class KnexContentInterface extends KnexTextInterface {}

module.exports = {
  Content,
  MongoContentInterface,
  KnexContentInterface,
};
