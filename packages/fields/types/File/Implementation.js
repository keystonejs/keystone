const Implementation = require('../../Implementation');

const { escapeRegExp: esc } = require('@keystonejs/utils');
const { GraphQLUpload } = require('apollo-upload-server');
const {
  Types: { ObjectId },
} = require('mongoose');

module.exports = class File extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLType = 'File_File';
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: {
        ...mongooseOptions,
        type: {
          id: ObjectId,
          path: String,
          filename: String,
          mimetype: String,
          _meta: Object,
        },
      },
    });
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      directory: this.config.directory,
      route: this.config.route,
    };
  }
  getGraphqlQueryArgs() {
    return '';
  }
  getFileUploadType() {
    return 'File_Upload';
  }
  getGraphqlAuxiliaryTypes() {
    return `
      scalar ${this.getFileUploadType()}

      type ${this.graphQLType} {
        id: ID
        path: String
        filename: String
        mimetype: String
        encoding: String
        publicUrl: String
      }
    `;
  }
  // Called on `User.avatar` for example
  getGraphqlFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }
        return {
          publicUrl: this.config.adapter.publicUrl(itemValues),
          ...itemValues,
        };
      },
    };
  }
  getGraphqlAuxiliaryTypeResolvers() {
    return {
      [this.getFileUploadType()]: GraphQLUpload,
    };
  }
  getGraphqlAuxiliaryMutations() {
    return `
      uploadFile(file: ${this.getFileUploadType()}!): ${this.graphQLType}
    `;
  }
  getGraphqlAuxiliaryMutationResolvers() {
    return {
      /**
       * @param obj {Object} ... an object
       * @param data {Object} With key `file`
       */
      uploadFile: () => {
        throw new Error('uploadFile mutation not implemented');
        //return this.processUpload(file);
      },
    };
  }
  async saveStream(uploadData, previousData) {
    // TODO: FIXME: Handle when uploadData is null. Can happen when:
    // Deleting the file
    if (!uploadData) {
      return null;
    }

    const {
      stream,
      filename: originalFilename,
      mimetype,
      encoding,
    } = await uploadData;

    if (!stream && previousData) {
      // TODO: FIXME: Handle when stream is null. Can happen when:
      // Updating some other part of the item, but not the file (gets null
      // because no File DOM element is uploaded)
      return previousData;
    }

    const newId = new ObjectId();

    const { id, filename, _meta } = await this.config.adapter.save({
      stream,
      filename: originalFilename,
      mimetype,
      encoding,
      id: newId,
    });

    return { id, filename, mimetype, encoding, _meta };
  }
  createFieldPreHook(uploadData) {
    return this.saveStream(uploadData);
  }
  updateFieldPreHook(uploadData, path, item) {
    return this.saveStream(uploadData, item[path]);
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: ${this.getFileUploadType()}
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: ${this.getFileUploadType()}
    `;
  }
  getQueryConditions(args) {
    const conditions = [];
    const caseSensitive = args[`${this.path}_case_sensitive`];
    const rx_cs = caseSensitive ? '' : 'i';
    const eq = this.path;
    if (eq in args) {
      if (caseSensitive) {
        conditions.push({ $eq: args[eq] });
      } else {
        const eq_rx = new RegExp(`^${esc(args[eq])}$`, rx_cs);
        conditions.push({ $regex: eq_rx });
      }
    }
    const not = `${this.path}_not`;
    if (not in args) {
      if (caseSensitive) {
        conditions.push({ $ne: args[not] });
      } else {
        const not_rx = new RegExp(`^${esc(args[not])}$`, rx_cs);
        conditions.push({ $not: not_rx });
      }
    }
    const contains = `${this.path}_contains`;
    if (contains in args) {
      const contains_rx = new RegExp(esc(args[contains]), rx_cs);
      conditions.push({ $regex: contains_rx });
    }
    const not_contains = `${this.path}_not_contains`;
    if (not_contains in args) {
      const not_contains_rx = new RegExp(esc(args[not_contains]), rx_cs);
      conditions.push({ $not: not_contains_rx });
    }
    const starts_with = `${this.path}_starts_with`;
    if (starts_with in args) {
      const starts_with_rx = new RegExp(`^${esc(args[starts_with])}`, rx_cs);
      conditions.push({ $regex: starts_with_rx });
    }
    const not_starts_with = `${this.path}_not_starts_with`;
    if (not_starts_with in args) {
      const not_starts_with_rx = new RegExp(
        `^${esc(args[not_starts_with])}`,
        rx_cs
      );
      conditions.push({ $not: not_starts_with_rx });
    }
    const ends_with = `${this.path}_ends_with`;
    if (ends_with in args) {
      const ends_with_rx = new RegExp(`${esc(args[ends_with])}$`, rx_cs);
      conditions.push({ $regex: ends_with_rx });
    }
    const not_ends_with = `${this.path}_not_ends_with`;
    if (not_ends_with in args) {
      const not_ends_with_rx = new RegExp(
        `${esc(args[not_ends_with])}$`,
        rx_cs
      );
      conditions.push({ $not: not_ends_with_rx });
    }
    const is_in = `${this.path}_in`;
    if (is_in in args) {
      conditions.push({ $in: args[is_in] });
    }
    const not_in = `${this.path}_not_in`;
    if (not_in in args) {
      conditions.push({ $not: { $in: args[not_in] } });
    }
    return conditions;
  }
};
