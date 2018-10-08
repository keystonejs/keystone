const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { escapeRegExp } = require('@voussoir/utils');
const mongoose = require('mongoose');

// Disabling the getter of mongoose >= 5.1.0
// https://github.com/Automattic/mongoose/blob/master/migrating_to_5.md#checking-if-a-path-is-populated
mongoose.set('objectIdGetter', false);

const {
  Types: { ObjectId },
} = mongoose;

class File extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLOutputType = 'File';
  }

  get gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      directory: this.config.directory,
      route: this.config.route,
    };
  }
  get gqlQueryInputFields() {
    return [
      `${this.path}: String`,
      `${this.path}_not: String`,
      `${this.path}_contains: String`,
      `${this.path}_not_contains: String`,
      `${this.path}_starts_with: String`,
      `${this.path}_not_starts_with: String`,
      `${this.path}_ends_with: String`,
      `${this.path}_not_ends_with: String`,
      `${this.path}_in: [String!]`,
      `${this.path}_not_in: [String!]`,
    ];
  }
  getFileUploadType() {
    return 'Upload';
  }
  get gqlAuxTypes() {
    return [
      `
      type ${this.graphQLOutputType} {
        id: ID
        path: String
        filename: String
        mimetype: String
        encoding: String
        publicUrl: String
      }
    `,
    ];
  }
  // Called on `User.avatar` for example
  get gqlOutputFieldResolvers() {
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
  async saveStream(uploadData, previousData) {
    // TODO: FIXME: Handle when uploadData is null. Can happen when:
    // Deleting the file
    if (!uploadData) {
      return null;
    }

    const { stream, filename: originalFilename, mimetype, encoding } = await uploadData;

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
  updateFieldPreHook(uploadData, item) {
    return this.saveStream(uploadData, item[this.path]);
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
}

class MongoFileInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    schema.add({
      [this.path]: {
        unique,
        type: {
          id: ObjectId,
          path: String,
          filename: String,
          mimetype: String,
          _meta: Object,
        },
        ...mongooseOptions,
      },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({
        [this.path]: { $eq: value },
      }),
      [`${this.path}_not`]: value => ({
        [this.path]: { $ne: value },
      }),

      [`${this.path}_contains`]: value => ({
        [this.path]: { $regex: new RegExp(escapeRegExp(value)) },
      }),
      [`${this.path}_not_contains`]: value => ({
        [this.path]: { $not: new RegExp(escapeRegExp(value)) },
      }),

      [`${this.path}_starts_with`]: value => ({
        [this.path]: { $regex: new RegExp(`^${escapeRegExp(value)}`) },
      }),
      [`${this.path}_not_starts_with`]: value => ({
        [this.path]: { $not: new RegExp(`^${escapeRegExp(value)}`) },
      }),
      [`${this.path}_ends_with`]: value => ({
        [this.path]: { $regex: new RegExp(`${escapeRegExp(value)}$`) },
      }),
      [`${this.path}_not_ends_with`]: value => ({
        [this.path]: { $not: new RegExp(`${escapeRegExp(value)}$`) },
      }),

      [`${this.path}_in`]: value => ({
        [this.path]: { $in: value },
      }),
      [`${this.path}_not_in`]: value => ({
        [this.path]: { $not: { $in: value } },
      }),
    };
  }
}

module.exports = {
  File,
  MongoFileInterface,
};
