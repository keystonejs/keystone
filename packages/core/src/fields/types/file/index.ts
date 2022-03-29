import { FileUpload } from 'graphql-upload';
import { userInputError } from '../../../lib/core/graphql-errors';
import {
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseListTypeInfo,
  KeystoneContext,
  FileData,
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

const FileFieldOutput = graphql.object<FileData>()({
  name: 'FileFieldOutput',
  fields: {
    filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data, args, context) {
        if (!context.files) {
          throw new Error(
            'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://keystonejs.com/docs/apis/config#files for details'
          );
        }
        return context.files.getUrl(data.storage, data.filename);
      },
    }),
  },
});

async function inputResolver(storage: string, data: FileFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { storage: data, filename: data, filesize: data };
  }

  if (!data.upload) {
    throw userInputError('Upload must be passed to FileFieldInput');
  }
  const upload = await data.upload;
  return context.files!.getDataFromStream(storage, upload.createReadStream(), upload.filename);
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

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type file");
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        storage: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      hooks: storage.removeFileOnDelete
        ? {
            ...config.hooks,
            async afterOperation(afterOpreationConfig) {
              const { originalItem, item, context } = afterOpreationConfig;

              await config.hooks?.afterOperation?.(afterOpreationConfig);
              const nameKey = `${meta.fieldKey}_filename`;
              const filename = originalItem?.[nameKey];

              // This will occur on an update where an image already existed but has been
              // changed, or on a delete, where there is no longer an item
              if (filename && filename !== item?.[nameKey]) {
                await context.files?.deleteAtSource(config.storage, filename as string);
              }
            },
          }
        : config.hooks,
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
