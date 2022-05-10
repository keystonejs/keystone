import { FileUpload } from 'graphql-upload';
import {
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseListTypeInfo,
  KeystoneContext,
  FileMetadata,
} from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';

export type FileFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {
  storage: string;
} & CommonFieldConfig<ListTypeInfo>;

const FileFieldInput = graphql.inputObject({
  name: 'FileFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.nonNull(graphql.Upload) }),
  },
});

type FileFieldInputType = undefined | null | { upload: Promise<FileUpload> };

const FileFieldOutput = graphql.object<FileMetadata & { storage: string }>()({
  name: 'FileFieldOutput',
  fields: {
    filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data, args, context) {
        return context.files(data.storage).getUrl(data.filename);
      },
    }),
  },
});

async function inputResolver(storage: string, data: FileFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { filename: data, filesize: data };
  }
  const upload = await data.upload;
  return context.files(storage).getDataFromStream(upload.createReadStream(), upload.filename);
}

export const file =
  <ListTypeInfo extends BaseListTypeInfo>(
    config: FileFieldConfig<ListTypeInfo>
  ): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    const storage = meta.assets.getStorage(config.storage);

    if (!storage) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} has storage set to ${config.storage} but there is no storage config under that key`
      );
    }

    if ('isIndexed' in config) {
      throw Error('isIndexed is not a supported option for the file field type');
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      hooks: storage.preserve
        ? config.hooks
        : {
            ...config.hooks,
            async afterOperation(afterOperationArgs) {
              const { originalItem, item, context } = afterOperationArgs;

              await config.hooks?.afterOperation?.(afterOperationArgs);
              const nameKey = `${meta.fieldKey}_filename`;
              const filename = originalItem?.[nameKey];

              // This will occur on an update where an image already existed but has been
              // changed, or on a delete, where there is no longer an item
              if (typeof filename === 'string' && filename !== item?.[nameKey]) {
                await context.files(config.storage).deleteAtSource(filename);
              }
            },
          },
      input: {
        create: {
          arg: graphql.arg({ type: FileFieldInput }),
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
        update: {
          arg: graphql.arg({ type: FileFieldInput }),
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
      },
      output: graphql.field({
        type: FileFieldOutput,
        resolve({ value: { filesize, filename } }) {
          if (filesize === null || filename === null) {
            return null;
          }
          return { filename, filesize, storage: config.storage };
        },
      }),
      views: resolveView('file/views'),
    });
  };
