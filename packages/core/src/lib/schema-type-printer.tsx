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
} from 'graphql';
import { getGqlNames } from '../types';
import { InitialisedList } from './core/types-for-lists';

const introspectionTypesSet = new Set(introspectionTypes);

function printEnumTypeDefinition(type: GraphQLEnumType) {
  return [
    `export type ${type.name} =`,
    type
      .getValues()
      .map(x => `  | ${JSON.stringify(x.name)}`)
      .join('\n') + ';',
  ].join('\n');
}

function printTypeReference(type: GraphQLType, scalars: Record<string, string>): string {
  if (type instanceof GraphQLNonNull) {
    return printTypeReferenceWithoutNullable(type.ofType, scalars);
  }
  return `${printTypeReferenceWithoutNullable(type, scalars)} | null`;
}

function printTypeReferenceWithoutNullable(
  type: GraphQLNamedType | GraphQLList<GraphQLType>,
  scalars: Record<string, string>
): string {
  if (type instanceof GraphQLList) {
    return `ReadonlyArray<${printTypeReference(type.ofType, scalars)}> | ${printTypeReference(
      type.ofType,
      scalars
    )}`;
  }

  const name = type.name;
  if (type instanceof GraphQLScalarType) {
    if (scalars[name] === undefined) return 'any';
    return `Scalars[${JSON.stringify(name)}]`;
  }

  return name;
}

function printInputObjectTypeDefinition(
  type: GraphQLInputObjectType,
  scalars: Record<string, string>
) {
  return [
    `export type ${type.name} = {`,
    ...Object.values(type.getFields()).map(({ type, defaultValue, name }) => {
      const maybe = type instanceof GraphQLNonNull && defaultValue === undefined ? '' : '?';
      return `  readonly ${name}${maybe}: ${printTypeReference(type, scalars)};`;
    }),
    '};',
  ].join('\n');
}

function printInputTypesFromSchema(schema: GraphQLSchema, scalars: Record<string, string>) {
  const output = [
    'type Scalars = {',
    ...Object.keys(scalars).map(scalar => `  readonly ${scalar}: ${scalars[scalar]};`),
    '};',
  ];

  for (const type of Object.values(schema.getTypeMap())) {
    // We don't want to print TS types for the built-in GraphQL introspection types
    // they won't be used for anything we want to print here.
    if (introspectionTypesSet.has(type)) continue;
    if (type instanceof GraphQLInputObjectType) {
      output.push('', printInputObjectTypeDefinition(type, scalars));
    }
    if (type instanceof GraphQLEnumType) {
      output.push('', printEnumTypeDefinition(type));
    }
  }

  return output.join('\n');
}

function printInterimFieldType({
  prismaClientPath,
  listKey,
  fieldKey,
  prismaKey,
  operation,
}: {
  prismaClientPath: string;
  listKey: string;
  fieldKey: string;
  prismaKey: string;
  operation: string;
}) {
  return `  ${fieldKey}?: import('${prismaClientPath}').Prisma.${listKey}${operation}Input["${prismaKey}"];`;
}

function printInterimMultiFieldType({
  prismaClientPath,
  listKey,
  fieldKey,
  operation,
  fields,
}: {
  prismaClientPath: string;
  listKey: string;
  fieldKey: string;
  operation: string;
  fields: { [key: string]: unknown };
}) {
  return [
    `  ${fieldKey}: {`,
    ...Object.keys(fields).map(subFieldKey => {
      const prismaKey = `${fieldKey}_${subFieldKey}`;
      return (
        '  ' +
        printInterimFieldType({
          prismaClientPath,
          listKey,
          fieldKey: subFieldKey,
          prismaKey,
          operation,
        })
      );
    }),
    `  };`,
  ].join('\n');
}

function printInterimType<L extends InitialisedList>(
  prismaClientPath: string,
  list: L,
  listKey: string,
  typename: string,
  operation: 'Create' | 'Update'
) {
  return [
    `type Resolved${typename} = {`,
    ...Object.entries(list.fields).map(([fieldKey, { dbField }]) => {
      if (dbField.kind === 'none' || fieldKey === 'id') return `  ${fieldKey}?: undefined;`;
      if (dbField.kind === 'multi') {
        return printInterimMultiFieldType({
          prismaClientPath,
          listKey,
          fieldKey,
          operation,
          fields: dbField.fields,
        });
      }

      return printInterimFieldType({
        prismaClientPath,
        listKey,
        fieldKey,
        prismaKey: fieldKey,
        operation,
      });
    }),
    `};`,
  ].join('\n');
}

function printListTypeInfo<L extends InitialisedList>(
  prismaClientPath: string,
  listKey: string,
  list: L
) {
  // prettier-ignore
  const {
    whereInputName,
    whereUniqueInputName,
    createInputName,
    updateInputName,
    listOrderName,
  } = getGqlNames(list);
  const listTypeInfoName = `Lists.${listKey}.TypeInfo`;

  // prettier-ignore
  return [
    `export type ${listKey} = import('@keystone-6/core').ListConfig<${listTypeInfoName}, any>;`,
    `namespace ${listKey} {`,
    `  export type Item = import('${prismaClientPath}').${listKey};`,
    `  export type TypeInfo = {`,
    `    key: "${listKey}";`,
    `    isSingleton: ${list.isSingleton};`,
    `    fields: ${Object.keys(list.fields).map(x => `"${x}"`).join(' | ')}`,
    `    item: Item;`,
    `    inputs: {`,
    `      where: ${whereInputName};`,
    `      uniqueWhere: ${whereUniqueInputName};`,
    `      create: ${list.graphql.isEnabled.create ? createInputName : 'never'};`,
    `      update: ${list.graphql.isEnabled.update ? updateInputName : 'never'};`,
    `      orderBy: ${listOrderName};`,
    `    };`,
    `    prisma: {`,
    `      create: ${list.graphql.isEnabled.create ? `Resolved${createInputName}` : 'never'};`,
    `      update: ${list.graphql.isEnabled.update ? `Resolved${updateInputName}` : 'never'};`,
    `    };`,
    `    all: __TypeInfo;`,
    `  };`,
    `}`,
  ]
    .map(line => `  ${line}`)
    .join('\n');
}

export function printGeneratedTypes(
  prismaClientPath: string,
  graphQLSchema: GraphQLSchema,
  lists: Record<string, InitialisedList>
) {
  const interimCreateUpdateTypes = [];
  const listsTypeInfo = [];
  const listsNamespaces = [];
  prismaClientPath = JSON.stringify(prismaClientPath).slice(1, -1);

  for (const [listKey, list] of Object.entries(lists)) {
    const gqlNames = getGqlNames(list);
    const listTypeInfoName = `Lists.${listKey}.TypeInfo`;

    if (list.graphql.isEnabled.create) {
      interimCreateUpdateTypes.push(
        printInterimType(prismaClientPath, list, listKey, gqlNames.createInputName, 'Create')
      );
    }

    if (list.graphql.isEnabled.update) {
      interimCreateUpdateTypes.push(
        printInterimType(prismaClientPath, list, listKey, gqlNames.updateInputName, 'Update')
      );
    }

    listsTypeInfo.push(`    readonly ${listKey}: ${listTypeInfoName};`);
    listsNamespaces.push(printListTypeInfo(prismaClientPath, listKey, list));
  }

  return [
    printInputTypesFromSchema(graphQLSchema, {
      ID: 'string',
      Boolean: 'boolean',
      String: 'string',
      Int: 'number',
      Float: 'number',
      JSON: 'import("@keystone-6/core/types").JSONValue',
      Decimal: 'import("@keystone-6/core/types").Decimal | string',
    }),
    '',
    interimCreateUpdateTypes.join('\n\n'),
    '',
    'export declare namespace Lists {',
    ...listsNamespaces,
    '}',
    `export type Context = import('@keystone-6/core/types').KeystoneContext<TypeInfo>;`,
    '',
    'export type TypeInfo = {',
    `  lists: {`,
    ...listsTypeInfo,
    `  };`,
    `  prisma: import('${prismaClientPath}').PrismaClient;`,
    `};`,
    ``,
    // we need to reference the `TypeInfo` above in another type that is also called `TypeInfo`
    `type __TypeInfo = TypeInfo;`,
    ``,
    `export type Lists = {`,
    `  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo['lists'][Key], any>`,
    `} & Record<string, import('@keystone-6/core').ListConfig<any, any>>;`,
    ``,
    `export {}`,
    ``,
  ].join('\n');
}
