import {
  execute,
  FragmentDefinitionNode,
  GraphQLField,
  GraphQLList,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLSchema,
  parse,
  validate,
} from 'graphql';
import { KeystoneContext } from '@keystone-next/types';
import { getVariablesForGraphQLField } from './executeGraphQLFieldToRootVal';

function getRootTypeName(type: GraphQLOutputType): string {
  if (type instanceof GraphQLNonNull) {
    return getRootTypeName(type.ofType);
  }
  if (type instanceof GraphQLList) {
    return getRootTypeName(type.ofType);
  }
  return type.name;
}

export function executeGraphQLFieldWithSelection(
  schema: GraphQLSchema,
  field: GraphQLField<any, any>
) {
  const { argumentNodes, variableDefinitions } = getVariablesForGraphQLField(field);
  const rootName = getRootTypeName(field.type);
  return async (args: Record<string, any>, query: string, context: KeystoneContext) => {
    const selectionSet = (
      parse(`fragment x on ${rootName} {${query}}`).definitions[0] as FragmentDefinitionNode
    ).selectionSet;

    const document = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: { kind: 'Name', value: field.name },
                arguments: argumentNodes,
                selectionSet: selectionSet,
              },
            ],
          },
          variableDefinitions,
        },
      ],
    } as const;

    const validationErrors = validate(schema, document);

    if (validationErrors.length > 0) {
      throw validationErrors[0];
    }

    const result = await execute({
      schema,
      document,
      contextValue: context,
      variableValues: args,
      rootValue: {},
    });
    if (result.errors?.length) {
      throw result.errors[0];
    }
    return result.data![field.name];
  };
}
