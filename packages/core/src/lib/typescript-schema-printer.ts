import {
  type GraphQLSchema,
  GraphQLScalarType,
  GraphQLEnumType,
  type GraphQLType,
  GraphQLNonNull,
  type GraphQLNamedType,
  GraphQLList,
  GraphQLInputObjectType,
  introspectionTypes,
} from 'graphql'
import type { InitialisedList } from './core/initialise-lists'

const introspectionTypesSet = new Set(introspectionTypes)

function stringify (x: string) {
  return JSON.stringify(x).slice(1, -1)
}

function printEnumTypeDefinition (type: GraphQLEnumType) {
  return [
    `export type ${type.name} =`,
    type
      .getValues()
      .map(x => `  | '${stringify(x.name)}'`)
      .join('\n'),
  ].join('\n')
}

function printTypeReference (type: GraphQLType, scalars: Record<string, string>): string {
  if (type instanceof GraphQLNonNull) {
    return printTypeReferenceWithoutNullable(type.ofType, scalars)
  }
  return `${printTypeReferenceWithoutNullable(type, scalars)} | null`
}

function printTypeReferenceWithoutNullable (
  type: GraphQLNamedType | GraphQLList<GraphQLType>,
  scalars: Record<string, string>
): string {
  if (type instanceof GraphQLList) {
    return `ReadonlyArray<${printTypeReference(type.ofType, scalars)}> | ${printTypeReference(
      type.ofType,
      scalars
    )}`
  }

  const name = type.name
  if (type instanceof GraphQLScalarType) {
    if (scalars[name] === undefined) return 'any'
    return `Scalars['${stringify(name)}']` // TODO: inline?
  }

  return name
}

function printInputObjectTypeDefinition (
  type: GraphQLInputObjectType,
  scalars: Record<string, string>
) {
  return [
    `export type ${type.name} = {`,
    ...Object.values(type.getFields()).map(({ type, defaultValue, name }) => {
      const maybe = type instanceof GraphQLNonNull ? '' : '?'
      return `  readonly ${name}${maybe}: ${printTypeReference(type, scalars)}`
    }),
    '}',
  ].join('\n')
}

function printInputTypesFromSchema (schema: GraphQLSchema, scalars: Record<string, string>) {
  const output = [
    'type Scalars = {',
    ...Object.keys(scalars).map(scalar => `  readonly ${scalar}: ${scalars[scalar]}`),
    '}',
  ]

  for (const type of Object.values(schema.getTypeMap())) {
    // We don't want to print TS types for the built-in GraphQL introspection types
    // they won't be used for anything we want to print here.
    if (introspectionTypesSet.has(type)) continue
    if (type instanceof GraphQLInputObjectType) {
      output.push('', printInputObjectTypeDefinition(type, scalars))
    }
    if (type instanceof GraphQLEnumType) {
      output.push('', printEnumTypeDefinition(type))
    }
  }

  return output.join('\n')
}

function printInterimType<L extends InitialisedList> (
  prismaClientPath: string,
  list: L,
  listKey: string,
  typename: string,
  operation: 'create' | 'update'
) {
  const operationName = {
    'create': 'Create',
    'update': 'Update'
  }[operation]
  const prismaType = `import('${prismaClientPath}').Prisma.${listKey}${operationName}Input`

  return [
    `type Resolved${typename} = {`,
    ...Object.entries(list.fields).map(([fieldKey, field]) => {
      const { dbField } = field
      if (dbField.kind === 'none') return `  ${fieldKey}?: undefined`

      // TODO: this could be elsewhere, maybe id-field.ts
      if (fieldKey === 'id') {
        // autoincrement doesn't support passing an identifier
        if ('default' in dbField) {
          if (dbField.default?.kind === 'autoincrement') {
            return `  id?: undefined`
          }
        }

        // soft-block `id` updates for relationship safety
        if (operation === 'update') return `  id?: undefined`
      }

      if (dbField.kind === 'multi') {
        return [
          `  ${fieldKey}: {`,
          ...Object.entries(dbField.fields).map(([subFieldKey, subDbField]) => {
            // TODO: untrue if a db defaultValue is set
            //              const optional = operation === 'create' && subDbField.mode === 'required' ? '' : '?'
            const optional = '?'
            return `  ${subFieldKey}${optional}: ${prismaType}['${fieldKey}_${subFieldKey}']`
          }),
          `  }`,
        ].join('\n')
      }

      // TODO: untrue if a db defaultValue is set
      //        const optional = operation === 'create' && dbField.mode === 'required' ? '' : '?'
      const optional = field.graphql.isNonNull[operation] ? '' : '?'
      return `  ${fieldKey}${optional}: ${prismaType}['${fieldKey}']`
    }),
    `}`,
  ].join('\n')
}

function printListTypeInfo<L extends InitialisedList> (
  prismaClientPath: string,
  listKey: string,
  list: L
) {
  const {
    whereInputName,
    whereUniqueInputName,
    createInputName,
    updateInputName,
    listOrderName,
  } = list.graphql.names
  const listTypeInfoName = `Lists.${listKey}.TypeInfo`

  return [
    `export type ${listKey}<Session = any> = import('@keystone-6/core').ListConfig<${listTypeInfoName}<Session>>`,
    `namespace ${listKey} {`,
    `  export type Item = import('${prismaClientPath}').${listKey}`,
    `  export type TypeInfo<Session = any> = {`,
    `    key: '${listKey}'`,
    `    isSingleton: ${list.isSingleton}`,
    `    fields: ${Object.keys(list.fields).map(x => `'${x}'`).join(' | ')}`,
    `    item: Item`,
    `    inputs: {`,
    `      where: ${list.graphql.isEnabled.query ? whereInputName : 'never'}`,
    `      uniqueWhere: ${list.graphql.isEnabled.query ? whereUniqueInputName : 'never'}`,
    `      create: ${list.graphql.isEnabled.create ? createInputName : 'never'}`,
    `      update: ${list.graphql.isEnabled.update ? updateInputName : 'never'}`,
    `      orderBy: ${list.graphql.isEnabled.query ? listOrderName : 'never'}`,
    `    }`,
    `    prisma: {`,
    `      create: ${list.graphql.isEnabled.create ? `Resolved${createInputName}` : 'never'}`,
    `      update: ${list.graphql.isEnabled.update ? `Resolved${updateInputName}` : 'never'}`,
    `    }`,
    `    all: __TypeInfo<Session>`,
    `  }`,
    `}`,
  ]
    .map(line => `  ${line}`)
    .join('\n')
}

export function printGeneratedTypes (
  prismaClientPath: string,
  graphQLSchema: GraphQLSchema,
  lists: Record<string, InitialisedList>
) {
  prismaClientPath = stringify(prismaClientPath).replace(/'/g, `\\'`)

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
    ...(function* () {
      for (const [listKey, list] of Object.entries(lists)) {
        if (list.graphql.isEnabled.create) {
          yield printInterimType(
            prismaClientPath,
            list,
            listKey,
            list.graphql.names.createInputName,
            'create'
          )
        }

        if (list.graphql.isEnabled.update) {
          yield printInterimType(
            prismaClientPath,
            list,
            listKey,
            list.graphql.names.updateInputName,
            'update'
          )
        }
      }
    }()),
    '',
    'export declare namespace Lists {',
    ...(function* () {
      for (const [listKey, list] of Object.entries(lists)) {
        yield printListTypeInfo(prismaClientPath, listKey, list)
      }
    })(),
    '}',
    `export type Context<Session = any> = import('@keystone-6/core/types').KeystoneContext<TypeInfo<Session>>`,
    `export type Config<Session = any> = import('@keystone-6/core/types').KeystoneConfig<TypeInfo<Session>>`,
    '',
    'export type TypeInfo<Session = any> = {',
    `  lists: {`,
    ...(function* () {
      for (const listKey in lists) {
        yield `    readonly ${listKey}: Lists.${listKey}.TypeInfo<Session>`
      }
    })(),
    `  }`,
    `  prisma: import('${prismaClientPath}').PrismaClient`,
    `  session: Session`,
    `}`,
    ``,
    // we need to reference the `TypeInfo` above in another type that is also called `TypeInfo`
    `type __TypeInfo<Session = any> = TypeInfo<Session>`,
    ``,
    `export type Lists<Session = any> = {`,
    `  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo<Session>['lists'][Key]>`,
    `} & Record<string, import('@keystone-6/core').ListConfig<any>>`,
    ``,
    `export {}`,
    ``,
  ].join('\n')
}
