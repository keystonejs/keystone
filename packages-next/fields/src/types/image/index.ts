import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageData,
  ImageExtension,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { getImageRef, SUPPORTED_IMAGE_EXTENSIONS } from '@keystone-next/utils';
import { FileUpload } from 'graphql-upload';
import { resolveView } from '../../resolve-view';

export type ImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<ImageFieldInputType, TGeneratedListTypes>;
    isRequired?: boolean;
  };

const ImageExtensionEnum = schema.enum({
  name: 'ImageExtension',
  values: schema.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
});

const ImageFieldInput = schema.inputObject({
  name: 'ImageFieldInput',
  fields: { upload: schema.arg({ type: schema.Upload }), ref: schema.arg({ type: schema.String }) },
});

const imageOutputFields = schema.fields<ImageData>()({
  id: schema.field({ type: schema.nonNull(schema.ID) }),
  filesize: schema.field({ type: schema.nonNull(schema.Int) }),
  width: schema.field({ type: schema.nonNull(schema.Int) }),
  height: schema.field({ type: schema.nonNull(schema.Int) }),
  extension: schema.field({ type: schema.nonNull(ImageExtensionEnum) }),
  ref: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data) {
      return getImageRef(data.mode, data.id, data.extension);
    },
  }),
  src: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data, args, context) {
      if (!context.images) {
        throw new Error('Image context is undefined');
      }
      return context.images.getSrc(data.mode, data.id, data.extension);
    },
  }),
});

const ImageFieldOutput = schema.interface<ImageData>()({
  name: 'ImageFieldOutput',
  fields: imageOutputFields,
  resolveType: () => 'LocalImageFieldOutput',
});

const LocalImageFieldOutput = schema.object<ImageData>()({
  name: 'LocalImageFieldOutput',
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

export const image =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: ImageFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  () => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type image');
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
        create: { arg: schema.arg({ type: ImageFieldInput }), resolve: inputResolver },
        update: { arg: schema.arg({ type: ImageFieldInput }), resolve: inputResolver },
      },
      output: schema.field({
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
            (mode !== 'local' && mode !== 'keystone-cloud')
          ) {
            return null;
          }
          return { mode, extension, filesize, height, width, id };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalImageFieldOutput],
      views: resolveView('image/views'),
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
