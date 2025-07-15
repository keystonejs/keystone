import { g } from '@keystone-6/core'
import type { BaseFieldTypeInfo } from '@keystone-6/core/types'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  type JSONValue,
  fieldType,
} from '@keystone-6/core/types'
import type { ComponentSchema } from './DocumentEditor/component-blocks/api'
import { assertValidComponentSchema } from './DocumentEditor/component-blocks/field-assertions'
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values'
import { addRelationshipDataToComponentProps, fetchRelationshipData } from './relationship-data'
import {
  getGraphQLInputType,
  getValueForCreate,
  getValueForUpdate,
} from './structure-graphql-input'
import { getOutputGraphQLField } from './structure-graphql-output'

export type StructureFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo
> & {
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
    const unreferencedConcreteInterfaceImplementations: g<typeof g.object<any>>[] = []

    const name = meta.listKey + meta.fieldKey[0].toUpperCase() + meta.fieldKey.slice(1)
    const innerUpdate =
      typeof config.hooks?.resolveInput === 'function'
        ? config.hooks.resolveInput
        : config.hooks?.resolveInput?.update
    return fieldType({
      kind: 'scalar',
      scalar: 'Json',
      default:
        meta.provider === 'sqlite'
          ? undefined
          : {
              kind: 'literal',
              // TODO: waiting on https://github.com/prisma/prisma/issues/26571
              //   input.create manages defaultValues anyway
              value: JSON.stringify(defaultValue ?? null),
            },
      map: config.db?.map,
      mode: 'required',
    })({
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
            val = await getValueForUpdate(schema, val, prevVal, args.context, [])
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
          resolve(val) {
            return val as any
          },
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
                  return fetchRelationshipData(context, schema, value)
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
    })
  }
}
