import cuid from 'cuid';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';
import mongoose from 'mongoose';

// Disabling the getter of mongoose >= 5.1.0
// https://mongoosejs.com/docs/migrating_to_5.html#id-getter
mongoose.set('objectIdGetter', false);

export class File extends Implementation {
  constructor(path, { adapter }) {
    super(...arguments);
    this.graphQLOutputType = 'File';
    this.fileAdapter = adapter;

    if (!this.fileAdapter) {
      throw new Error(`No file adapter provided for File field.`);
    }
  }
  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }
  gqlQueryInputFields() {
    return [...this.equalityInputFields('String'), ...this.inInputFields('String')];
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
        originalFilename: String
        mimetype: String
        encoding: String
        publicUrl: String
      }
    `,
    ];
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }

        return {
          publicUrl: this.fileAdapter.publicUrl(itemValues),
          ...itemValues,
        };
      },
    };
  }

  async resolveInput({ resolvedData, existingItem }) {
    const previousData = existingItem && existingItem[this.path];
    const uploadData = resolvedData[this.path];

    // NOTE: The following two conditions could easily be combined into a
    // single `if (!uploadData) return uploadData`, but that would lose the
    // nuance of returning `undefined` vs `null`.
    // Premature Optimisers; be ware!
    if (typeof uploadData === 'undefined') {
      // Nothing was passed in, so we can bail early.
      return undefined;
    }

    if (uploadData === null) {
      // `null` was specifically uploaded, and we should set the field value to
      // null. To do that we... return `null`
      return null;
    }

    const { createReadStream, filename: originalFilename, mimetype, encoding } = await uploadData;
    const stream = createReadStream();

    if (!stream && previousData) {
      // TODO: FIXME: Handle when stream is null. Can happen when:
      // Updating some other part of the item, but not the file (gets null
      // because no File DOM element is uploaded)
      return previousData;
    }

    const { id, filename, _meta } = await this.fileAdapter.save({
      stream,
      filename: originalFilename,
      mimetype,
      encoding,
      id:
        this.adapter.listAdapter.parentAdapter.name === 'mongoose'
          ? new mongoose.Types.ObjectId()
          : cuid(),
    });

    return { id, filename, originalFilename, mimetype, encoding, _meta };
  }

  gqlUpdateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }
  getBackingTypes() {
    const type = `null | {
      id: string;
      path: string;
      filename: string;
      originalFilename: string;
      mimetype: string;
      encoding: string;
      _meta: Record<string, any>
     }
    `;
    return { [this.path]: { optional: true, type } };
  }
}

const CommonFileInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoFileInterface extends CommonFileInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = {
      type: {
        id: mongoose.Types.ObjectId,
        path: String,
        filename: String,
        originalFilename: String,
        mimetype: String,
        encoding: String,
        _meta: Object,
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexFileInterface extends CommonFileInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The File field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}

export class PrismaFileInterface extends CommonFileInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The File field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    return [this._schemaField({ type: 'Json' })];
  }
}
