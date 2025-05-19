import { GraphQLError } from 'graphql'
import type { BaseFieldTypeInfo } from '@keystone-6/core/types'
import {
  fieldType,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  type JSONValue,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import type { controller } from './views-shared'
import { editorOptionsToConfig, type EditorOptions } from './config'

export type ContentFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo
> & {
  options?: EditorOptions
  db?: { map?: string; extendPrismaSchema?: (field: string) => string }
}

export function content<ListTypeInfo extends BaseListTypeInfo>({
  options = {},
  ...config
}: ContentFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const editorConfig = editorOptionsToConfig(options)
    const inputResolver = (data: JSONValue | null | undefined): any => {
      if (data === null) throw new GraphQLError('Input error: Content fields cannot be set to null')
      if (data === undefined) return data

      return data
    }

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type content")
    }

    return fieldType({
      kind: 'scalar',
      scalar: 'Json',
      mode: 'required',
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/content',
      input: {
        create: {
          arg: g.arg({ type: g.JSON }),
          resolve(val) {
            if (val === undefined) {
              val = [{ type: 'paragraph', children: [{ text: '' }] }]
            }
            return inputResolver(val)
          },
        },
        update: { arg: g.arg({ type: g.JSON }), resolve: inputResolver },
      },
      output: g.field({
        type: g.object<{ content: JSONValue }>()({
          name: `${meta.listKey}_${meta.fieldKey}_Content`,
          fields: {
            content: g.field({
              args: {
                hydrateRelationships: g.arg({
                  type: g.nonNull(g.Boolean),
                  defaultValue: false,
                }),
              },
              type: g.nonNull(g.JSON),
              resolve({ content }, { hydrateRelationships }, context) {
                return content as any
              },
            }),
          },
        }),
        resolve({ value }) {
          if (value === null) return null
          return { content: value }
        },
      }),
      views: '@keystone-6/fields-content/views',
      getAdminMeta(): Parameters<typeof controller>[0]['fieldMeta'] {
        return { config: editorConfig }
      },
    })
  }
}
