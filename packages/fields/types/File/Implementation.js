const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');
const { escapeRegExp: esc } = require('@keystonejs/utils');
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

  getGraphqlOutputFields() {
    return [{ name: this.path, type: this.graphQLOutputType }];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      directory: this.config.directory,
      route: this.config.route,
    };
  }
  getGraphqlQueryArgs() {
    return [];
  }
  getFileUploadType() {
    return 'Upload';
  }
  getGraphqlAuxiliaryTypes() {
    return [
      {
        prefix: 'type',
        name: this.graphQLOutputType,
        args: [
          { name: 'id', type: 'ID' },
          { name: 'path', type: 'String' },
          { name: 'filename', type: 'String' },
          { name: 'mimetype', type: 'String' },
          { name: 'encoding', type: 'String' },
          { name: 'publicUrl', type: 'String' },
        ],
      },
    ];
  }
  // Called on `User.avatar` for example
  getGraphqlOutputFieldResolvers() {
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
  getGraphqlAuxiliaryMutations() {
    return [
      {
        name: 'uploadFile',
        args: [{ name: `file`, type: `${this.getFileUploadType()}!` }],
        type: this.graphQLOutputType,
      },
    ];
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
  updateFieldPreHook(uploadData, path, item) {
    return this.saveStream(uploadData, item[path]);
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: this.getFileUploadType() }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: this.getFileUploadType() }];
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
