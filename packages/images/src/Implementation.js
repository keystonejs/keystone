import { Implementation } from '@keystonejs/fields';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';

/*
  TODO: support image transformation in the GraphQL Service.

  Would use a syntax like this to allow various transformation options the
  Image Service supports, e.g
  {
    things {
      image(resize: { fit: contain, width: 200, height: 200 }, format: jpeg) {
        src
        width
        height
      }
    }
  }

  If resize options are provided, the width and height of the image would be
  scaled based on the original size and the fit method specified
*/

export class Image extends Implementation {
  constructor(path, { service }) {
    super(...arguments);
    this.graphQLOutputType = 'Image';
    this.service = service;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }
  extendAdminMeta(meta) {
    return meta;
  }
  gqlQueryInputFields() {
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
      /* See TODO at top of file
      `enum ImageFill {
        cover
        contain
        fill
        inside
        outside
      }`,
      `enum ImageFormat {
        jpeg
        png
        gif
        webp
        svg
      }`,
      `input ImageResizeOptions {
        width: String
        height: String
        fill: ImageFill
      }`,
      */
      `
      type ${this.graphQLOutputType} {
        src: String
        width: Int
        height: Int
      }
    `,
    ];
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item /*, args */) => {
        const itemValues = item[this.path];
        if (!itemValues) {
          return null;
        }

        let meta = this.service.database.getImage(itemValues.id);

        return {
          // See TODO at top of file for why we'd pass args here
          src: this.service.getSrc(itemValues.id, { format: meta.format /*, ...args */ }),
          height: meta.height,
          width: meta.width,
        };
      },
    };
  }

  async resolveInput({ resolvedData, existingItem }) {
    const previousData = existingItem && existingItem[this.path];
    const uploadData = resolvedData[this.path];

    // const query = gql`
    //   {
    //     things {
    //       image {
    //         src(resize: { fit: contain, width: 200, height: 200 })
    //         width
    //         height
    //       }
    //     }
    //   }
    // `;

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

    const { id, meta } = await this.service.uploadImage({
      stream,
      originalfilename: originalFilename,
    });

    return { id, meta };
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

export class MongoImageInterface extends CommonFileInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = {
      type: Object,
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexImageInterface extends CommonFileInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isUnique || this.config.isIndexed) {
      throw `The File field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`;
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}
