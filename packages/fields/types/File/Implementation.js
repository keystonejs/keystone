const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystone-alpha/adapter-mongoose');
const { KnexFieldAdapter } = require('@keystone-alpha/adapter-knex');
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
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.inInputFields('String'),
    ];
  }
  getFileUploadType() {
    return 'Upload';
  }
  getGqlAuxTypes() {
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

        // FIXME: This can hopefully be removed once graphql 14.1.0 is released.
        // https://github.com/graphql/graphql-js/pull/1520
        if (itemValues.id) itemValues.id = itemValues.id.toString();

        return {
          publicUrl: this.config.adapter.publicUrl(itemValues),
          ...itemValues,
        };
      },
    };
  }

  async resolveInput({ resolvedData, existingItem }) {
    const previousData = existingItem && existingItem[this.path];
    const uploadData = resolvedData[this.path];
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

  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
}

const CommonFileInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.stringConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

class MongoFileInterface extends CommonFileInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = {
      type: {
        id: ObjectId,
        path: String,
        filename: String,
        mimetype: String,
        _meta: Object,
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

class KnexFileInterface extends CommonFileInterface(KnexFieldAdapter) {
  createColumn(table) {
    return table.json(this.path);
  }
}

module.exports = {
  File,
  MongoFileInterface,
  KnexFileInterface,
};
