import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
  type JSONValue,
} from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values'
import { getOutputGraphQLField } from './structure-graphql-output'
import { type ComponentSchemaForGraphQL } from './DocumentEditor/component-blocks/api'
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
    schema: ComponentSchemaForGraphQL
  }

export const structure =
  <ListTypeInfo extends BaseListTypeInfo>({
    schema,
    ...config
  }: StructureFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type structure")
    }
    const lists = new Set(Object.keys(meta.lists))
    try {
      assertValidComponentSchema(schema, lists)
    } catch (err) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: ${(err as any).message}`)
    }

    const defaultValue = getInitialPropsValue(schema)

    const unreferencedConcreteInterfaceImplementations: graphql.ObjectType<any>[] = []

    const name = meta.listKey + meta.fieldKey[0].toUpperCase() + meta.fieldKey.slice(1)
    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        hooks: {
          ...config.hooks,
          async resolveInput (args) {
            let val = args.resolvedData[meta.fieldKey]
            if (args.operation === 'update') {
              let prevVal = args.item[meta.fieldKey]
              if (meta.provider === 'sqlite') {
                prevVal = JSON.parse(prevVal as any)
                val = args.inputData[meta.fieldKey]
              }
              val = await getValueForUpdate(schema, val, prevVal, args.context, [])
              if (meta.provider === 'sqlite') {
                val = JSON.stringify(val)
              }
            }

            return config.hooks?.resolveInput
              ? config.hooks.resolveInput({
                  ...args,
                  resolvedData: { ...args.resolvedData, [meta.fieldKey]: val },
                })
              : val
          },
        },
        input: {
          create: {
            arg: graphql.arg({
              type: getGraphQLInputType(name, schema, 'create', new Map(), meta),
            }),
            async resolve (val, context) {
              return await getValueForCreate(schema, val, context, [])
            },
          },
          update: {
            arg: graphql.arg({
              type: getGraphQLInputType(name, schema, 'update', new Map(), meta),
            }),
          },
        },
        output: graphql.field({
          type: graphql.object<{ value: JSONValue }>()({
            name: `${name}Output`,
            fields: {
              structure: getOutputGraphQLField(
                name,
                schema,
                unreferencedConcreteInterfaceImplementations,
                new Map(),
                meta
              ),
              json: graphql.field({
                type: graphql.JSON,
                args: {
                  hydrateRelationships: graphql.arg({
                    type: graphql.nonNull(graphql.Boolean),
                    defaultValue: false,
                  }),
                },
                resolve ({ value }, args, context) {
                  if (args.hydrateRelationships) {
                    return addRelationshipDataToComponentProps(schema, value, (schema, value) =>
                      fetchRelationshipData(
                        context,
                        schema.listKey,
                        schema.many,
                        schema.selection || '',
                        value
                      )
                    )
                  }
                  return value
                },
              }),
            },
          }),
          resolve (source) {
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
