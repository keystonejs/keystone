import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { ImageData, KeystoneContext, BaseKeystoneList } from '@keystone-next/types';
import { Implementation } from '../../Implementation';
import { handleImageData } from './handle-image-input';

const SUPPORTED_IMAGE_EXTENSIONS = ['jpeg', 'png', 'webp', 'gif'];
const SUPPORTED_MODES = ['local'];

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
        ${SUPPORTED_IMAGE_EXTENSIONS.join('\n')}
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
          if (!context.images) {
            throw new Error('Image context is undefined');
          }
          return context.images.getSrc(data.mode, data.id, data.extension);
        },
        ref(data: ImageData, _args: any, context: KeystoneContext) {
          if (!context.images) {
            throw new Error('Image context is undefined');
          }
          return context.images.getRef(data.mode, data.id, data.extension);
        },
      },
    };
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }

  async resolveInput({
    resolvedData,
    context,
  }: {
    resolvedData: Record<P, any>;
    context: KeystoneContext;
  }) {
    const data = resolvedData[this.path];
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return undefined;
    }
    const imageData = await handleImageData(data, context);
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
  constructor(
    fieldName: string,
    path: P,
    field: ImageImplementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
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
      `${this.path}_filesize    Int?`,
      `${this.path}_extension   String?`,
      `${this.path}_width   Int?`,
      `${this.path}_height   Int?`,
      `${this.path}_mode   String?`,
      `${this.path}_id   String?`,
    ];
  }

  getQueryConditions() {
    return {};
  }

  setupHooks({
    addPreSaveHook,
    addPostReadHook,
  }: {
    addPreSaveHook: (hook: any) => void;
    addPostReadHook: (hook: any) => void;
  }) {
    const field_path = this.path;
    const filesize_field = `${this.path}_filesize`;
    const extension_field = `${this.path}_extension`;
    const width_field = `${this.path}_width`;
    const height_field = `${this.path}_height`;
    const mode_field = `${this.path}_mode`;
    const id_field = `${this.path}_id`;

    addPreSaveHook(
      (item: Record<P, any>): Record<string, any> => {
        if (!Object.prototype.hasOwnProperty.call(item, field_path)) {
          return item;
        }
        if (item[field_path as P] === null) {
          // If the property exists on the field but is null or falsey
          // all split fields are null
          // delete the original field item
          // return the item
          const newItem = {
            [filesize_field]: null,
            [extension_field]: null,
            [width_field]: null,
            [height_field]: null,
            [id_field]: null,
            [mode_field]: null,
            ...item,
          };
          delete newItem[field_path];
          return newItem;
        } else {
          const { mode, filesize, extension, width, height, id } = item[field_path];

          const newItem = {
            [filesize_field]: parseInt(filesize, 10),
            [extension_field]: extension,
            [width_field]: width,
            [height_field]: height,
            [id_field]: id,
            [mode_field]: mode,
            ...item,
          };

          delete newItem[field_path];

          return newItem;
        }
      }
    );
    addPostReadHook(
      (item: Record<string, any>): Record<P, any> => {
        if (
          !item[filesize_field] ||
          !item[extension_field] ||
          !item[width_field] ||
          !item[height_field] ||
          !item[id_field] ||
          !item[mode_field]
        ) {
          item[field_path] = null;
          return item;
        }
        item[field_path] = {
          filesize: item[filesize_field],
          extension: item[extension_field],
          width: item[width_field],
          height: item[height_field],
          id: item[id_field],
          mode: item[mode_field],
        };

        delete item[filesize_field];
        delete item[extension_field];
        delete item[width_field];
        delete item[height_field];
        delete item[id_field];
        delete item[mode_field];

        return item;
      }
    );
  }
}
