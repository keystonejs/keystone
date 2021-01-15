import {
  GraphQLSchema,
  parse,
  TypeNode,
  ListTypeNode,
  NamedTypeNode,
  GraphQLScalarType,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
} from 'graphql';
import prettier from 'prettier';
import type { BaseKeystone } from '@keystone-next/types';

let printEnumTypeDefinition = (node: EnumTypeDefinitionNode) => {
  return `export type ${node.name.value} =\n${node
    .values!.map(x => `  | ${JSON.stringify(x.name.value)}`)
    .join('\n')};`;
};

function printInputTypesFromSchema(
  schema: string,
  schemaObj: GraphQLSchema,
  scalars: Record<string, string>
) {
  let ast = parse(schema);
  let printTypeNodeWithoutNullable = (node: ListTypeNode | NamedTypeNode): string => {
    if (node.kind === 'ListType') {
      return `ReadonlyArray<${printTypeNode(node.type)}>`;
    }
    let name = node.name.value;
    if (schemaObj.getType(name) instanceof GraphQLScalarType) {
      if (scalars[name] === undefined) {
        return 'any';
      }
      return `Scalars[${JSON.stringify(name)}]`;
    }
    return name;
  };
  let printTypeNode = (node: TypeNode): string => {
    if (node.kind === 'NonNullType') {
      return printTypeNodeWithoutNullable(node.type);
    }
    return `${printTypeNodeWithoutNullable(node)} | null`;
  };
  let printInputObjectTypeDefinition = (node: InputObjectTypeDefinitionNode) => {
    let str = `export type ${node.name.value} = {\n`;
    node.fields?.forEach(node => {
      str += `  readonly ${node.name.value}${
        node.type.kind === 'NonNullType' || node.defaultValue ? '' : '?'
      }: ${printTypeNode(node.type)};\n`;
    });
    str += '};';
    return str;
  };
  let typeString = 'type Scalars = {\n';
  for (let scalar in scalars) {
    typeString += `  readonly ${scalar}: ${scalars[scalar]};\n`;
  }
  typeString += '};';
  for (const node of ast.definitions) {
    if (node.kind === 'InputObjectTypeDefinition') {
      typeString += '\n\n' + printInputObjectTypeDefinition(node);
    }
    if (node.kind === 'EnumTypeDefinition') {
      typeString += '\n\n' + printEnumTypeDefinition(node);
    }
  }
  return { printedTypes: typeString + '\n', ast, printTypeNode };
}

export function printGeneratedTypes(
  printedSchema: string,
  keystone: BaseKeystone,
  graphQLSchema: GraphQLSchema
) {
  let scalars = {
    ID: 'string',
    Boolean: 'boolean',
    String: 'string',
    Int: 'number',
    Float: 'number',
    JSON: 'import("@keystone-next/types").JSONValue',
  };
  let { printedTypes, ast, printTypeNode } = printInputTypesFromSchema(
    printedSchema,
    graphQLSchema,
    scalars
  );

  printedTypes += '\n';

  let allListsStr = '\nexport type KeystoneListsTypeInfo = {';

  let queryTypeName = graphQLSchema.getQueryType()!.name;

  let queryNode = ast.definitions.find((node): node is ObjectTypeDefinitionNode => {
    return node.kind === 'ObjectTypeDefinition' && node.name.value === queryTypeName;
  });

  if (!queryNode) {
    throw new Error('Query type on GraphQL schema not found when generating types');
  }

  let queryNodeFieldsByName: Record<string, FieldDefinitionNode> = {};

  for (const field of queryNode.fields!) {
    queryNodeFieldsByName[field.name.value] = field;
  }

  let printArgs = (args: readonly InputValueDefinitionNode[]) => {
    let types = '{\n';
    for (const arg of args) {
      if (arg.name.value === 'search' || arg.name.value === 'orderBy') continue;
      types += `  readonly ${arg.name.value}${
        arg.type.kind === 'NonNullType' || arg.defaultValue ? '' : '?'
      }: ${printTypeNode(arg.type)};\n`;
    }
    return types + '}';
  };

  for (const listKey in keystone.lists) {
    const list = keystone.lists[listKey];
    let backingTypes = '{\n';
    for (const field of list.fields) {
      for (const [key, { optional, type }] of Object.entries(field.getBackingTypes()) as any) {
        backingTypes += `readonly ${JSON.stringify(key)}${optional ? '?' : ''}: ${type};\n`;
      }
    }
    backingTypes += '}';

    const { gqlNames } = list;
    let listTypeInfoName = `${listKey}ListTypeInfo`;
    printedTypes += `
export type ${listTypeInfoName} = {
  key: ${JSON.stringify(listKey)};
  fields: ${Object.keys(list.fieldsByPath)
    .map(x => JSON.stringify(x))
    .join('|')}
  backing: ${backingTypes};
  inputs: {
    where: ${gqlNames.whereInputName};
    create: ${gqlNames.createInputName};
    update: ${gqlNames.updateInputName};
  };
  args: {
    listQuery: ${printArgs(queryNodeFieldsByName[gqlNames.listQueryName].arguments!)}
  };
};

export type ${listKey}ListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<${listTypeInfoName}, ${listTypeInfoName}['fields']>
) => import('@keystone-next/keystone/schema').ListConfig<${listTypeInfoName}, ${listTypeInfoName}['fields']>;
`;
    allListsStr += `\n  readonly ${JSON.stringify(listKey)}: ${listTypeInfoName};`;
  }
  return prettier.format(printedTypes + allListsStr + '\n};\n', {
    parser: 'babel-ts',
    trailingComma: 'es5',
    singleQuote: true,
  });
}
