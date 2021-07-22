import path from 'path';
import {
  CommonFieldConfig,
  BaseGeneratedListTypes,
  FieldTypeFunc,
  jsonFieldTypePolyfilledForSQLite,
  schema,
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

const CloudinaryImageFormat = schema.inputObject({
  name: 'CloudinaryImageFormat',
  description:
    'Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).\n' +
    'All options are strings as they ultimately end up in a URL.',
  fields: {
    prettyName: schema.arg({
      description: ' Rewrites the filename to be this pretty string. Do not include `/` or `.`',
      type: schema.String,
    }),
    width: schema.arg({ type: schema.String }),
    height: schema.arg({ type: schema.String }),
    crop: schema.arg({ type: schema.String }),
    aspect_ratio: schema.arg({ type: schema.String }),
    gravity: schema.arg({ type: schema.String }),
    zoom: schema.arg({ type: schema.String }),
    x: schema.arg({ type: schema.String }),
    y: schema.arg({ type: schema.String }),
    format: schema.arg({ type: schema.String }),
    fetch_format: schema.arg({ type: schema.String }),
    quality: schema.arg({ type: schema.String }),
    radius: schema.arg({ type: schema.String }),
    angle: schema.arg({ type: schema.String }),
    effect: schema.arg({ type: schema.String }),
    opacity: schema.arg({ type: schema.String }),
    border: schema.arg({ type: schema.String }),
    background: schema.arg({ type: schema.String }),
    overlay: schema.arg({ type: schema.String }),
    underlay: schema.arg({ type: schema.String }),
    default_image: schema.arg({ type: schema.String }),
    delay: schema.arg({ type: schema.String }),
    color: schema.arg({ type: schema.String }),
    color_space: schema.arg({ type: schema.String }),
    dpr: schema.arg({ type: schema.String }),
    page: schema.arg({ type: schema.String }),
    density: schema.arg({ type: schema.String }),
    flags: schema.arg({ type: schema.String }),
    transformation: schema.arg({ type: schema.String }),
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
    transformation: schema.InferValueFromArg<schema.Arg<typeof CloudinaryImageFormat>>;
  }) => string | null;
};

const outputType = schema.object<CloudinaryImage_File>()({
  name: 'CloudinaryImage_File',
  fields: {
    id: schema.field({ type: schema.ID }),
    // path: types.field({ type: types.String }),
    filename: schema.field({ type: schema.String }),
    originalFilename: schema.field({ type: schema.String }),
    mimetype: schema.field({ type: schema.String }),
    encoding: schema.field({ type: schema.String }),
    publicUrl: schema.field({ type: schema.String }),
    publicUrlTransformed: schema.field({
      args: {
        transformation: schema.arg({ type: CloudinaryImageFormat }),
      },
      type: schema.String,
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
      ...config,
      input: {
        create: { arg: schema.arg({ type: schema.Upload }), resolve: resolveInput },
        update: { arg: schema.arg({ type: schema.Upload }), resolve: resolveInput },
      },
      output: schema.field({
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
              transformation: schema.InferValueFromArg<schema.Arg<typeof CloudinaryImageFormat>>;
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
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
      },
    });
  };
