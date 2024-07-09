import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  type ImageData,
  type ImageExtension,
  type KeystoneContext,
  fieldType,
} from '../../../types'
import { graphql } from '../../..'
import { SUPPORTED_IMAGE_EXTENSIONS } from './utils'
import { mergeFieldHooks, type InternalFieldHooks } from '../../resolve-hooks'

export type ImageFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    storage: string
    db?: {
      extendPrismaSchema?: (field: string) => string
    }
  }

const ImageExtensionEnum = graphql.enum({
  name: 'ImageExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
})

const ImageFieldInput = graphql.inputObject({
  name: 'ImageFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.nonNull(graphql.Upload) }),
  },
})

const inputArg = graphql.arg({ type: ImageFieldInput })

const ImageFieldOutput = graphql.object<ImageData & { storage: string }>()({
  name: 'ImageFieldOutput',
  fields: {
    id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve (data, args, context) {
        return context.images(data.storage).getUrl(data.id, data.extension)
      },
    }),
  },
})

async function inputResolver (
  storage: string,
  data: graphql.InferValueFromArg<typeof inputArg>,
  context: KeystoneContext
) {
  if (data === null || data === undefined) {
    return {
      id: data,
      filesize: data,
      width: data,
      height: data,
      extension: data,
    }
  }

  const upload = await data.upload
  return context.images(storage).getDataFromStream(upload.createReadStream(), upload.filename)
}

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS)

function isValidImageExtension (extension: string): extension is ImageExtension {
  return extensionsSet.has(extension)
}

export function image <ListTypeInfo extends BaseListTypeInfo> (config: ImageFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const { fieldKey } = meta
    const storage = meta.getStorage(config.storage)

    if (!storage) {
      throw new Error(`${meta.listKey}.${fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`)
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type image")
    }

    const hooks: InternalFieldHooks<ListTypeInfo> = {}
    if (!storage.preserve) {
      hooks.beforeOperation = async (args) => {
        if (args.operation === 'update' || args.operation === 'delete') {
          const idKey = `${fieldKey}_id`
          const id = args.item[idKey]
          const extensionKey = `${fieldKey}_extension`
          const extension = args.item[extensionKey]

          // This will occur on an update where an image already existed but has been
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
    }

    return fieldType({
      kind: 'multi',
      extendPrismaSchema: config.db?.extendPrismaSchema,
      fields: {
        id: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        extension: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      ...config,
      hooks: mergeFieldHooks(hooks, config.hooks),
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
      output: graphql.field({
        type: ImageFieldOutput,
        resolve ({
          value: {
            id,
            filesize,
            width,
            height,
            extension,
          }
        }) {
          if (id === null) return null
          if (filesize === null) return null
          if (width === null) return null
          if (height === null) return null
          if (extension === null) return null
          if (!isValidImageExtension(extension)) return null

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
