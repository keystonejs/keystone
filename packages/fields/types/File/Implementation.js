const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { escapeRegExp: esc } = require('@voussoir/utils');
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
    return [];
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

  getQueryConditions() {
    const caseSensitive = `${this.path}_case_sensitive`;

    return {
      [this.path]: (value, query) => {
        if (query[caseSensitive]) {
          return { [this.path]: { $eq: value } };
        }
        const eq_rx = new RegExp(`^${esc(value)}$`, '');
        return { [this.path]: { $regex: eq_rx } };
      },

      [`${this.path}_not`]: (value, query) => {
        if (query[caseSensitive]) {
          return { $ne: value };
        }
        return { [this.path]: { $not: new RegExp(`^${esc(value)}$`, '') } };
      },

      [`${this.path}_contains`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(esc(value), query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_contains`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(esc(value), query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_starts_with`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(`^${esc(value)}`, query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_starts_with`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(`^${esc(value)}`, query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_ends_with`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(`${esc(value)}$`, query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_ends_with`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(`${esc(value)}$`, query[caseSensitive] ? '' : 'i'),
        },
      }),
      [`${this.path}_in`]: value => ({ [this.path]: { $in: value } }),
      [`${this.path}_not_in`]: value => ({ [this.path]: { $not: { $in: value } } }),
    };
  }
}

module.exports = {
  File,
  MongoFileInterface,
};
