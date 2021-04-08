import cuid from 'cuid';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields';

class CloudinaryImage extends Implementation {
  constructor(path, { adapter }) {
    super(...arguments);
    this.graphQLOutputType = 'CloudinaryImage_File';
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

      `extend type ${this.graphQLOutputType} {
        publicUrlTransformed(transformation: CloudinaryImageFormat): String
      }`,
    ];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        let itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }
        if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
          // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
          // https://github.com/prisma/prisma/issues/3786
          try {
            itemValues = JSON.parse(itemValues);
          } catch (err) {}
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
      id: cuid(),
    });

    const ret = { id, filename, originalFilename, mimetype, encoding, _meta };
    if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
      // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
      // https://github.com/prisma/prisma/issues/3786
      return JSON.stringify(ret);
    }
    return ret;
  }

  gqlUpdateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }

  gqlCreateInputFields() {
    return [`${this.path}: ${this.getFileUploadType()}`];
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'any' } };
  }
}

class PrismaCloudinaryImageInterface extends PrismaFieldAdapter {
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
    // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
    // https://github.com/prisma/prisma/issues/3786
    return [
      this._schemaField({
        type: this.listAdapter.parentAdapter.provider === 'sqlite' ? 'String' : 'Json',
      }),
    ];
  }
  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}

export { CloudinaryImage, PrismaCloudinaryImageInterface };
