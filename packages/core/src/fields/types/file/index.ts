import {
  type FieldTypeFunc,
  type CommonFieldConfig,
  type BaseListTypeInfo,
  type KeystoneContext,
  type FileMetadata,
  fieldType,
} from '../../../types'
import { graphql } from '../../..'
import { mergeFieldHooks, type InternalFieldHooks } from '../../resolve-hooks'

export type FileFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    storage: string
    db?: {
      extendPrismaSchema?: (field: string) => string
    }
  }

const FileFieldInput = graphql.inputObject({
  name: 'FileFieldInput',
  fields: {
    upload: graphql.arg({ type: graphql.nonNull(graphql.Upload) }),
  },
})

const inputArg = graphql.arg({ type: FileFieldInput })

const FileFieldOutput = graphql.object<FileMetadata & { storage: string }>()({
  name: 'FileFieldOutput',
  fields: {
    filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    url: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve (data, args, context) {
        return context.files(data.storage).getUrl(data.filename)
      },
    }),
  },
})

async function inputResolver (
  storage: string,
  data: graphql.InferValueFromArg<typeof inputArg>,
  context: KeystoneContext
) {
  if (data === null || data === undefined) return { filename: data, filesize: data }
  const upload = await data.upload
  return context.files(storage).getDataFromStream(upload.createReadStream(), upload.filename)
}

export function file <ListTypeInfo extends BaseListTypeInfo> (config: FileFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const { fieldKey } = meta
    const storage = meta.getStorage(config.storage)

    if (!storage) {
      throw new Error(`${meta.listKey}.${fieldKey} has storage set to ${config.storage}, but no storage configuration was found for that key`)
    }

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type file")
    }

    const hooks: InternalFieldHooks<ListTypeInfo> = {}
    if (!storage.preserve) {
      hooks.beforeOperation = async function (args) {
        if (args.operation === 'update' || args.operation === 'delete') {
          const filenameKey = `${fieldKey}_filename`
          const filename = args.item[filenameKey]

          // this will occur on an update where a file already existed but has been
          // changed, or on a delete, where there is no longer an item
          if (
            (args.operation === 'delete' ||
              typeof args.resolvedData[fieldKey].filename === 'string' ||
              args.resolvedData[fieldKey].filename === null) &&
            typeof filename === 'string'
          ) {
            await args.context.files(config.storage).deleteAtSource(filename)
          }
        }
      }
    }

    return fieldType({
      kind: 'multi',
      extendPrismaSchema: config.db?.extendPrismaSchema,
      fields: {
        filesize: { kind: 'scalar', scalar: 'Int', mode: 'optional' },
        filename: { kind: 'scalar', scalar: 'String', mode: 'optional' },
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
        type: FileFieldOutput,
        resolve ({ value: { filesize, filename } }) {
          if (filename === null) return null
          if (filesize === null) return null
          return {
            filename,
            filesize,
            storage: config.storage
          }
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/file',
      views: '@keystone-6/core/fields/types/file/views',
    })
  }
}
