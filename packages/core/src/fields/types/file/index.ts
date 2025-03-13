import type {
  BaseKeystoneTypeInfo,
  BaseListTypeInfo,
  CommonFieldConfig,
  FieldHooks,
  FieldTypeFunc,
  KeystoneContext,
  MaybePromise,
  StorageStrategy,
} from '../../../types'
import { fieldType } from '../../../types'
import { g } from '../../..'
import { merge } from '../../resolve-hooks'
import type { InferValueFromArg } from '@graphql-ts/schema'
import { randomBytes } from 'node:crypto'

export type FileFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    storage: StorageStrategy<BaseKeystoneTypeInfo>
    transformName?: (originalFilename: string) => MaybePromise<string>
    db?: {
      extendPrismaSchema?: (field: string) => string
    }
  }

const FileFieldInput = g.inputObject({
  name: 'FileFieldInput',
  fields: {
    upload: g.arg({ type: g.nonNull(g.Upload) }),
  },
})

const inputArg = g.arg({ type: FileFieldInput })

const FileFieldOutput = g.object<{
  filename: string
  filesize: number
  url: (_args: {}, context: KeystoneContext) => Promise<string>
}>()({
  name: 'FileFieldOutput',
  fields: {
    filename: g.field({ type: g.nonNull(g.String) }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    url: g.field({ type: g.nonNull(g.String) }),
  },
})

async function inputResolver(
  storage: StorageStrategy<BaseKeystoneTypeInfo>,
  transformName: (originalFilename: string) => Promise<string> | string,
  context: KeystoneContext,
  data: InferValueFromArg<typeof inputArg>
) {
  if (data === null || data === undefined) return { filename: data, filesize: data }
  const upload = await data.upload
  const stream = upload.createReadStream()
  let filesize = 0
  stream.on('data', data => {
    filesize += data.length
  })

  const filename = await transformName(upload.filename)
  await storage.put(filename, stream, { contentType: 'application/octet-stream' }, context)
  return { filename, filesize }
}

export function file<ListTypeInfo extends BaseListTypeInfo>(
  config: FileFieldConfig<ListTypeInfo>
): FieldTypeFunc<ListTypeInfo> {
  const { transformName = defaultTransformName } = config
  return meta => {
    const { fieldKey } = meta

    if ('isIndexed' in config) {
      throw Error("isIndexed: 'unique' is not a supported option for field type file")
    }

    const afterOperationResolver: Extract<
      FieldHooks<BaseListTypeInfo, string>['afterOperation'],
      (args: any) => any
    > = async function afterOperationResolver(args) {
      if (args.operation === 'update' || args.operation === 'delete') {
        const filenameKey = `${fieldKey}_filename`
        const oldFilename = args.originalItem[filenameKey] as string | null | undefined
        const newFilename = args.item?.[filenameKey] as string | null | undefined

        // this will occur on an update where a file already existed but has been
        // changed, or on a delete, where there is no longer an item
        // but not when the old and new filenames are the same (in that case, presumably the file has been overwritten)
        if (typeof oldFilename === 'string' && oldFilename !== newFilename) {
          await config.storage.delete(oldFilename, args.context)
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
        type: FileFieldOutput,
        resolve({ value: { filesize, filename } }) {
          if (filename === null) return null
          if (filesize === null) return null
          return {
            filename,
            filesize,
            url: async (_, context) => config.storage.url(filename, context),
          }
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/file',
      views: '@keystone-6/core/fields/types/file/views',
    })
  }
}

// appends a 128-bit random identifier to the filename to prevent guessing
function defaultTransformName(path: string) {
  // this regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphanumerical character before the end of the string
  const [, name, ext] = path.match(/^([^:\n].*?)(\.[A-Za-z0-9]{0,10})?$/) as RegExpMatchArray

  const id = randomBytes(16).toString('base64url')
  const urlSafeName = name.replace(/[^A-Za-z0-9]/g, '-')
  if (ext) return `${urlSafeName}-${id}${ext}`
  return `${urlSafeName}-${id}`
}
