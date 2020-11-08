import { Implementation } from '@keystone-next/fields-legacy';
import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import mongoose from 'mongoose';

// Disabling the getter of mongoose >= 5.1.0
// https://mongoosejs.com/docs/migrating_to_5.html#id-getter
mongoose.set('objectIdGetter', false);

class CloudinaryImage extends Implementation {
  constructor(path, { adapter }) {
    super(...arguments);
    this.fileAdapter = adapter;

    if (!this.fileAdapter) {
      throw new Error(`No file adapter provided for File field.`);
    }

    // Ducktype the adapter
    if (typeof this.fileAdapter.publicUrlTransformed !== 'function') {
      throw new Error('CloudinaryImage field must be used with CloudinaryAdapter');
    }
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: CloudinaryImage_File`];
  }
  gqlQueryInputFields() {
    return [...this.equalityInputFields('String'), ...this.inInputFields('String')];
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

    const newId = new mongoose.Types.ObjectId();

    const { id, filename, _meta } = await this.fileAdapter.save({
      stream,
      filename: originalFilename,
      mimetype,
      encoding,
      id: newId,
    });

    return { id, filename, originalFilename, mimetype, encoding, _meta };
  }

  gqlUpdateInputFields() {
    return [`${this.path}: Upload`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Upload`];
  }

  getGqlAuxTypes() {
    return [
      `
      type CloudinaryImage_File {
        id: ID
        path: String
        filename: String
        originalFilename: String
        mimetype: String
        encoding: String
        publicUrl: String
        publicUrlTransformed(transformation: CloudinaryImageFormat): String
      }
    `,
      `
      """
      Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).
      All options are strings as they ultimately end up in a URL.
      """
      input CloudinaryImageFormat {
        """ Rewrites the filename to be this pretty string. Do not include \`/\` or \`.\` """
        prettyName: String
        width: String
        height: String
        crop: String
        aspect_ratio: String
        gravity: String
        zoom: String
        x: String
        y: String
        format: String
        fetch_format: String
        quality: String
        radius: String
        angle: String
        effect: String
        opacity: String
        border: String
        background: String
        overlay: String
        underlay: String
        default_image: String
        delay: String
        color: String
        color_space: String
        dpr: String
        page: String
        density: String
        flags: String
        transformation: String
      }`,
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
          publicUrlTransformed: ({ transformation }) =>
            this.fileAdapter.publicUrlTransformed(itemValues, transformation),
          ...itemValues,
        };
      },
    };
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'any' } };
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

class MongoCloudinaryImageInterface extends CommonFileInterface(MongooseFieldAdapter) {
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

class KnexCloudinaryImageInterface extends CommonFileInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The CloudinaryImage field type doesn't support indexes on Knex. ` +
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

class PrismaCloudinaryImageInterface extends CommonFileInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw (
        `The CloudinaryImage field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    return [this._schemaField({ type: 'Json' })];
  }
}

export {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
  PrismaCloudinaryImageInterface,
};
