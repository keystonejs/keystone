import { graphql } from '@keystone-6/core';
import { ComponentPropFieldForGraphQL } from './DocumentEditor/component-blocks/api';
import { assertNever } from './DocumentEditor/component-blocks/utils';

function wrapGraphQLFieldInResolver<InputSource, OutputSource>(
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
    resolve(value, args, context, info) {
      const val = getVal(value);
      if (!inputField.resolve) {
        return val;
      }
      return inputField.resolve({ value: val }, args, context, info);
    },
  });
}

export function getOutputGraphQLField(
  name: string,
  prop: ComponentPropFieldForGraphQL,
  interfaceImplementations: graphql.ObjectType<unknown>[]
): graphql.Field<
  { value: unknown },
  Record<string, graphql.Arg<graphql.InputType, boolean>>,
  graphql.OutputType,
  'value'
> {
  if (prop.kind === 'form') {
    return prop.graphql.output;
  }
  if (prop.kind === 'object') {
    return graphql.field({
      type: graphql.object<unknown>()({
        name,
        fields: Object.fromEntries(
          Object.entries(prop.value).map(
            ([key, val]): [string, graphql.Field<unknown, {}, graphql.OutputType, string>] => {
              const field = getOutputGraphQLField(
                `${name}${key[0].toUpperCase()}${key.slice(1)}`,
                val,
                interfaceImplementations
              );
              return [key, wrapGraphQLFieldInResolver(field, source => (source as any)[key])];
            }
          )
        ),
      }),
    });
  }
  if (prop.kind === 'array') {
    const innerField = getOutputGraphQLField(name, prop.element, interfaceImplementations);
    const resolve = innerField.resolve;

    return graphql.field({
      type: graphql.list(innerField.type),
      args: innerField.args,
      deprecationReason: innerField.deprecationReason,
      description: innerField.description,
      extensions: innerField.extensions,
      resolve({ value }, args, context, info) {
        if (!resolve) {
          return value as unknown[];
        }
        return (value as unknown[]).map(val => resolve({ value: val }, args, context, info));
      },
    });
  }
  if (prop.kind === 'conditional') {
    const discriminantField = getOutputGraphQLField(
      name + 'Discriminant',
      prop.discriminant,
      interfaceImplementations
    );
    type SourceType = { discriminant: string | boolean; value: unknown };
    const interfaceType = graphql.interface<SourceType>()({
      name,
      resolveType: value => {
        const stringifiedDiscriminant = value.discriminant.toString();
        return name + stringifiedDiscriminant[0].toUpperCase() + stringifiedDiscriminant.slice(1);
      },
      fields: {
        discriminant: discriminantField,
      },
    });

    interfaceImplementations.push(
      ...Object.entries(prop.values).map(([key, val]): graphql.ObjectType<SourceType> => {
        const innerName = name + key[0].toUpperCase() + key.slice(1);
        return graphql.object<SourceType>()({
          name: innerName,
          interfaces: [interfaceType],
          fields: {
            discriminant: wrapGraphQLFieldInResolver(discriminantField, x => x.discriminant),
            value: getOutputGraphQLField(`${innerName}Value`, val, interfaceImplementations),
          },
        });
      })
    );

    return graphql.field({
      type: interfaceType,
      resolve({ value }) {
        return value as SourceType;
      },
    });
  }

  assertNever(prop);
}
