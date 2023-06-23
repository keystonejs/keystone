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
import { InitialisedList } from './core/types-for-lists';

const introspectionTypesSet = new Set(introspectionTypes);

function stringify(x: string) {
  return JSON.stringify(x).slice(1, -1);
}

function printEnumTypeDefinition(type: GraphQLEnumType) {
  return [
    `export type ${type.name} =`,
    type
      .getValues()
      .map(x => `  | '${stringify(x.name)}'`)
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
    return `Scalars['${stringify(name)}']`;
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
      const maybe = type instanceof GraphQLNonNull ? '' : '?';
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

function printInterimType<L extends InitialisedList>(
  prismaClientPath: string,
  list: L,
  listKey: string,
  typename: string,
  operation: 'Create' | 'Update'
) {
  const prismaType = `import('${prismaClientPath}').Prisma.${listKey}${operation}Input`;

  return [
    `type Resolved${typename} = {`,
    ...Object.entries(list.fields).map(([fieldKey, { dbField }]) => {
      if (dbField.kind === 'none') return `  ${fieldKey}?: undefined;`;

      // soft-block `id` updates for relationship safety
      if (operation === 'Update' && fieldKey === 'id') return `  id?: undefined;`;

      if (dbField.kind === 'multi') {
        return [
          `  ${fieldKey}: {`,
          ...Object.entries(dbField.fields).map(([subFieldKey, subDbField]) => {
            // TODO: untrue if a db defaultValue is set
            //              const optional = operation === 'Create' && subDbField.mode === 'required' ? '' : '?';
            const optional = '?';
            return `  ${subFieldKey}${optional}: ${prismaType}['${fieldKey}_${subFieldKey}'];`;
          }),
          `  };`,
        ].join('\n');
      }

      // TODO: untrue if a db defaultValue is set
      //        const optional = operation === 'Create' && dbField.mode === 'required' ? '' : '?';
      const optional = '?';
      return `  ${fieldKey}${optional}: ${prismaType}['${fieldKey}'];`;
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
  } = list.graphql.names;
  const listTypeInfoName = `Lists.${listKey}.TypeInfo`;

  // prettier-ignore
  return [
    `export type ${listKey}<Session = any> = import('@keystone-6/core').ListConfig<${listTypeInfoName}<Session>, any>;`,
    `namespace ${listKey} {`,
    `  export type Item = import('${prismaClientPath}').${listKey};`,
    `  export type TypeInfo<Session = any> = {`,
    `    key: '${listKey}';`,
    `    isSingleton: ${list.isSingleton};`,
    `    fields: ${Object.keys(list.fields).map(x => `'${x}'`).join(' | ')}`,
    `    item: Item;`,
    `    inputs: {`,
    `      where: ${list.graphql.isEnabled.query ? whereInputName : 'never'};`,
    `      uniqueWhere: ${list.graphql.isEnabled.query ? whereUniqueInputName : 'never'};`,
    `      create: ${list.graphql.isEnabled.create ? createInputName : 'never'};`,
    `      update: ${list.graphql.isEnabled.update ? updateInputName : 'never'};`,
    `      orderBy: ${list.graphql.isEnabled.query ? listOrderName : 'never'};`,
    `    };`,
    `    prisma: {`,
    `      create: ${list.graphql.isEnabled.create ? `Resolved${createInputName}` : 'never'};`,
    `      update: ${list.graphql.isEnabled.update ? `Resolved${updateInputName}` : 'never'};`,
    `    };`,
    `    all: __TypeInfo<Session>;`,
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
  prismaClientPath = stringify(prismaClientPath).replace(/'/g, `\\'`);

  for (const [listKey, list] of Object.entries(lists)) {
    const listTypeInfoName = `Lists.${listKey}.TypeInfo`;

    if (list.graphql.isEnabled.create) {
      interimCreateUpdateTypes.push(
        printInterimType(
          prismaClientPath,
          list,
          listKey,
          list.graphql.names.createInputName,
          'Create'
        )
      );
    }

    if (list.graphql.isEnabled.update) {
      interimCreateUpdateTypes.push(
        printInterimType(
          prismaClientPath,
          list,
          listKey,
          list.graphql.names.updateInputName,
          'Update'
        )
      );
    }

    listsTypeInfo.push(`    readonly ${listKey}: ${listTypeInfoName};`);
    listsNamespaces.push(printListTypeInfo(prismaClientPath, listKey, list));
  }

  return [
    '/* eslint-disable */',
    '',
    printInputTypesFromSchema(graphQLSchema, {
      ID: 'string',
      Boolean: 'boolean',
      String: 'string',
      Int: 'number',
      Float: 'number',
      JSON: `import('@keystone-6/core/types').JSONValue`,
      Decimal: `import('@keystone-6/core/types').Decimal | string`,
    }),
    '',
    interimCreateUpdateTypes.join('\n\n'),
    '',
    'export declare namespace Lists {',
    ...listsNamespaces,
    '}',
    `export type Context<Session = any> = import('@keystone-6/core/types').KeystoneContext<TypeInfo<Session>>;`,
    `export type Config<Session = any> = import('@keystone-6/core/types').KeystoneConfig<TypeInfo<Session>>;`,
    '',
    'export type TypeInfo<Session = any> = {',
    `  lists: {`,
    ...listsTypeInfo,
    `  };`,
    `  prisma: import('${prismaClientPath}').PrismaClient;`,
    `  session: Session;`,
    `};`,
    ``,
    // we need to reference the `TypeInfo` above in another type that is also called `TypeInfo`
    `type __TypeInfo<Session = any> = TypeInfo<Session>;`,
    ``,
    `export type Lists<Session = any> = {`,
    `  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo<Session>['lists'][Key], any>`,
    `} & Record<string, import('@keystone-6/core').ListConfig<any, any>>;`,
    ``,
    `export {}`,
    ``,
  ].join('\n');
}
