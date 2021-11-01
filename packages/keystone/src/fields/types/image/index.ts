import { FileUpload } from 'graphql-upload';
import { userInputError } from '../../../lib/core/graphql-errors';
import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageData,
  ImageExtension,
  KeystoneContext,
} from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from './utils';

export type ImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes>;

const ImageExtensionEnum = graphql.enum({
  name: 'ImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const ImageFieldInput = graphql.inputObject({
  name: 'ImageFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

const imageOutputFields = graphql.fields<ImageData>()({
  id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data) {
      return getImageRef(data.mode, data.id, data.extension);
    },
  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context) {
      if (!context.images) {
        throw new Error('Image context is undefined');
      }
      return context.images.getUrl(data.mode, data.id, data.extension);
    },
  }),
});

const ImageFieldOutput = graphql.interface<ImageData>()({
  name: 'ImageFieldOutput',
  fields: imageOutputFields,
  resolveType: val => (val.mode === 'local' ? 'LocalImageFieldOutput' : 'CloudImageFieldOutput'),
});

const LocalImageFieldOutput = graphql.object<ImageData>()({
  name: 'LocalImageFieldOutput',
  interfaces: [ImageFieldOutput],
  fields: imageOutputFields,
});

const CloudImageFieldOutput = graphql.object<ImageData>()({
  name: 'CloudImageFieldOutput',
  interfaces: [ImageFieldOutput],
  fields: imageOutputFields,
});

type ImageFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

async function inputResolver(data: ImageFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { extension: data, filesize: data, height: data, id: data, mode: data, width: data };
  }

  if (data.ref) {
    if (data.upload) {
      throw userInputError('Only one of ref and upload can be passed to ImageFieldInput');
    }
    return context.images!.getDataFromRef(data.ref);
  }
  if (!data.upload) {
    throw userInputError('Either ref or upload must be passed to ImageFieldInput');
  }
  return context.images!.getDataFromStream((await data.upload).createReadStream());
}

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension);
}

export const image =
  <TGeneratedListTypes extends BaseGeneratedListTypes>(
    config: ImageFieldConfig<TGeneratedListTypes> = {}
  ): FieldTypeFunc =>
  () => {
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
        mode: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: ImageFieldInput }), resolve: inputResolver },
        update: { arg: graphql.arg({ type: ImageFieldInput }), resolve: inputResolver },
      },
      output: graphql.field({
        type: ImageFieldOutput,
        resolve({ value: { extension, filesize, height, id, mode, width } }) {
          if (
            extension === null ||
            !isValidImageExtension(extension) ||
            filesize === null ||
            height === null ||
            width === null ||
            id === null ||
            mode === null ||
            (mode !== 'local' && mode !== 'cloud')
          ) {
            return null;
          }
          return { mode, extension, filesize, height, width, id };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalImageFieldOutput, CloudImageFieldOutput],
      views: resolveView('image/views'),
    });
  };
