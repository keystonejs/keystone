const { MongoTextInterface, Text } = require('../Text/Implementation');

class Content extends Text {
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
      blocks: this.config.blocks.map(block => (Array.isArray(block) ? block[0] : block)),
    };
  }
}

class MongoContentInterface extends MongoTextInterface {}

module.exports = {
  Content,
  MongoContentInterface,
};
