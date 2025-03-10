import { g } from '@keystone-6/core'
import { type FieldData } from '@keystone-6/core/types'
import { type ComponentSchema } from './DocumentEditor/component-blocks/api-shared'
import { assertNever } from './DocumentEditor/component-blocks/utils'

function wrapGraphQLFieldInResolver<InputSource, OutputSource>(
  inputField: g.Field<
    { value: InputSource },
    Record<string, g.Arg<g.InputType, boolean>>,
    g.OutputType,
    'value'
  >,
  getVal: (outputSource: OutputSource) => InputSource
): g.Field<OutputSource, Record<string, g.Arg<g.InputType, boolean>>, g.OutputType, string> {
  return g.field({
    type: inputField.type,
    args: inputField.args,
    deprecationReason: inputField.deprecationReason,
    description: inputField.description,
    extensions: inputField.extensions as any,
    resolve(value, args, context, info) {
      const val = getVal(value)
      if (!inputField.resolve) {
        return val
      }
      return inputField.resolve({ value: val }, args, context, info)
    },
  })
}

type OutputField = g.Field<
  { value: unknown },
  Record<string, g.Arg<g.InputType, boolean>>,
  g.OutputType,
  string
>

export function getOutputGraphQLField(
  name: string,
  schema: ComponentSchema,
  interfaceImplementations: g.ObjectType<any>[],
  cache: Map<ComponentSchema, OutputField>,
  meta: FieldData
) {
  if (!cache.has(schema)) {
    const res = getOutputGraphQLFieldInner(name, schema, interfaceImplementations, cache, meta)
    cache.set(schema, res)
  }
  return cache.get(schema)!
}

function getOutputGraphQLFieldInner(
  name: string,
  schema: ComponentSchema,
  interfaceImplementations: g.ObjectType<any>[],
  cache: Map<ComponentSchema, OutputField>,
  meta: FieldData
): OutputField {
  if (schema.kind === 'form') {
    if (!schema.graphql) {
      throw new Error(`Field at ${name} is missing a graphql field`)
    }
    return wrapGraphQLFieldInResolver(schema.graphql.output, x => x.value)
  }
  if (schema.kind === 'object') {
    return g.field({
      type: g.object<unknown>()({
        name,
        fields: () =>
          Object.fromEntries(
            Object.entries(schema.fields).map(
              ([key, val]): [
                string,
                g.Field<unknown, Record<string, g.Arg<g.InputType>>, g.OutputType, string>,
              ] => {
                const field = getOutputGraphQLField(
                  `${name}${key[0].toUpperCase()}${key.slice(1)}`,
                  val,
                  interfaceImplementations,
                  cache,
                  meta
                )
                return [key, wrapGraphQLFieldInResolver(field, source => (source as any)[key])]
              }
            )
          ),
      }),
      resolve({ value }) {
        return value
      },
    })
  }
  if (schema.kind === 'array') {
    const innerField = getOutputGraphQLField(
      name,
      schema.element,
      interfaceImplementations,
      cache,
      meta
    )
    const resolve = innerField.resolve

    return g.field({
      type: g.list(innerField.type),
      args: innerField.args,
      deprecationReason: innerField.deprecationReason,
      description: innerField.description,
      extensions: innerField.extensions,
      resolve({ value }, args, context, info) {
        if (!resolve) {
          return value as unknown[]
        }
        return (value as unknown[]).map(val => resolve({ value: val }, args, context, info))
      },
    })
  }
  if (schema.kind === 'conditional') {
    let discriminantField: OutputField

    const getDiscriminantField = () => {
      if (!discriminantField) {
        discriminantField = getOutputGraphQLField(
          name + 'Discriminant',
          schema.discriminant,
          interfaceImplementations,
          cache,
          meta
        )
      }
      return discriminantField
    }
    type SourceType = { discriminant: string | boolean; value: unknown }

    const interfaceType = g.interface<SourceType>()({
      name,
      resolveType: value => {
        const stringifiedDiscriminant = value.discriminant.toString()
        return name + stringifiedDiscriminant[0].toUpperCase() + stringifiedDiscriminant.slice(1)
      },
      fields: () => ({
        discriminant: getDiscriminantField(),
      }),
    })

    interfaceImplementations.push(
      ...Object.entries(schema.values).map(([key, val]): g.ObjectType<SourceType> => {
        const innerName = name + key[0].toUpperCase() + key.slice(1)
        return g.object<SourceType>()({
          name: innerName,
          interfaces: [interfaceType],
          fields: () => ({
            discriminant: wrapGraphQLFieldInResolver(getDiscriminantField(), x => x.discriminant),
            value: getOutputGraphQLField(
              `${innerName}Value`,
              val,
              interfaceImplementations,
              cache,
              meta
            ),
          }),
        })
      })
    )

    return g.field({
      type: interfaceType,
      resolve({ value }) {
        return value as SourceType
      },
    })
  }

  if (schema.kind === 'relationship') {
    const listOutputType = meta.lists[schema.listKey].types.output
    return g.field({
      type: schema.many ? g.list(listOutputType) : listOutputType,
      resolve({ value }, args, context) {
        if (Array.isArray(value)) {
          return context.db[schema.listKey].findMany({
            where: {
              id: { in: (value as { id: string }[]).map(x => x.id) },
            },
          })
        }
        if ((value as any)?.id == null) {
          return null
        }
        return context.db[schema.listKey].findOne({
          where: {
            id: (value as { id: string }).id,
          },
        })
      },
    })
  }

  if (schema.kind === 'child') {
    throw new Error('Child fields are not supported in the structure field')
  }

  assertNever(schema)
}
