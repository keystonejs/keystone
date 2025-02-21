import type {
  BaseListTypeInfo,
  FieldTypeFunc,
  CommonFieldConfig,
  ImageData,
  ImageExtension,
  KeystoneContext,
} from '../../../types'
import { fieldType } from '../../../types'
import { g } from '../../..'
import { SUPPORTED_IMAGE_EXTENSIONS } from './utils'
import { merge } from '../../resolve-hooks'

export type ImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    storage: string
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

const ImageFieldOutput = g.object<ImageData & { storage: string }>()({
  name: 'ImageFieldOutput',
  fields: {
    id: g.field({ type: g.nonNull(g.ID) }),
    url: g.field({
      type: g.nonNull(g.String),
      resolve(data, args, context) {
        return context.images(data.storage).getUrl(data.id, data.extension)
      },
    }),
    extension: g.field({ type: g.nonNull(ImageExtensionEnum) }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    width: g.field({ type: g.nonNull(g.Int) }),
    height: g.field({ type: g.nonNull(g.Int) }),
  },
})

async function inputResolver(
  storage: string,
  data: g.InferValueFromArg<typeof inputArg>,
  context: KeystoneContext
) {
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
  return context.images(storage).getDataFromStream(upload.createReadStream(), upload.filename)
}

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS)

function isValidImageExtension(extension: string): extension is ImageExtension {
  return extensionsSet.has(extension)
}

export function image<ListTypeInfo extends BaseListTypeInfo>(
  config: ImageFieldConfig<ListTypeInfo>
): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const { fieldKey } = meta
    const storage = meta.getStorage(config.storage)

    if (!storage) {
      throw new Error(
        `${meta.listKey}.${fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`
      )
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type image")
    }

    async function beforeOperationResolver(args: any) {
      // TODO: types
      if (args.operation === 'update' || args.operation === 'delete') {
        const idKey = `${fieldKey}_id`
        const id = args.item[idKey]
        const extensionKey = `${fieldKey}_extension`
        const extension = args.item[extensionKey]

        // this will occur on an update where an image already existed but has been
        // changed, or on a delete, where there is no longer an item
        if (
          (args.operation === 'delete' ||
            typeof args.resolvedData[fieldKey].id === 'string' ||
            args.resolvedData[fieldKey].id === null) &&
          typeof id === 'string' &&
          typeof extension === 'string' &&
          isValidImageExtension(extension)
        ) {
          await args.context.images(config.storage).deleteAtSource(id, extension)
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
      hooks: storage.preserve
        ? config.hooks
        : {
            ...config.hooks,
            beforeOperation: merge(config.hooks?.beforeOperation, {
              update: beforeOperationResolver,
              delete: beforeOperationResolver,
            }),
          },
      input: {
        create: {
          arg: inputArg,
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
        update: {
          arg: inputArg,
          resolve: (data, context) => inputResolver(config.storage, data, context),
        },
      },
      output: g.field({
        type: ImageFieldOutput,
        resolve({ value: { id, extension, filesize, width, height } }) {
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
            storage: config.storage,
          }
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/image',
      views: '@keystone-6/core/fields/types/image/views',
    })
  }
}
