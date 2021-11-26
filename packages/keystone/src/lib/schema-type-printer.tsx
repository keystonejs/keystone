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
import { getGqlNames } from '../types';
import { InitialisedList } from './core/types-for-lists';

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
      return `ReadonlyArray<${printTypeNode(node.type)}> | ${printTypeNode(node.type)}`;
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
        node.type.kind === 'NonNullType' && !node.defaultValue ? '' : '?'
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
  graphQLSchema: GraphQLSchema,
  lists: Record<string, InitialisedList>
) {
  let scalars = {
    ID: 'string',
    Boolean: 'boolean',
    String: 'string',
    Int: 'number',
    Float: 'number',
    JSON: 'import("@keystone-next/keystone/types").JSONValue',
    Decimal: 'import("@keystone-next/keystone/types").Decimal | string',
  };

  let { printedTypes, ast, printTypeNode } = printInputTypesFromSchema(
    printedSchema,
    graphQLSchema,
    scalars
  );

  printedTypes += '\n';

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
      types += `  readonly ${arg.name.value}${
        arg.type.kind === 'NonNullType' && !arg.defaultValue ? '' : '?'
      }: ${printTypeNode(arg.type)};\n`;
    }
    return types + '}';
  };

  let allListsStr = '\nexport type KeystoneListsTypeInfo = {';
  let listsNamespaceStr = '\nexport declare namespace Lists {';

  for (const [listKey, list] of Object.entries(lists)) {
    const gqlNames = getGqlNames(list);
    let listTypeInfoName = `${listKey}ListTypeInfo`;
    const listQuery = queryNodeFieldsByName[gqlNames.listQueryName];
    printedTypes += `
export type ${listTypeInfoName} = {
  key: ${JSON.stringify(listKey)};
  fields: ${Object.keys(list.fields)
    .map(x => JSON.stringify(x))
    .join('|')}
  backing: import(".prisma/client").${listKey};
  inputs: {
    where: ${gqlNames.whereInputName};
    uniqueWhere: ${gqlNames.whereUniqueInputName};
    create: ${gqlNames.createInputName};
    update: ${gqlNames.updateInputName};
  };
  args: {
    listQuery: ${
      listQuery
        ? printArgs(listQuery.arguments!)
        : 'import("@keystone-next/keystone/types").BaseGeneratedListTypes["args"]["listQuery"]'
    }
  };
  all: KeystoneTypeInfo;
};
`;
    allListsStr += `\n  readonly ${listKey}: ${listTypeInfoName};`;
    listsNamespaceStr += `\n  export type ${listKey} = import('@keystone-next/keystone').ListConfig<${listTypeInfoName}, any>;`;
  }
  allListsStr += '\n};';
  listsNamespaceStr += '\n}';

  const postlude = `
export type KeystoneListsAPI = import('@keystone-next/keystone/types').KeystoneListsAPI<KeystoneListsTypeInfo>;
export type KeystoneDbAPI = import('@keystone-next/keystone/types').KeystoneDbAPI<KeystoneListsTypeInfo>;
export type KeystoneContext = import('@keystone-next/keystone/types').KeystoneContextFromKSTypes<KeystoneTypeInfo>;

export type KeystoneTypeInfo = {
  lists: KeystoneListsTypeInfo;
  prisma: import('.prisma/client').PrismaClient;
};

export type Lists = {
  [Key in keyof KeystoneListsTypeInfo]?: import('@keystone-next/keystone').ListConfig<KeystoneListsTypeInfo[Key], any>
} & Record<string, import('@keystone-next/keystone').ListConfig<any, any>>;
`;
  return printedTypes + allListsStr + listsNamespaceStr + postlude;
}
