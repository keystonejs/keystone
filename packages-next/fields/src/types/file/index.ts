import {
  fieldType,
  types,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseGeneratedListTypes,
  KeystoneContext,
  FileData,
} from '@keystone-next/types';
import { getFileRef } from '@keystone-next/utils-legacy';
import { FileUpload } from 'graphql-upload';
import { resolveView } from '../../resolve-view';

export type FileFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes>;

const FileFieldInput = types.inputObject({
  name: 'FileFieldInput',
  fields: { upload: types.arg({ type: types.Upload }), ref: types.arg({ type: types.String }) },
});

type ImageFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

// TODO: use an interface after making it work in @ts-gql/schema
const LocalFileFieldOutput = types.object<FileData>()({
  name: 'LocalFileFieldOutput',
  fields: {
    filename: types.field({ type: types.nonNull(types.String) }),
    filesize: types.field({ type: types.nonNull(types.Int) }),
    ref: types.field({
      type: types.nonNull(types.String),
      resolve(data) {
        return getFileRef(data.mode, data.filename);
      },
    }),
    src: types.field({
      type: types.nonNull(types.String),
      resolve(data, args, context) {
        if (!context.files) {
          throw new Error(
            'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://next.keystonejs.com/apis/config#files for details'
          );
        }
        return context.files.getSrc(data.mode, data.filename);
      },
    }),
  },
});

async function inputResolver(data: ImageFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { mode: data, filename: data, filesize: data };
  }

  if (data.ref) {
    if (data.upload) {
      throw new Error('Only one of ref and upload can be passed to FileFieldInput');
    }
    return context.files!.getDataFromRef(data.ref);
  }
  if (!data.upload) {
    throw new Error('Either ref or upload must be passed to FileFieldInput');
  }
  const upload = await data.upload;
  return context.files!.getDataFromStream(upload.createReadStream(), upload.filename);
}

export const file = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: FileFieldConfig<TGeneratedListTypes> = {}
): FieldTypeFunc => () => {
  if (config.index === 'unique') {
    throw Error("{ index: 'unique' } is not a supported option for field type file");
  }

  return fieldType({
    kind: 'multi',
    fields: {
      mode: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
    },
  })({
    ...config,
    input: {
      create: { arg: types.arg({ type: FileFieldInput }), resolve: inputResolver },
      update: { arg: types.arg({ type: FileFieldInput }), resolve: inputResolver },
    },
    // TODO: THIS MUST BE CHANGED BACK TO THE INTERFACE BEFORE MERGING
    output: types.field({
      type: LocalFileFieldOutput,
      resolve({ value: { filesize, filename, mode } }) {
        if (filesize === null || filename === null || mode !== 'local') {
          return null;
        }
        return { mode: 'local', filename, filesize };
      },
    }),
    views: resolveView('file/views'),
  });
};
