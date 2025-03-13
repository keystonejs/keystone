import type {
  BaseListTypeInfo,
  FieldTypeFunc,
  CommonFieldConfig,
  KeystoneContext,
  BaseKeystoneTypeInfo,
  MaybePromise,
  FieldHooks,
  StorageStrategy,
} from '../../../types'
import { fieldType } from '../../../types'
import { g } from '../../..'
import { SUPPORTED_IMAGE_EXTENSIONS } from './utils'
import { merge } from '../../resolve-hooks'
import type { InferValueFromArg } from '@graphql-ts/schema'
import { randomBytes } from 'node:crypto'
import type { ImageExtension } from './internal-utils'
import { getBytesFromStream, getImageMetadata, teeStream } from './internal-utils'

export type ImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    storage: StorageStrategy<BaseKeystoneTypeInfo>
    transformName?: (originalFilename: string, extension: string) => MaybePromise<string>
    db?: {
      extendPrismaSchema?: (field: string) => string
    }
  }

// TODO: dynamic
const ImageExtensionEnum = g.enum({
  name: 'ImageExtension',
  values: g.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
})

const ImageFieldInput = g.inputObject({
  name: 'ImageFieldInput',
  fields: {
    upload: g.arg({ type: g.nonNull(g.Upload) }),
  },
})

const inputArg = g.arg({ type: ImageFieldInput })

type ImageData = {
  id: string
  extension: ImageExtension
  filesize: number
  width: number
  height: number
  url: (_args: {}, context: KeystoneContext) => Promise<string>
}

const ImageFieldOutput = g.object<ImageData>()({
  name: 'ImageFieldOutput',
  fields: {
    id: g.field({ type: g.nonNull(g.ID) }),
    url: g.field({ type: g.nonNull(g.String) }),
    extension: g.field({ type: g.nonNull(ImageExtensionEnum) }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    width: g.field({ type: g.nonNull(g.Int) }),
    height: g.field({ type: g.nonNull(g.Int) }),
  },
})

// this is a conservative estimate of the number of bytes
// that we need to determine the image metadata
// since 1Kib in memory will be fine
const bytesToDetermineImageMetadata = 1024

async function inputResolver(
  storage: StorageStrategy<BaseKeystoneTypeInfo>,
  transformName: (originalFilename: string, extension: string) => MaybePromise<string>,
  context: KeystoneContext,
  data: InferValueFromArg<typeof inputArg>
): Promise<{
  id: string | null | undefined
  extension: ImageExtension | null | undefined
  filesize: number | null | undefined
  width: number | null | undefined
  height: number | null | undefined
}> {
  if (data === null || data === undefined) {
    return {
      id: data,
      extension: data,
      filesize: data,
      width: data,
      height: data,
    }
  }

  const upload = await data.upload
  let filesize = 0
  const _readable = upload.createReadStream()
  const [readableForFilesize, _readable2] = teeStream(_readable)
  const [readableForMetadata, readableForUpload] = teeStream(_readable2)
  readableForFilesize.on('data', data => {
    filesize += data.length
  })

  const buffer = await getBytesFromStream(readableForMetadata, bytesToDetermineImageMetadata)
  const metadata = getImageMetadata(buffer)
  if (!metadata) {
    throw new Error('File type not found')
  }
  const id = await transformName(upload.filename, metadata.extension)
  await storage.put(
    `${id}.${metadata.extension}`,
    readableForUpload,
    {
      contentType: {
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        jpg: 'image/jpeg',
      }[metadata.extension],
    },
    context
  )
  return {
    filesize,
    id,
    extension: metadata.extension,
    height: metadata.height,
    width: metadata.width,
  }
}

const extensionsSet = new Set<string>(SUPPORTED_IMAGE_EXTENSIONS)

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension)
}

export function image<ListTypeInfo extends BaseListTypeInfo>(
  config: ImageFieldConfig<ListTypeInfo>
): FieldTypeFunc<ListTypeInfo> {
  const { transformName = defaultTransformName } = config
  return meta => {
    const { fieldKey } = meta

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type image")
    }

    const afterOperationResolver: Extract<
      FieldHooks<BaseListTypeInfo, string>['afterOperation'],
      (args: any) => any
    > = async function afterOperationResolver(args) {
      if (args.operation === 'update' || args.operation === 'delete') {
        const idKey = `${fieldKey}_id`
        const oldId = args.originalItem?.[idKey] as string | null | undefined
        const newId = args.item?.[idKey] as string | null | undefined
        const extensionKey = `${fieldKey}_extension`
        const oldExtension = args.originalItem?.[extensionKey] as string | null | undefined
        const newExtension = args.item?.[extensionKey] as string | null | undefined
        // this will occur on an update where an image already existed but has been
        // changed, or on a delete, where there is no longer an item
        if (
          typeof oldId === 'string' &&
          typeof oldExtension === 'string' &&
          isValidImageExtension(oldExtension) &&
          (oldId !== newId || oldExtension !== newExtension)
        ) {
          await config.storage.delete(`${oldId}.${oldExtension}`, args.context)
        }
      }
    }

    return fieldType({
      kind: 'multi',
      extendPrismaSchema: config.db?.extendPrismaSchema,
      fields: {
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
      },
    })({
      ...config,
      hooks: {
        ...config.hooks,
        afterOperation: merge(config.hooks?.afterOperation, {
          update: afterOperationResolver,
          delete: afterOperationResolver,
        }),
      },
      input: {
        create: {
          arg: inputArg,
          resolve: (data, context) => inputResolver(config.storage, transformName, context, data),
        },
        update: {
          arg: inputArg,
          resolve: (data, context) => inputResolver(config.storage, transformName, context, data),
        },
      },
      output: g.field({
        type: ImageFieldOutput,
        resolve({ value: { id, extension, filesize, width, height } }): ImageData | null {
          if (id === null) return null
          if (extension === null) return null
          if (filesize === null) return null
          if (width === null) return null
          if (height === null) return null
          if (!isValidImageExtension(extension)) return null // TODO: dynamic

          return {
            id,
            filesize,
            width,
            height,
            extension,
            url: async (_, context) => config.storage.url(`${id}.${extension}`, context),
          }
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/image',
      views: '@keystone-6/core/fields/types/image/views',
    })
  }
}

function defaultTransformName(path: string) {
  return randomBytes(16).toString('base64url')
}
