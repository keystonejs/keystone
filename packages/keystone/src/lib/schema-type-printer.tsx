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
  return { printedTypes: typeString + '\n', ast };
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
    JSON: 'import("@keystone-6/core/types").JSONValue',
    Decimal: 'import("@keystone-6/core/types").Decimal | string',
  };

  let { printedTypes, ast } = printInputTypesFromSchema(printedSchema, graphQLSchema, scalars);

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

  let allListsStr = '';
  let listsNamespaceStr = '\nexport declare namespace Lists {';

  for (const [listKey, list] of Object.entries(lists)) {
    const gqlNames = getGqlNames(list);

    const listTypeInfoName = `Lists.${listKey}.TypeInfo`;

    allListsStr += `\n  readonly ${listKey}: ${listTypeInfoName};`;
    listsNamespaceStr += `
  export type ${listKey} = import('@keystone-6/core').ListConfig<${listTypeInfoName}, any>;
  namespace ${listKey} {
    export type Item = import('.prisma/client').${listKey};
    export type TypeInfo = {
      key: ${JSON.stringify(listKey)};
      fields: ${Object.keys(list.fields)
        .map(x => JSON.stringify(x))
        .join(' | ')}
      item: Item;
      inputs: {
        where: ${gqlNames.whereInputName};
        uniqueWhere: ${gqlNames.whereUniqueInputName};
        create: ${gqlNames.createInputName};
        update: ${gqlNames.updateInputName};
        orderBy: ${gqlNames.listOrderName};
      };
      all: __TypeInfo;
    };
  }`;
  }
  listsNamespaceStr += '\n}';

  const postlude = `
export type Context = import('@keystone-6/core/types').KeystoneContext<TypeInfo>;

export type TypeInfo = {
  lists: {${allListsStr}
  };
  prisma: import('.prisma/client').PrismaClient;
};
${
  ''
  // we need to reference the `TypeInfo` above in another type that is also called `TypeInfo`
}
type __TypeInfo = TypeInfo;

export type Lists = {
  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo['lists'][Key], any>
} & Record<string, import('@keystone-6/core').ListConfig<any, any>>;
`;
  return printedTypes + listsNamespaceStr + postlude;
}
