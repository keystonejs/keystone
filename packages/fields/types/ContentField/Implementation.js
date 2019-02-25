const pluralize = require('pluralize');

const { implementation: Text, adapters } = require('@voussoir/field-text');
const { flatten } = require('@voussoir/utils');

const GQL_TYPE_PREFIX = '_ContentType';

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
    const inputType = `${GQL_TYPE_PREFIX}_${itemQueryName}_${this.path}`;

    this.gqlTypes = {
      create: `${inputType}_CreateInput`,
      update: `${inputType}_UpdateInput`,
    };

    // Require here to avoid circular dependencies
    const Relationship = require('@voussoir/field-relationship').implementation;

    this.complexBlocks = this.config.blocks
      .map(blockConfig => {
        let Impl = blockConfig;
        let calculatedConfig = {};

        if (Array.isArray(blockConfig)) {
          Impl = blockConfig[0];
          calculatedConfig = blockConfig[1];
        }

        if (!Impl.isComplexDataType) {
          return null;
        }

        const block = new Impl(calculatedConfig, {
          fromList: this.listKey,
          createAuxList: listConfig.createAuxList,
          getListByKey: listConfig.getListByKey,
        });

        let relationship;
        if (block.auxList && block.auxList.key) {
          // When content blocks are specified that have complex KS5 datatypes,
          // the client needs to send them along as graphQL inputs separate to
          // the `structure`. Those inputs are relationships to our join tables.
          // Here we create a Relationship field to leverage existing
          // functionality for generating the graphQL schema.
          relationship = new Relationship(
            pluralize.plural(Impl.type),
            { ref: block.auxList.key, many: true },
            this.listConfig
          );
        }

        return {
          block,
          relationship,
        };
      })
      .filter(block => block);
  }
  /*
   * Blocks come in 2 halves:
   * 1. The block implementation (eg; ./views/editor/blocks/embed.js)
   * 2. The config (eg; { apiKey: process.env.EMBEDLY_API_KEY })
   * Because of the way we bundle the admin UI, we have to split apart these
   * two halves and send them seperately (see `@voussoir/field-views-loader`):
   * 1. Sent as a "view" (see `extendViews` below), which will be required (so
   *    it's included in the bundle).
   * 2. Sent as a serialized JSON object (see `extendAdminMeta` below), which
   *    will be injected into the `window` and read back ready for use.
   * We then stitch those two halves back together within `views/Field.js`.
   */
  extendAdminMeta(meta) {
    return {
      ...meta,
      // NOTE: We rely on order, which is why we end up with a sparse array
      blockOptions: this.config.blocks.map(block => (Array.isArray(block) ? block[1] : undefined)),
    };
  }
  // Add the blocks config to the views object for usage in the admin UI
  // (ie; { Cell: , Field: , Filters: , blocks: ...})
  extendViews(views) {
    return {
      ...views,
      blocks: this.config.blocks.map(block => (Array.isArray(block) ? block[0] : block).viewPath),
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
      structure: String
    `;

    return [
      ...super.getGqlAuxTypes(),
      /*
       * For example:
       *
         structure: String
         cloudinaryImages: _ContentType_cloudinaryImageRelateToManyInput
         relationships_User: _ContentType_relationship_UserRelateToManyInput
       */
      `
      input ${this.gqlTypes.create} {
        ${inputFields}
        ${flatten(
          this.complexBlocks.map(({ relationship }) => relationship.gqlCreateInputFields)
        ).join('\n')}
      }
      `,
      `
      input ${this.gqlTypes.update} {
        ${inputFields}
        ${flatten(
          this.complexBlocks.map(({ relationship }) => relationship.gqlUpdateInputFields)
        ).join('\n')}
      }
      `,
      ...this.complexBlocks.map(({ relationship }) => relationship.getGqlAuxTypes()),
    ];
  }
  get gqlOutputFieldResolvers() {
    // TODO: serialize / etc
    return {
      [`${this.path}`]: item => item[this.path],
    };
  }

  async resolveInput({ resolvedData }) {
    return resolvedData[this.path].structure;
  }
}

class MongoContentInterface extends adapters.mongoose {}

class KnexContentInterface extends adapters.knex {}

module.exports = {
  Content,
  MongoContentInterface,
  KnexContentInterface,
};
