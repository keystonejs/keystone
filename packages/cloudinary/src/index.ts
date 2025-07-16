import { g } from '@keystone-6/core'
import type { GArg, InferValueFromArg } from '@keystone-6/core/graphql-ts'
import type {
  BaseFieldTypeInfo,
  BaseListTypeInfo,
  CommonFieldConfig,
  FieldTypeFunc,
} from '@keystone-6/core/types'
import { fieldType } from '@keystone-6/core/types'

import type Cloudinary from 'cloudinary'
import { v2 as cloudinary } from 'cloudinary'
import { randomBytes } from 'node:crypto'

type StoredFile = {
  id: string
  filename: string
  originalFilename: string
  mimetype: any
  encoding: any
  _meta: Cloudinary.UploadApiResponse
}

type CloudinaryImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo
> & {
  cloudinary: {
    cloudName: string
    apiKey: string
    apiSecret: string
    folder?: string
  }
  db?: { map?: string }
}

const CloudinaryImageFormat = g.inputObject({
  name: 'CloudinaryImageFormat',
  description:
    'Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).\n' +
    'All options are strings as they ultimately end up in a URL.',
  fields: {
    prettyName: g.arg({
      description: ' Rewrites the filename to be this pretty string. Do not include `/` or `.`',
      type: g.String,
    }),
    width: g.arg({ type: g.String }),
    height: g.arg({ type: g.String }),
    crop: g.arg({ type: g.String }),
    aspect_ratio: g.arg({ type: g.String }),
    gravity: g.arg({ type: g.String }),
    zoom: g.arg({ type: g.String }),
    x: g.arg({ type: g.String }),
    y: g.arg({ type: g.String }),
    format: g.arg({ type: g.String }),
    fetch_format: g.arg({ type: g.String }),
    quality: g.arg({ type: g.String }),
    radius: g.arg({ type: g.String }),
    angle: g.arg({ type: g.String }),
    effect: g.arg({ type: g.String }),
    opacity: g.arg({ type: g.String }),
    border: g.arg({ type: g.String }),
    background: g.arg({ type: g.String }),
    overlay: g.arg({ type: g.String }),
    underlay: g.arg({ type: g.String }),
    default_image: g.arg({ type: g.String }),
    delay: g.arg({ type: g.String }),
    color: g.arg({ type: g.String }),
    color_space: g.arg({ type: g.String }),
    dpr: g.arg({ type: g.String }),
    page: g.arg({ type: g.String }),
    density: g.arg({ type: g.String }),
    flags: g.arg({ type: g.String }),
    transformation: g.arg({ type: g.String }),
  },
})

type CloudinaryImage_File = {
  id: string
  filename: string
  originalFilename: string
  mimetype: string
  encoding: string
  publicUrl: string
  publicUrlTransformed: (args: {
    transformation: InferValueFromArg<GArg<typeof CloudinaryImageFormat>>
  }) => string
  filesize: number
  width: number
  height: number
}

// WARNING: should mimic keystone-6/core native images
const outputType = g.object<CloudinaryImage_File>()({
  name: 'CloudinaryImage_File',
  fields: {
    id: g.field({ type: g.nonNull(g.ID) }),
    // path: types.field({ type: types.String }),
    filename: g.field({ type: g.String }),
    originalFilename: g.field({ type: g.String }),
    mimetype: g.field({ type: g.String }),
    encoding: g.field({ type: g.String }),
    publicUrl: g.field({ type: g.String }),
    publicUrlTransformed: g.field({
      args: {
        transformation: g.arg({ type: CloudinaryImageFormat }),
      },
      type: g.String,
      resolve(data, args) {
        return data.publicUrlTransformed(args)
      },
    }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    width: g.field({ type: g.nonNull(g.Int) }),
    height: g.field({ type: g.nonNull(g.Int) }),
  },
})

// TODO: no delete support
export function cloudinaryImage<ListTypeInfo extends BaseListTypeInfo>({
  cloudinary: cloudinaryConfig,
  ...config
}: CloudinaryImageFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type cloudinaryImage")
    }

    const inputArg = g.arg({ type: g.Upload })
    async function resolveInput(
      uploadData: InferValueFromArg<typeof inputArg>
    ): Promise<StoredFile | undefined | null> {
      if (uploadData === null) return null
      if (uploadData === undefined) return

      const { createReadStream, filename: originalFilename, mimetype, encoding } = await uploadData
      const stream = createReadStream()

      // TODO: FIXME: stream can be null
      if (!stream) return

      const id = randomBytes(20).toString('base64url')
      const _meta = await new Promise<Cloudinary.UploadApiResponse>((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
          {
            public_id: id,
            folder: cloudinaryConfig.folder,
            api_key: cloudinaryConfig.apiKey,
            api_secret: cloudinaryConfig.apiSecret,
            cloud_name: cloudinaryConfig.cloudName,
          },
          (error, result) => {
            if (error || !result) return reject(error)
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

    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Json',
      map: config.db?.map,
    })({
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/cloudinary',
      input: {
        create: { arg: inputArg, resolve: resolveInput },
        update: { arg: inputArg, resolve: resolveInput },
      },
      output: g.field({
        type: outputType,
        resolve({ value }) {
          if (value === null) return null
          const val = value as any
          return {
            width: val?._meta.width,
            height: val?._meta.width,
            filesize: val?._meta.bytes,
            publicUrl: val?._meta?.secure_url ?? null,
            publicUrlTransformed: ({
              transformation,
            }: {
              transformation: InferValueFromArg<GArg<typeof CloudinaryImageFormat>>
            }) => {
              if (!val._meta) return null

              const { prettyName, ...rest } = transformation ?? {}

              // no formatting options provided, return the publicUrl field
              if (!Object.keys(rest).length) return val?._meta?.secure_url ?? null

              const { public_id, format } = val._meta

              // ref https://github.com/cloudinary/cloudinary_npm/blob/439586eac73cee7f2803cf19f885e98f237183b3/src/utils.coffee#L472
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
    })
  }
}
