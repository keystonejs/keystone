import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  type JSONValue,
  jsonFieldTypePolyfilledForSQLite,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values'
import { getOutputGraphQLField } from './structure-graphql-output'
import type { ComponentSchema } from './DocumentEditor/component-blocks/api'
import {
  getGraphQLInputType,
  getValueForCreate,
  getValueForUpdate,
} from './structure-graphql-input'
import { assertValidComponentSchema } from './DocumentEditor/component-blocks/field-assertions'
import { addRelationshipDataToComponentProps, fetchRelationshipData } from './relationship-data'

export type StructureFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    db?: { map?: string }
    schema: ComponentSchema
  }

export function structure<ListTypeInfo extends BaseListTypeInfo>({
  schema,
  ...config
}: StructureFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type structure")
    }
    const lists = new Set(Object.keys(meta.lists))
    try {
      assertValidComponentSchema(schema, lists, 'structure')
    } catch (err) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: ${(err as any).message}`)
    }

    const defaultValue = getInitialPropsValue(schema)
    const unreferencedConcreteInterfaceImplementations: g.ObjectType<any>[] = []

    const name = meta.listKey + meta.fieldKey[0].toUpperCase() + meta.fieldKey.slice(1)
    const innerUpdate =
      typeof config.hooks?.resolveInput === 'function'
        ? config.hooks.resolveInput
        : config.hooks?.resolveInput?.update
    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        hooks: {
          ...config.hooks,
          resolveInput: {
            create:
              typeof config.hooks?.resolveInput === 'function'
                ? config.hooks.resolveInput
                : config.hooks?.resolveInput?.create,
            update: async args => {
              let val = args.resolvedData[meta.fieldKey]
              let prevVal = args.item[meta.fieldKey]
              if (meta.provider === 'sqlite') {
                prevVal = JSON.parse(prevVal as any)
                val = args.inputData[meta.fieldKey]
              }
              val = await getValueForUpdate(schema, val, prevVal, args.context, [])
              if (meta.provider === 'sqlite') {
                val = JSON.stringify(val)
              }
              return innerUpdate
                ? innerUpdate({
                    ...args,
                    resolvedData: { ...args.resolvedData, [meta.fieldKey]: val },
                  })
                : val
            },
          },
        },
        input: {
          create: {
            arg: g.arg({
              type: getGraphQLInputType(name, schema, 'create', new Map(), meta),
            }),
            async resolve(val, context) {
              return await getValueForCreate(schema, val, context, [])
            },
          },
          update: {
            arg: g.arg({
              type: getGraphQLInputType(name, schema, 'update', new Map(), meta),
            }),
          },
        },
        output: g.field({
          type: g.object<{ value: JSONValue }>()({
            name: `${name}Output`,
            fields: {
              structure: getOutputGraphQLField(
                name,
                schema,
                unreferencedConcreteInterfaceImplementations,
                new Map(),
                meta
              ),
              json: g.field({
                type: g.JSON,
                args: {
                  hydrateRelationships: g.arg({
                    type: g.nonNull(g.Boolean),
                    defaultValue: false,
                  }),
                },
                resolve({ value }, args, context) {
                  if (!args.hydrateRelationships) return value
                  return addRelationshipDataToComponentProps(schema, value, (schema, value) => {
                    return fetchRelationshipData(
                      context,
                      schema.listKey,
                      schema.many,
                      schema.selection || '',
                      value
                    )
                  })
                },
              }),
            },
          }),
          resolve(source) {
            return source
          },
        }),
        __ksTelemetryFieldTypeName: '@keystone-6/structure',
        views: '@keystone-6/fields-document/structure-views',
        getAdminMeta: () => ({}),
        unreferencedConcreteInterfaceImplementations,
      },
      {
        default: {
          kind: 'literal',
          value: JSON.stringify(defaultValue),
        },
        map: config.db?.map,
        mode: 'required',
      }
    )
  }
}
