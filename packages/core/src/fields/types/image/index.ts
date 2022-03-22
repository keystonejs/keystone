import { FileUpload } from 'graphql-upload';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageData,
  ImageExtension,
  KeystoneContext,
  AssetMode,
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

type ImageSource = ImageData & { mode: AssetMode };

const imageOutputFields = graphql.fields<ImageSource>()({
  id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context) {
      if (!context.images) {
        throw new Error('Image context is undefined');
      }
      return context.images.getUrl(data.storage, data.id, data.extension);
    },
  }),
});

const modeToTypeName = {
  local: 'LocalImageFieldOutput',
  s3: 'S3ImageFieldOutput',
};

const ImageFieldOutput = graphql.interface<ImageSource>()({
  name: 'ImageFieldOutput',
  fields: imageOutputFields,
  resolveType: val => modeToTypeName[val.mode],
});

const LocalImageFieldOutput = graphql.object<ImageSource>()({
  name: modeToTypeName.local,
  interfaces: [ImageFieldOutput],
  fields: imageOutputFields,
});

const S3ImageFieldOutput = graphql.object<ImageSource>()({
  name: modeToTypeName.s3,
  interfaces: [ImageFieldOutput],
  fields: imageOutputFields,
});

type ImageFieldInputType = undefined | null | { upload: Promise<FileUpload> };

async function inputResolver(storage: string, data: ImageFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { extension: data, filesize: data, height: data, id: data, storage: data, width: data };
  }

  return context.images!.getDataFromStream(storage, (await data.upload).createReadStream());
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
    const mode = meta.assets.getMode(config.storage);

    if (mode === undefined) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} has storage set to ${config.storage} but there is no storage config under that key`
      );
    }

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type image");
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        storage: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      hooks: config.removeFileOnDelete
        ? {
            ...config.hooks,
            async afterOperation(afterOpreationConfig) {
              const { originalItem, item, fieldKey, context } = afterOpreationConfig;
              await config.hooks?.afterOperation?.(afterOpreationConfig);
              const idKey = `${fieldKey}_id`;
              const id = originalItem?.[idKey];
              // This will occur on an update where an image already existed but has been
              // changed, or on a delete, where there is no longer an item
              if (id && id !== item?.[idKey]) {
                const extensionKey = `${fieldKey}_extension`;
                const extension = originalItem[extensionKey];

                await context.images?.deleteAtSource(
                  config.storage,
                  id as string,
                  extension as ImageExtension
                );
              }
            },
          }
        : config.hooks,
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
        resolve({ value: { extension, filesize, height, id, storage, width } }) {
          if (
            extension === null ||
            !isValidImageExtension(extension) ||
            filesize === null ||
            height === null ||
            width === null ||
            id === null ||
            storage === null
          ) {
            return null;
          }
          return { mode, extension, filesize, height, width, id, storage };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalImageFieldOutput, S3ImageFieldOutput],
      views: resolveView('image/views'),
    });
  };
