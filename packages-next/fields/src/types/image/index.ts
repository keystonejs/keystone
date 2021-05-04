import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  ImageData,
  ImageExtension,
  KeystoneContext,
  types,
} from '@keystone-next/types';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from '@keystone-next/utils-legacy';
import { FileUpload } from 'graphql-upload';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type ImageFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes>;

const ImageExtensionEnum = types.enum({
  name: 'ImageExtension',
  values: types.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const ImageFieldInput = types.inputObject({
  name: 'ImageFieldInput',
  fields: { upload: types.arg({ type: types.Upload }), ref: types.arg({ type: types.String }) },
});

// TODO: use an interface after making it work in @ts-gql/schema
const LocalImageFieldOutput = types.object<ImageData>()({
  name: 'LocalImageFieldOutput',
  fields: {
    id: types.field({ type: types.nonNull(types.ID) }),
    filesize: types.field({ type: types.nonNull(types.Int) }),
    height: types.field({ type: types.nonNull(types.Int) }),
    width: types.field({ type: types.nonNull(types.Int) }),
    extension: types.field({ type: types.nonNull(ImageExtensionEnum) }),
    ref: types.field({
      type: types.nonNull(types.String),
      resolve(data) {
        return getImageRef(data.mode, data.id, data.extension);
      },
    }),
    src: types.field({
      type: types.nonNull(types.String),
      resolve(data, args, context) {
        if (!context.images) {
          throw new Error('Image context is undefined');
        }
        return context.images.getSrc(data.mode, data.id, data.extension);
      },
    }),
  },
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
    if (data.ref) {
      throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
    }
    return context.images!.getDataFromRef(data.ref);
  }
  if (!data.upload) {
    throw new Error('Either ref or upload must be passed to ImageFieldInput');
  }
  return context.images!.getDataFromStream((await data.upload).createReadStream());
}

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension);
}

export const image = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  ...config
}: ImageFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc => () => {
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
      create: { arg: types.arg({ type: ImageFieldInput }), resolve: inputResolver },
      update: { arg: types.arg({ type: ImageFieldInput }), resolve: inputResolver },
    },
    // TODO: THIS MUST BE CHANGED BACK TO THE INTERFACE BEFORE MERGING
    output: types.field({
      type: LocalImageFieldOutput,
      resolve({ value: { extension, filesize, height, id, mode, width } }) {
        if (
          extension === null ||
          !isValidImageExtension(extension) ||
          filesize === null ||
          height === null ||
          width === null ||
          id === null ||
          mode !== 'local'
        ) {
          return null;
        }
        return { mode: 'local', extension, filesize, height, width, id };
      },
    }),
    views: resolveView('image/views'),
  });
};
