import { graphql } from '@keystone-6/core'
import { type FieldData } from '@keystone-6/core/types'
import { type ComponentSchemaForGraphQL } from './DocumentEditor/component-blocks/api-shared'
import { assertNever } from './DocumentEditor/component-blocks/utils'

function wrapGraphQLFieldInResolver<InputSource, OutputSource> (
  inputField: graphql.Field<
    { value: InputSource },
    Record<string, graphql.Arg<graphql.InputType, boolean>>,
    graphql.OutputType,
    'value'
  >,
  getVal: (outputSource: OutputSource) => InputSource
): graphql.Field<
  OutputSource,
  Record<string, graphql.Arg<graphql.InputType, boolean>>,
  graphql.OutputType,
  string
> {
  return graphql.field({
    type: inputField.type,
    args: inputField.args,
    deprecationReason: inputField.deprecationReason,
    description: inputField.description,
    extensions: inputField.extensions as any,
    resolve (value, args, context, info) {
      const val = getVal(value)
      if (!inputField.resolve) {
        return val
      }
      return inputField.resolve({ value: val }, args, context, info)
    },
  })
}

type OutputField = graphql.Field<
  { value: unknown },
  Record<string, graphql.Arg<graphql.InputType, boolean>>,
  graphql.OutputType,
  string
>

export function getOutputGraphQLField (
  name: string,
  schema: ComponentSchemaForGraphQL,
  interfaceImplementations: graphql.ObjectType<unknown>[],
  cache: Map<ComponentSchemaForGraphQL, OutputField>,
  meta: FieldData
) {
  if (!cache.has(schema)) {
    const res = getOutputGraphQLFieldInner(name, schema, interfaceImplementations, cache, meta)
    cache.set(schema, res)
  }
  return cache.get(schema)!
}

function getOutputGraphQLFieldInner (
  name: string,
  schema: ComponentSchemaForGraphQL,
  interfaceImplementations: graphql.ObjectType<unknown>[],
  cache: Map<ComponentSchemaForGraphQL, OutputField>,
  meta: FieldData
): OutputField {
  if (schema.kind === 'form') {
    return wrapGraphQLFieldInResolver(schema.graphql.output, x => x.value)
  }
  if (schema.kind === 'object') {
    return graphql.field({
      type: graphql.object<unknown>()({
        name,
        fields: () =>
          Object.fromEntries(
            Object.entries(schema.fields).map(
              ([key, val]): [string, graphql.Field<unknown, Record<string, graphql.Arg<graphql.InputType>>, graphql.OutputType, string>] => {
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
      resolve ({ value }) {
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

    return graphql.field({
      type: graphql.list(innerField.type),
      args: innerField.args,
      deprecationReason: innerField.deprecationReason,
      description: innerField.description,
      extensions: innerField.extensions,
      resolve ({ value }, args, context, info) {
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
    type SourceType = { discriminant: string | boolean, value: unknown }

    const interfaceType = graphql.interface<SourceType>()({
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
      ...Object.entries(schema.values).map(([key, val]): graphql.ObjectType<SourceType> => {
        const innerName = name + key[0].toUpperCase() + key.slice(1)
        return graphql.object<SourceType>()({
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

    return graphql.field({
      type: interfaceType,
      resolve ({ value }) {
        return value as SourceType
      },
    })
  }

  if (schema.kind === 'relationship') {
    const listOutputType = meta.lists[schema.listKey].types.output
    return graphql.field({
      type: schema.many ? graphql.list(listOutputType) : listOutputType,
      resolve ({ value }, args, context) {
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

  assertNever(schema)
}
