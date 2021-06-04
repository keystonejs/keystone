import path from 'path';
import {
  CommonFieldConfig,
  BaseGeneratedListTypes,
  FieldTypeFunc,
  jsonFieldTypePolyfilledForSQLite,
  types,
  FieldDefaultValue,
  legacyFilters,
} from '@keystone-next/types';
import { FileUpload } from 'graphql-upload';
import cuid from 'cuid';
import cloudinary from 'cloudinary';
import { CloudinaryAdapter } from './cloudinary';

type StoredFile = {
  id: string;
  filename: string;
  originalFilename: string;
  mimetype: any;
  encoding: any;
  _meta: cloudinary.UploadApiResponse;
};

type CloudinaryImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<any, TGeneratedListTypes>;
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      folder?: string;
    };
  };

const CloudinaryImageFormat = types.inputObject({
  name: 'CloudinaryImageFormat',
  description:
    'Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).\n' +
    'All options are strings as they ultimately end up in a URL.',
  fields: {
    prettyName: types.arg({
      description: ' Rewrites the filename to be this pretty string. Do not include `/` or `.`',
      type: types.String,
    }),
    width: types.arg({ type: types.String }),
    height: types.arg({ type: types.String }),
    crop: types.arg({ type: types.String }),
    aspect_ratio: types.arg({ type: types.String }),
    gravity: types.arg({ type: types.String }),
    zoom: types.arg({ type: types.String }),
    x: types.arg({ type: types.String }),
    y: types.arg({ type: types.String }),
    format: types.arg({ type: types.String }),
    fetch_format: types.arg({ type: types.String }),
    quality: types.arg({ type: types.String }),
    radius: types.arg({ type: types.String }),
    angle: types.arg({ type: types.String }),
    effect: types.arg({ type: types.String }),
    opacity: types.arg({ type: types.String }),
    border: types.arg({ type: types.String }),
    background: types.arg({ type: types.String }),
    overlay: types.arg({ type: types.String }),
    underlay: types.arg({ type: types.String }),
    default_image: types.arg({ type: types.String }),
    delay: types.arg({ type: types.String }),
    color: types.arg({ type: types.String }),
    color_space: types.arg({ type: types.String }),
    dpr: types.arg({ type: types.String }),
    page: types.arg({ type: types.String }),
    density: types.arg({ type: types.String }),
    flags: types.arg({ type: types.String }),
    transformation: types.arg({ type: types.String }),
  },
});

type CloudinaryImage_File = {
  id: string | null;
  filename: string | null;
  originalFilename: string | null;
  mimetype: string | null;
  encoding: string | null;
  publicUrl: string | null;
  publicUrlTransformed: (args: {
    transformation: types.InferValueFromArg<types.Arg<typeof CloudinaryImageFormat>>;
  }) => string | null;
};

const outputType = types.object<CloudinaryImage_File>()({
  name: 'CloudinaryImage_File',
  fields: {
    id: types.field({ type: types.ID }),
    // path: types.field({ type: types.String }),
    filename: types.field({ type: types.String }),
    originalFilename: types.field({ type: types.String }),
    mimetype: types.field({ type: types.String }),
    encoding: types.field({ type: types.String }),
    publicUrl: types.field({ type: types.String }),
    publicUrlTransformed: types.field({
      args: {
        transformation: types.arg({ type: CloudinaryImageFormat }),
      },
      type: types.String,
      resolve(rootVal, args) {
        return rootVal.publicUrlTransformed(args);
      },
    }),
  },
});

export const cloudinaryImage =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    cloudinary,
    isRequired,
    defaultValue,
    ...config
  }: CloudinaryImageFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type cloudinaryImage');
    }
    const adapter = new CloudinaryAdapter(cloudinary);
    const resolveInput = async (
      uploadData: Promise<FileUpload> | undefined | null
    ): Promise<StoredFile | undefined | null> => {
      if (uploadData == null) {
        return uploadData;
      }

      const { createReadStream, filename: originalFilename, mimetype, encoding } = await uploadData;
      const stream = createReadStream();

      if (!stream) {
        // TODO: FIXME: Handle when stream is null. Can happen when:
        // Updating some other part of the item, but not the file (gets null
        // because no File DOM element is uploaded)
        return undefined;
      }

      const { id, filename, _meta } = await adapter.save({
        stream,
        filename: originalFilename,
        id: cuid(),
      });

      return { id, filename, originalFilename, mimetype, encoding, _meta };
    };
    return jsonFieldTypePolyfilledForSQLite(meta.provider, {
      input: {
        create: { arg: types.arg({ type: types.Upload }), resolve: resolveInput },
        update: { arg: types.arg({ type: types.Upload }), resolve: resolveInput },
      },
      output: types.field({
        type: outputType,
        resolve({ value }) {
          if (value === null) {
            return null;
          }
          const val = value as any;
          return {
            publicUrl: adapter.publicUrl(val),
            publicUrlTransformed: ({
              transformation,
            }: {
              transformation: types.InferValueFromArg<types.Arg<typeof CloudinaryImageFormat>>;
            }) => adapter.publicUrlTransformed(val, transformation ?? {}),
            ...val,
          };
        },
      }),
      views: path.join(
        path.dirname(require.resolve('@keystone-next/cloudinary/package.json')),
        'views'
      ),
      __legacy: {
        isRequired,
        defaultValue,
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.String),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
      },
    });
  };
