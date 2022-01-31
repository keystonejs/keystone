import {
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLType,
  GraphQLNonNull,
  GraphQLNamedType,
  GraphQLList,
  GraphQLInputObjectType,
  introspectionTypes,
  GraphQLAbstractType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLInterfaceType,
} from 'graphql';
import { getGqlNames } from '../types';
import { InitialisedList } from './core/types-for-lists';

const introspectionTypesSet = new Set(introspectionTypes);

function printEnumTypeDefinition(type: GraphQLEnumType) {
  return `export type ${type.name} =\n${type
    .getValues()
    .map(x => `  | ${JSON.stringify(x.name)}`)
    .join('\n')};`;
}

function printNamedTypeReference(type: GraphQLNamedType): string {
  let name = type.name;
  if (type instanceof GraphQLScalarType) {
    return `Scalars[${JSON.stringify(name)}]`;
  }
  return name;
}

function printInputTypeReferenceWithoutNullable(
  type: GraphQLNamedType | GraphQLList<GraphQLType>
): string {
  if (type instanceof GraphQLList) {
    return `ReadonlyArray<${printInputTypeReference(type.ofType)}> | ${printInputTypeReference(
      type.ofType
    )}`;
  }
  return printNamedTypeReference(type);
}

function printInputTypeReference(type: GraphQLType): string {
  if (type instanceof GraphQLNonNull) {
    return printInputTypeReferenceWithoutNullable(type.ofType);
  }
  return `${printInputTypeReferenceWithoutNullable(type)} | null`;
}

function printInputObjectTypeDefinition(type: GraphQLInputObjectType) {
  let str = `export type ${type.name} = {\n`;
  for (const field of Object.values(type.getFields())) {
    str += `  readonly ${field.name}${
      field.type instanceof GraphQLNonNull && field.defaultValue === undefined ? '' : '?'
    }: ${printInputTypeReference(field.type)};\n`;
  }
  str += '};';
  return str;
}

function printOutputTypeReferenceWithoutNullable(
  type: GraphQLNamedType | GraphQLList<GraphQLType>
): string {
  if (type instanceof GraphQLList) {
    return `ReadonlyArray<${printOutputTypeReference(type.ofType)}>`;
  }
  return printNamedTypeReference(type);
}

function printOutputTypeReference(type: GraphQLType): string {
  if (type instanceof GraphQLNonNull) {
    return printOutputTypeReferenceWithoutNullable(type.ofType);
  }
  return `${printOutputTypeReferenceWithoutNullable(type)} | null`;
}

function printOutputObjectType(type: GraphQLObjectType) {
  let str = `export type ${type.name} = {\n  readonly __typename?: ${JSON.stringify(type.name)};\n`;
  for (const field of Object.values(type.getFields())) {
    str += `  readonly ${field.name}?: ${printOutputTypeReference(field.type)};\n`;
  }
  str += '};';
  return str;
}

function printAbstractType(schema: GraphQLSchema, type: GraphQLAbstractType) {
  return `export type ${type.name} = ${schema
    .getPossibleTypes(type)
    .map(x => x.name)
    .join(' | ')};`;
}

function printOutputTypesFromSchema(schema: GraphQLSchema) {
  let typeString = '';
  for (const type of Object.values(schema.getTypeMap())) {
    // We don't want to print TS types for the built-in GraphQL introspection types
    // they won't be used for anything we want to print here.
    if (introspectionTypesSet.has(type)) continue;
    if (type instanceof GraphQLObjectType) {
      typeString += '\n\n' + printOutputObjectType(type);
    } else if (type instanceof GraphQLEnumType) {
      typeString += '\n\n' + printEnumTypeDefinition(type);
    } else if (type instanceof GraphQLUnionType || type instanceof GraphQLInterfaceType) {
      typeString += '\n\n' + printAbstractType(schema, type);
    }
  }
  return typeString;
}

function printInputTypesFromSchema(schema: GraphQLSchema) {
  let typeString = '';
  for (const type of Object.values(schema.getTypeMap())) {
    // We don't want to print TS types for the built-in GraphQL introspection types
    // they won't be used for anything we want to print here.
    if (introspectionTypesSet.has(type)) continue;
    if (type instanceof GraphQLInputObjectType) {
      typeString += '\n\n' + printInputObjectTypeDefinition(type);
    }
    if (type instanceof GraphQLEnumType) {
      typeString += '\n\n' + printEnumTypeDefinition(type);
    }
  }
  return typeString + '\n\n';
}

function printScalarTypes(scalars: Record<string, string>) {
  // if a user uses their own scalar type, it'll be `unknown`
  let types = `export type Scalars = {\n  readonly [key: string]: unknown;`;
  for (const [name, type] of Object.entries(scalars)) {
    types += `\n  readonly ${name}: ${type};`;
  }
  return types + '\n};';
}

const commonScalarTypes = {
  ID: 'string',
  Boolean: 'boolean',
  String: 'string',
  Int: 'number',
  Float: 'number',
  JSON: 'import("@keystone-6/core/types").JSONValue',
};

const inputScalarTypes = printScalarTypes({
  ...commonScalarTypes,
  Decimal: 'import("@keystone-6/core/types").Decimal | string',
  DateTime: 'Date | string',
});

const externalOutputScalarTypes = printScalarTypes({
  ...commonScalarTypes,
  Decimal: 'string',
  DateTime: 'string',
});

export function printGeneratedTypes(
  graphQLSchema: GraphQLSchema,
  lists: Record<string, InitialisedList>
) {
  const printedInputTypes = inputScalarTypes + printInputTypesFromSchema(graphQLSchema);
  const printedOutputTypes =
    'export declare namespace OutputTypes {\n' +
    (externalOutputScalarTypes + printOutputTypesFromSchema(graphQLSchema))
      .split('\n')
      .map(x => (x.length ? '  ' + x : ''))
      .join('\n') +
    '\n}';

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
      outputs: {
        item: OutputTypes.${listKey};
      };
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
  return printedInputTypes + printedOutputTypes + listsNamespaceStr + postlude;
}
