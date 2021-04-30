import { FileUpload } from 'graphql-upload';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { getFileRef } from '@keystone-next/utils-legacy';
import { FileData, KeystoneContext, BaseKeystoneList } from '@keystone-next/types';
import { Implementation } from '../../Implementation';

const MISSING_CONFIG_ERROR =
  'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://next.keystonejs.com/apis/config#files for details';

export class FileImplementation<P extends string> extends Implementation<P> {
  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: FileFieldOutput`];
  }

  getGqlAuxTypes() {
    return [
      `
      input FileFieldInput {
        upload: Upload
        ref: String
      }
      interface FileFieldOutput {
        filename: String!
        filesize: Int!
        ref: String!
        src: String!
      }
      type LocalFileFieldOutput implements FileFieldOutput {
        filename: String!
        filesize: Int!
        ref: String!
        src: String!
      }`,
    ];
  }

  gqlAuxFieldResolvers() {
    return {
      FileFieldOutput: {
        __resolveType() {
          return 'LocalFileFieldOutput';
        },
      },
      LocalFileFieldOutput: {
        src(data: FileData, _args: any, context: KeystoneContext) {
          if (!context.files) {
            throw new Error(MISSING_CONFIG_ERROR);
          }
          return context.files.getSrc(data.mode, data.filename);
        },
        ref(data: FileData, _args: any, context: KeystoneContext) {
          if (!context.files) {
            throw new Error(MISSING_CONFIG_ERROR);
          }
          return getFileRef(data.mode, data.filename);
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

    type FileInput = {
      upload?: Promise<FileUpload> | null;
      ref?: string | null;
    };
    const { ref, upload }: FileInput = data;
    if (ref) {
      if (upload) {
        throw new Error('Only one of ref and upload can be passed to FileFieldInput');
      }
      return context.files!.getDataFromRef(ref);
    }
    if (!upload) {
      throw new Error('Either ref or upload must be passed to FileFieldInput');
    }

    const uploadedFile = await upload;
    return context.files!.getDataFromStream(uploadedFile.createReadStream(), uploadedFile.filename);
  }

  gqlUpdateInputFields() {
    return [`${this.path}: FileFieldInput`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: FileFieldInput`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Record<string, any> | null' } };
  }
}

export class PrismaFileInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: FileImplementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw new Error(
        `The File field type doesn't support indexes on Prisma. ` +
          `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [
      `${this.path}_filesize    Int?`,
      `${this.path}_mode   String?`,
      `${this.path}_filename   String?`,
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
    const mode_field = `${this.path}_mode`;
    const name_field = `${this.path}_filename`;

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
            [name_field]: null,
            [mode_field]: null,
            ...item,
          };
          delete newItem[field_path];
          return newItem;
        } else {
          const { mode, filesize, filename } = item[field_path];

          const newItem = {
            [filesize_field]: filesize,
            [name_field]: filename,
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
        if (!item[filesize_field] || !item[name_field] || !item[mode_field]) {
          item[field_path] = null;
          return item;
        }
        item[field_path] = {
          filesize: item[filesize_field],
          filename: item[name_field],
          mode: item[mode_field],
        };

        delete item[filesize_field];
        delete item[name_field];
        delete item[mode_field];

        return item;
      }
    );
  }
}
