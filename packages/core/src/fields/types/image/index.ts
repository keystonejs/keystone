import { FileUpload } from 'graphql-upload';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageData,
  ImageExtension,
  KeystoneContext,
} from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';
import { SUPPORTED_IMAGE_EXTENSIONS } from './utils';

export type ImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {
  storage: string;
} & CommonFieldConfig<ListTypeInfo>;

const ImageExtensionEnum = graphql.enum({
  name: 'ImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const ImageFieldInput = graphql.inputObject({
  name: 'ImageFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.nonNull(graphql.Upload) }),
  },
});

const ImageFieldOutput = graphql.object<ImageData & { storage: string }>()({
  name: 'ImageFieldOutput',
  fields: {
    id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data, args, context) {
        return context.images(data.storage).getUrl(data.id, data.extension);
      },
    }),
  },
});

type ImageFieldInputType = undefined | null | { upload: Promise<FileUpload> };

async function inputResolver(storage: string, data: ImageFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { extension: data, filesize: data, height: data, id: data, width: data };
  }
  const upload = await data.upload;
  return context.images(storage).getDataFromStream(upload.createReadStream(), upload.filename);
}

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension);
}

export const image =
  <ListTypeInfo extends BaseListTypeInfo>(
    config: ImageFieldConfig<ListTypeInfo>
  ): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    const storage = meta.getStorage(config.storage);

    if (!storage) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`
      );
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type image");
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
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
                const idKey = `${meta.fieldKey}_id`;
                const id = args.item[idKey];
                const extensionKey = `${meta.fieldKey}_extension`;
                const extension = args.item[extensionKey];

                // This will occur on an update where an image already existed but has been
                // changed, or on a delete, where there is no longer an item
                if (
                  (args.operation === 'delete' ||
                    typeof args.resolvedData[meta.fieldKey].id === 'string' ||
                    args.resolvedData[meta.fieldKey].id === null) &&
                  typeof id === 'string' &&
                  typeof extension === 'string' &&
                  isValidImageExtension(extension)
                ) {
                  await args.context.images(config.storage).deleteAtSource(id, extension);
                }
              }
            },
          },
      input: {
        create: {
          arg: graphql.arg({ type: ImageFieldInput }),
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
        update: {
          arg: graphql.arg({ type: ImageFieldInput }),
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
      },
      output: graphql.field({
        type: ImageFieldOutput,
        resolve({ value: { extension, filesize, height, id, width } }) {
          if (
            extension === null ||
            !isValidImageExtension(extension) ||
            filesize === null ||
            height === null ||
            width === null ||
            id === null
          ) {
            return null;
          }
          return {
            extension,
            filesize,
            height,
            width,
            id,
            storage: config.storage,
          };
        },
      }),
      views: resolveView('image/views'),
    });
  };
