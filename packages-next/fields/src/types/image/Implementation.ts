import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '../../Implementation';
import { ImageData, KeystoneContext } from '@keystone-next/types';
import { handleImageData } from './handle-image-input';

export class ImageImplementation<P extends string> extends Implementation<P> {
  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ImageFieldOutput`];
  }

  getGqlAuxTypes() {
    return [
      `enum ImageMode {
        local
      }
      input ImageFieldInput {
        upload: Upload
        ref: String
      }
      enum ImageExtension {
        jpeg
        png
        webp
        gif
      }
      type ImageFieldOutput {
        mode: ImageMode!
        id: ID!
        filesize: Int!
        width: Int!
        height: Int!
        extension: ImageExtension!
        ref: String!
        src: String!
      }`,
    ];
  }

  gqlAuxFieldResolvers() {
    return {
      ImageFieldOutput: {
        src(data: ImageData, _args: any, context: KeystoneContext) {
          return context.images.getSrc(data.mode, data.id, data.extension);
        },
        ref(data: ImageData, _args: any, context: KeystoneContext) {
          return context.images.getRef(data.mode, data.id, data.extension);
        },
      },
    };
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        let imageData = item[this.path];
        if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
          // we store image data as a string on sqlite because Prisma doesn't support Json on sqlite
          // https://github.com/prisma/prisma/issues/3786
          try {
            imageData = JSON.parse(imageData);
          } catch (err) {}
        }
        return imageData;
      },
    };
  }

  async resolveInput({ resolvedData, context }) {
    const data = resolvedData[this.path];
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return undefined;
    }
    const imageData = await handleImageData(data, context);
    if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
      // we store image data as a string on sqlite because Prisma doesn't support Json on sqlite
      // https://github.com/prisma/prisma/issues/3786
      return JSON.stringify(imageData);
    }
    return imageData;
  }

  gqlUpdateInputFields() {
    return [`${this.path}: ImageFieldInput`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ImageFieldInput`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Record<string, any> | null' } };
  }
}

export class PrismaImageInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor() {
    super(...arguments);
    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw new Error(
        `The Image field type doesn't support indexes on Prisma. ` +
          `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [
      this._schemaField({
        type:
          this.listAdapter.parentAdapter.provider === 'sqlite'
            ? // we store image data as a string on sqlite because Prisma doesn't support Json on sqlite
              // https://github.com/prisma/prisma/issues/3786
              'String'
            : 'Json',
      }),
    ];
  }

  getQueryConditions() {
    return {};
  }
}
