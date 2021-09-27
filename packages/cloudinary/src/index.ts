import path from 'path';
import {
  CommonFieldConfig,
  BaseGeneratedListTypes,
  FieldTypeFunc,
  jsonFieldTypePolyfilledForSQLite,
  graphql,
} from '@keystone-next/keystone/types';
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
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      folder?: string;
    };
  };

const CloudinaryImageFormat = graphql.inputObject({
  name: 'CloudinaryImageFormat',
  description:
    'Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).\n' +
    'All options are strings as they ultimately end up in a URL.',
  fields: {
    prettyName: graphql.arg({
      description: ' Rewrites the filename to be this pretty string. Do not include `/` or `.`',
      type: graphql.String,
    }),
    width: graphql.arg({ type: graphql.String }),
    height: graphql.arg({ type: graphql.String }),
    crop: graphql.arg({ type: graphql.String }),
    aspect_ratio: graphql.arg({ type: graphql.String }),
    gravity: graphql.arg({ type: graphql.String }),
    zoom: graphql.arg({ type: graphql.String }),
    x: graphql.arg({ type: graphql.String }),
    y: graphql.arg({ type: graphql.String }),
    format: graphql.arg({ type: graphql.String }),
    fetch_format: graphql.arg({ type: graphql.String }),
    quality: graphql.arg({ type: graphql.String }),
    radius: graphql.arg({ type: graphql.String }),
    angle: graphql.arg({ type: graphql.String }),
    effect: graphql.arg({ type: graphql.String }),
    opacity: graphql.arg({ type: graphql.String }),
    border: graphql.arg({ type: graphql.String }),
    background: graphql.arg({ type: graphql.String }),
    overlay: graphql.arg({ type: graphql.String }),
    underlay: graphql.arg({ type: graphql.String }),
    default_image: graphql.arg({ type: graphql.String }),
    delay: graphql.arg({ type: graphql.String }),
    color: graphql.arg({ type: graphql.String }),
    color_space: graphql.arg({ type: graphql.String }),
    dpr: graphql.arg({ type: graphql.String }),
    page: graphql.arg({ type: graphql.String }),
    density: graphql.arg({ type: graphql.String }),
    flags: graphql.arg({ type: graphql.String }),
    transformation: graphql.arg({ type: graphql.String }),
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
    transformation: graphql.InferValueFromArg<graphql.Arg<typeof CloudinaryImageFormat>>;
  }) => string | null;
};

const outputType = graphql.object<CloudinaryImage_File>()({
  name: 'CloudinaryImage_File',
  fields: {
    id: graphql.field({ type: graphql.ID }),
    // path: types.field({ type: types.String }),
    filename: graphql.field({ type: graphql.String }),
    originalFilename: graphql.field({ type: graphql.String }),
    mimetype: graphql.field({ type: graphql.String }),
    encoding: graphql.field({ type: graphql.String }),
    publicUrl: graphql.field({ type: graphql.String }),
    publicUrlTransformed: graphql.field({
      args: {
        transformation: graphql.arg({ type: CloudinaryImageFormat }),
      },
      type: graphql.String,
      resolve(rootVal, args) {
        return rootVal.publicUrlTransformed(args);
      },
    }),
  },
});

export const cloudinaryImage =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    cloudinary,
    ...config
  }: CloudinaryImageFieldConfig<TGeneratedListTypes>): FieldTypeFunc =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type cloudinaryImage");
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
        create: { arg: graphql.arg({ type: graphql.Upload }), resolve: resolveInput },
        update: { arg: graphql.arg({ type: graphql.Upload }), resolve: resolveInput },
      },
      output: graphql.field({
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
              transformation: graphql.InferValueFromArg<graphql.Arg<typeof CloudinaryImageFormat>>;
            }) => adapter.publicUrlTransformed(val, transformation ?? {}),
            ...val,
          };
        },
      }),
      views: path.join(path.dirname(__dirname), 'views'),
    });
  };
