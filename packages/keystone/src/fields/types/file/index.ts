import { FileUpload } from 'graphql-upload';
import { userInputError } from '../../../lib/core/graphql-errors';
import {
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  BaseGeneratedListTypes,
  KeystoneContext,
  FileData,
} from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';
import { getFileRef } from './utils';

export type FileFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes>;

const FileFieldInput = graphql.inputObject({
  name: 'FileFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.Upload }),
    ref: graphql.arg({ type: graphql.String }),
  },
});

type FileFieldInputType =
  | undefined
  | null
  | { upload?: Promise<FileUpload> | null; ref?: string | null };

const fileFields = graphql.fields<FileData>()({
  filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
  filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data) {
      return getFileRef(data.mode, data.filename);
    },
  }),
  url: graphql.field({
    type: graphql.nonNull(graphql.String),
    resolve(data, args, context) {
      if (!context.files) {
        throw new Error(
          'File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://keystonejs.com/docs/apis/config#files for details'
        );
      }
      return context.files.getUrl(data.mode, data.filename);
    },
  }),
});

const FileFieldOutput = graphql.interface<FileData>()({
  name: 'FileFieldOutput',
  fields: fileFields,
  resolveType: val => (val.mode === 'local' ? 'LocalFileFieldOutput' : 'CloudFileFieldOutput'),
});

const LocalFileFieldOutput = graphql.object<FileData>()({
  name: 'LocalFileFieldOutput',
  interfaces: [FileFieldOutput],
  fields: fileFields,
});

const CloudFileFieldOutput = graphql.object<FileData>()({
  name: 'CloudFileFieldOutput',
  interfaces: [FileFieldOutput],
  fields: fileFields,
});

async function inputResolver(data: FileFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { mode: data, filename: data, filesize: data };
  }

  if (data.ref) {
    if (data.upload) {
      throw userInputError('Only one of ref and upload can be passed to FileFieldInput');
    }
    return context.files!.getDataFromRef(data.ref);
  }
  if (!data.upload) {
    throw userInputError('Either ref or upload must be passed to FileFieldInput');
  }
  const upload = await data.upload;
  return context.files!.getDataFromStream(upload.createReadStream(), upload.filename);
}

export const file =
  <TGeneratedListTypes extends BaseGeneratedListTypes>(
    config: FileFieldConfig<TGeneratedListTypes> = {}
  ): FieldTypeFunc =>
  () => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type file");
    }

    return fieldType({
      kind: 'multi',
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        mode: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: FileFieldInput }), resolve: inputResolver },
        update: { arg: graphql.arg({ type: FileFieldInput }), resolve: inputResolver },
      },
      output: graphql.field({
        type: FileFieldOutput,
        resolve({ value: { filesize, filename, mode } }) {
          if (
            filesize === null ||
            filename === null ||
            mode === null ||
            (mode !== 'local' && mode !== 'cloud')
          ) {
            return null;
          }
          return { mode, filename, filesize };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [LocalFileFieldOutput, CloudFileFieldOutput],
      views: resolveView('file/views'),
    });
  };
