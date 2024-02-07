import { randomBytes } from 'node:crypto'
import type { CommonFieldConfig, BaseListTypeInfo, FieldTypeFunc } from '@keystone-6/core/types'
import { jsonFieldTypePolyfilledForSQLite } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import cloudinary from 'cloudinary'

type StoredFile = {
  id: string
  filename: string
  originalFilename: string
  mimetype: any
  encoding: any
  _meta: cloudinary.UploadApiResponse
}

type CloudinaryImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    cloudinary: {
      cloudName: string
      apiKey: string
      apiSecret: string
      folder?: string
    }
    db?: { map?: string }
  }

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
})

type CloudinaryImage_File = {
  id: string | null
  filename: string | null
  originalFilename: string | null
  mimetype: string | null
  encoding: string | null
  publicUrl: string | null
  publicUrlTransformed: (args: {
    transformation: graphql.InferValueFromArg<graphql.Arg<typeof CloudinaryImageFormat>>
  }) => string | null
}

// TODO: lvalue type required by pnpm :(
export const outputType: graphql.ObjectType<CloudinaryImage_File> =
  graphql.object<CloudinaryImage_File>()({
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
        resolve (rootVal, args) {
          return rootVal.publicUrlTransformed(args)
        },
      }),
    },
  })

// TODO: no delete support
export function cloudinaryImage<ListTypeInfo extends BaseListTypeInfo> ({
  cloudinary: cloudinaryConfig,
  ...config
}: CloudinaryImageFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type cloudinaryImage")
    }

    const inputArg = graphql.arg({ type: graphql.Upload })
    async function resolveInput (
      uploadData: graphql.InferValueFromArg<typeof inputArg>
    ): Promise<StoredFile | undefined | null | 'DbNull'> {
      if (uploadData === null) {
        return meta.provider === 'postgresql' || meta.provider === 'mysql' ? 'DbNull' : null
      }
      if (uploadData === undefined) {
        return undefined
      }

      const { createReadStream, filename: originalFilename, mimetype, encoding } = await uploadData
      const stream = createReadStream()

      // TODO: FIXME: stream can be null
      if (!stream) {
        return undefined
      }

      const id = randomBytes(20).toString('base64url')
      const _meta = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
        const cloudinaryStream = cloudinary.v2.uploader.upload_stream(
          {
            public_id: id,
            folder: cloudinaryConfig.folder,
            api_key: cloudinaryConfig.apiKey,
            api_secret: cloudinaryConfig.apiSecret,
            cloud_name: cloudinaryConfig.cloudName,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error)
            }
            resolve(result)
          }
        )

        stream.pipe(cloudinaryStream)
      })

      return {
        id,
        filename: originalFilename,
        originalFilename,
        mimetype,
        encoding,
        _meta,
      }
    }

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        __ksTelemetryFieldTypeName: '@keystone-6/cloudinary',
        input: {
          create: { arg: inputArg, resolve: resolveInput },
          update: { arg: inputArg, resolve: resolveInput },
        },
        output: graphql.field({
          type: outputType,
          resolve ({ value }) {
            if (value === null) {
              return null
            }
            const val = value as any
            return {
              publicUrl: val?._meta?.secure_url ?? null,
              publicUrlTransformed: ({
                transformation,
              }: {
                transformation: graphql.InferValueFromArg<
                  graphql.Arg<typeof CloudinaryImageFormat>
                >
              }) => {
                if (!val._meta) return null

                const { prettyName, ...rest } = transformation ?? {}

                // no formatting options provided, return the publicUrl field
                if (!Object.keys(rest).length) {
                  return val?._meta?.secure_url ?? null
                }

                const { public_id, format } = val._meta

                // ref https://github.com/cloudinary/cloudinary_npm/blob/439586eac73cee7f2803cf19f885e98f237183b3/src/utils.coffee#L472
                // @ts-expect-error
                return cloudinary.url(public_id, {
                  type: 'upload',
                  format,
                  secure: true, // the default as of version 2
                  url_suffix: prettyName,
                  transformation,
                  cloud_name: cloudinaryConfig.cloudName,

                  // SDK analytics defaults to true in version 2 (ref https://github.com/cloudinary/cloudinary_npm/commit/d2510eb677e553a45bc7e363b35d2c20b4c4b144#diff-9aa82f0ed674e050695a7422b1cd56d43ce47e6953688a16a003bf49c3481622)
                  //   we default to false for the least surprise, keeping this upgrade as a patch
                  urlAnalytics: false,
                })
              },
              ...val,
            }
          },
        }),
        views: '@keystone-6/cloudinary/views',
      },
      {
        map: config.db?.map,
      }
    )
  }
}
