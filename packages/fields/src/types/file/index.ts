import {
  fieldType,
  schema,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseGeneratedListTypes,
  KeystoneContext,
  FileData,
  FieldDefaultValue,
} from '@keystone-next/types';
import { getFileRef } from '@keystone-next/utils';
import { FileUpload } from 'graphql-upload';
import { resolveView } from '../../resolve-view';

export type FileFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<FileFieldInputType, TGeneratedListTypes>;
  };

const FileFieldInput = schema.inputObject({
  name: 'FileFieldInput',
  fields: { upload: schema.arg({ type: schema.Upload }), ref: schema.arg({ type: schema.String }) },
});

type FileFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

const fileFields = schema.fields<FileData>()({
  filename: schema.field({ type: schema.nonNull(schema.String) }),
  filesize: schema.field({ type: schema.nonNull(schema.Int) }),
  ref: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data) {
      return getFileRef(data.filename);
    },
  }),
  src: schema.field({
    type: schema.nonNull(schema.String),
    resolve(data, args, context) {
      if (!context.files) {
        throw new Error(
          'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://keystonejs.com/docs/apis/config#files for details'
        );
      }
      return context.files.getSrc(data.filename);
    },
  }),
});

const FileFieldOutput = schema.interface<FileData>()({
  name: 'FileFieldOutput',
  fields: fileFields,
  resolveType: () => 'LocalFileFieldOutput',
});

const LocalFileFieldOutput = schema.object<FileData>()({
  name: 'LocalFileFieldOutput',
  interfaces: [FileFieldOutput],
  fields: fileFields,
});

async function inputResolver(data: FileFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { filename: data, filesize: data };
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

export const file =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: FileFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  () => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type file');
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: { arg: schema.arg({ type: FileFieldInput }), resolve: inputResolver },
        update: { arg: schema.arg({ type: FileFieldInput }), resolve: inputResolver },
      },
      output: schema.field({
        type: FileFieldOutput,
        resolve({ value: { filesize, filename } }) {
          if (filesize === null || filename === null) {
            return null;
          }
          return { filename, filesize };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalFileFieldOutput],
      views: resolveView('file/views'),
      __legacy: {
        isRequired,
        defaultValue,
      },
    });
  };
