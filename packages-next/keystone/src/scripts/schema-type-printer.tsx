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
import type { Keystone } from '@keystone-next/types';

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
        throw new Error(`TypeScript type for GraphQL scalar ${name} was not provided`);
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

export function printGeneratedTypes(printedSchema: string, keystone: Keystone) {
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
    keystone.graphQLSchema,
    scalars
  );

  printedTypes += '\n';

  let allListsStr = '\nexport type KeystoneListsTypeInfo = {';

  let queryTypeName = keystone.graphQLSchema.getQueryType()!.name;

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

  for (const listKey in keystone.adminMeta.lists) {
    const list = keystone.adminMeta.lists[listKey];
    let backingTypes = '{\n';
    for (const fieldKey in keystone.config.lists[list.key].fields) {
      const fieldThing = keystone.config.lists[list.key].fields[fieldKey];
      let backingType = fieldThing.getBackingType(fieldKey);
      for (const key in backingType) {
        backingTypes += `readonly ${JSON.stringify(key)}${backingType[key].optional ? '?' : ''}: ${
          backingType[key].type
        };\n`;
      }
    }
    backingTypes += '}';

    let listTypeInfoName = `${list.key}ListTypeInfo`;
    printedTypes += `
export type ${listTypeInfoName} = {
  key: ${JSON.stringify(listKey)};
  fields: ${Object.keys(keystone.adminMeta.lists[list.key].fields)
    .map(x => JSON.stringify(x))
    .join('|')}
  backing: ${backingTypes};
  inputs: {
    where: ${list.gqlNames.whereInputName};
    create: ${list.gqlNames.createInputName};
    update: ${list.gqlNames.updateInputName};
  };
  args: {
    listQuery: ${printArgs(queryNodeFieldsByName[list.gqlNames.listQueryName].arguments!)}
  };
};

export type ${list.key}ListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<${listTypeInfoName}, ${listTypeInfoName}['fields']>
) => import('@keystone-next/keystone/schema').ListConfig<${listTypeInfoName}, ${listTypeInfoName}['fields']>;
`;
    allListsStr += `\n  readonly ${JSON.stringify(list.key)}: ${listTypeInfoName};`;
  }

  return printedTypes + allListsStr + '\n};\n';
}
