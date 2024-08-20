import {
  type GraphQLNamedType,
  type GraphQLSchema,
  type GraphQLType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  introspectionTypes,
} from 'graphql'
import type { InitialisedList } from './core/initialise-lists'

const introspectionTypesSet = new Set(introspectionTypes)

const SCALARS = {
  ID: 'string',
  Boolean: 'boolean',
  String: 'string',
  Int: 'number',
  Float: 'number',
  JSON: `import('@keystone-6/core/types').JSONValue`,
  Decimal: `import('@keystone-6/core/types').Decimal | string`,
} as const

function stringify (x: string) {
  return JSON.stringify(x).slice(1, -1)
}

function printTypeReference (type: GraphQLType): string {
  if (type instanceof GraphQLNonNull) return printTypeReferenceWithoutNullable(type.ofType)
  return `${printTypeReferenceWithoutNullable(type)} | null`
}

function printTypeReferenceWithoutNullable (
  type: GraphQLNamedType | GraphQLList<GraphQLType>,
): string {
  if (type instanceof GraphQLList) return `ReadonlyArray<${printTypeReference(type.ofType)}> | ${printTypeReference(type.ofType)}`

  const name = type.name
  if (type instanceof GraphQLScalarType) {
    if (name in SCALARS) return SCALARS[name as keyof typeof SCALARS]
    return `any`
  }

  return name
}

function printInterimType<L extends InitialisedList> (
  prismaClientPath: string,
  list: L,
  operation: 'create' | 'update'
) {
  const name = list.prisma.types[`${operation}InputName`]
  const prismaType = `import('${prismaClientPath}').Prisma.${name}`
  return [
    `type Resolved${name} = {`,
    ...Object.entries(list.fields).map(([fieldKey, { dbField }]) => {
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
            //              const optional = operation === 'Create' && subDbField.mode === 'required' ? '' : '?'
            const optional = '?'
            return `  ${subFieldKey}${optional}: ${prismaType}['${fieldKey}_${subFieldKey}']`
          }),
          `  }`,
        ].join('\n')
      }

      // TODO: untrue if a db defaultValue is set
      //        const optional = operation === 'Create' && dbField.mode === 'required' ? '' : '?'
      const optional = '?'
      return `  ${fieldKey}${optional}: ${prismaType}['${fieldKey}']`
    }),
    `}`,
  ].join('\n')
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
    [...(function* () {
      for (const type of Object.values(graphQLSchema.getTypeMap())) {
        // We don't want to print TS types for the built-in GraphQL introspection types
        // they won't be used for anything we want to print here.
        if (introspectionTypesSet.has(type)) continue
        if (type instanceof GraphQLInputObjectType) {
          yield [
            `export type ${type.name} = {`,
            ...(function* () {
              for (const { name, type: type_ } of Object.values(type.getFields())) {
                const maybe = type_ instanceof GraphQLNonNull ? '' : '?'
                yield `  readonly ${name}${maybe}: ${printTypeReference(type_)}`
              }
            })(),
            '}',
          ].join('\n')
          continue
        }

        if (type instanceof GraphQLEnumType) {
          yield [
            `export type ${type.name} =`,
            type
              .getValues()
              .map(x => `  | '${stringify(x.name)}'`)
              .join('\n'),
          ].join('\n')
          continue
        }

        if (type.name === 'Empty') {
          yield `export type Empty = {}`
          continue
        }
      }
    })()].join('\n\n'),
    '',
    // Resolved* types
    ...(function* () {
      for (const list of Object.values(lists)) {
        if (list.graphql.isEnabled.create) yield printInterimType(prismaClientPath, list, 'create')
        if (list.graphql.isEnabled.update) yield printInterimType(prismaClientPath, list, 'update')
      }
    }()),
    '',
    'export declare namespace Lists {',
    ...(function* () {
      for (const [listKey, list] of Object.entries(lists)) {
        const {
          whereInputName,
          whereUniqueInputName,
          createInputName,
          updateInputName,
          listOrderName,
        } = list.prisma.types
        const listTypeInfoName = `Lists.${listKey}.TypeInfo`

        yield [
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
          `      create: ${list.graphql.isEnabled.create ? list.graphql.names.createInputName : 'never'}`,
          `      update: ${list.graphql.isEnabled.update ? list.graphql.names.updateInputName : 'never'}`,
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
