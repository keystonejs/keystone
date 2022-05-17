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
    const storage = meta.getStorage(config.storage);

    if (!storage) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`
      );
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type file");
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
            async beforeOperation(args) {
              await config.hooks?.beforeOperation?.(args);
              if (args.operation === 'update' || args.operation === 'delete') {
                const filenameKey = `${meta.fieldKey}_filename`;
                const filename = args.item[filenameKey];

                // This will occur on an update where a file already existed but has been
                // changed, or on a delete, where there is no longer an item
                if (
                  (args.operation === 'delete' ||
                    typeof args.resolvedData[meta.fieldKey].filename === 'string' ||
                    args.resolvedData[meta.fieldKey].filename === null) &&
                  typeof filename === 'string'
                ) {
                  await args.context.files(config.storage).deleteAtSource(filename);
                }
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
