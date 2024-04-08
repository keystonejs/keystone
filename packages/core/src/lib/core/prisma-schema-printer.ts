import {
  type ScalarDBField,
  type ScalarDBFieldDefault
} from '../../types'
import { type ResolvedDBField } from './resolve-relationships'
import { type InitialisedList } from './initialise-lists'
import {
  type __ResolvedKeystoneConfig
} from '../../types'
import { areArraysEqual, getDBFieldKeyForFieldOnMultiField } from './utils'

const modifiers = {
  required: '',
  optional: '?',
  many: '[]',
}

function printIndex (fieldPath: string, index: undefined | 'index' | 'unique') {
  return {
    none: '',
    unique: '@unique',
    index: `\n@@index([${fieldPath}])`,
  }[index ?? ('none' as const)]
}

function printNativeType (nativeType: string | undefined, datasourceName: string) {
  return nativeType === undefined ? '' : ` @${datasourceName}.${nativeType}`
}

function printScalarDefaultValue (defaultValue: ScalarDBFieldDefault) {
  if (defaultValue.kind === 'literal') {
    if (typeof defaultValue.value === 'string') {
      return ` @default(${JSON.stringify(defaultValue.value)})`
    }
    return ` @default(${defaultValue.value.toString()})`
  }
  if (
    defaultValue.kind === 'now' ||
    defaultValue.kind === 'autoincrement' ||
    defaultValue.kind === 'cuid' ||
    defaultValue.kind === 'uuid'
  ) {
    return ` @default(${defaultValue.kind}())`
  }
  if (defaultValue.kind === 'dbgenerated') {
    return ` @default(dbgenerated(${JSON.stringify(defaultValue.value)}))`
  }
  return ''
}

function assertNever (arg: never): never {
  throw new Error(`expected to never be called but was called with ${arg}`)
}

function printField (
  fieldPath: string,
  field: Exclude<ResolvedDBField, { kind: 'none' }>,
  datasourceName: string,
  lists: Record<string, InitialisedList>
): string {
  if (field.kind === 'scalar') {
    const nativeType = printNativeType(field.nativeType, datasourceName)
    const index = printIndex(fieldPath, field.index)

    const defaultValue = field.default ? printScalarDefaultValue(field.default) : ''
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : ''
    const updatedAt = field.updatedAt ? ' @updatedAt' : ''
    return `${fieldPath} ${field.scalar}${modifiers[field.mode]}${updatedAt}${nativeType}${defaultValue}${map}${index}`
  }

  if (field.kind === 'enum') {
    const index = printIndex(fieldPath, field.index)
    const defaultValue = field.default ? ` @default(${field.default.value})` : ''
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : ''
    return `${fieldPath} ${field.name}${modifiers[field.mode]}${defaultValue}${map}${index}`
  }

  if (field.kind === 'multi') {
    return Object.entries(field.fields)
      .map(([subField, field]) =>
        printField(
          getDBFieldKeyForFieldOnMultiField(fieldPath, subField),
          field,
          datasourceName,
          lists
        )
      )
      .join('\n')
  }

  if (field.kind === 'relation') {
    if (field.mode === 'many') return `${fieldPath} ${field.list}[] @relation("${field.relationName}")`
    if (field.foreignIdField.kind === 'none') return `${fieldPath} ${field.list}? @relation("${field.relationName}")`

    const relationIdFieldPath = `${fieldPath}Id`
    const relationField = `${fieldPath} ${field.list}? @relation("${field.relationName}", fields: [${relationIdFieldPath}], references: [id])`

    const foreignList = lists[field.list]
    const foreignIdField = foreignList.resolvedDbFields.id

    assertDbFieldIsValidForIdField(foreignList.listKey, foreignList.isSingleton, foreignIdField)
    const nativeType = printNativeType(foreignIdField.nativeType, datasourceName)

    const foreignIndex = field.foreignIdField.kind === 'owned' ? 'index' : 'unique'
    const index = printIndex(relationIdFieldPath, foreignIndex)
    const relationIdField = `${relationIdFieldPath} ${foreignIdField.scalar}? @map(${JSON.stringify(field.foreignIdField.map)}) ${nativeType}${index}`
    return `${relationField}\n${relationIdField}`
  }
  // TypeScript's control flow analysis doesn't understand that this will never happen without the assertNever
  // (this will still correctly validate if any case is unhandled though)
  return assertNever(field)
}

function collectEnums (lists: Record<string, InitialisedList>) {
  const enums: Record<string, { values: readonly string[], firstDefinedByRef: string }> = {}
  for (const [listKey, { resolvedDbFields }] of Object.entries(lists)) {
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      const fields =
        field.kind === 'multi'
          ? Object.entries(field.fields).map(
              ([key, field]) => [field, `${listKey}.${fieldPath} (sub field ${key})`] as const
            )
          : [[field, `${listKey}.${fieldPath}`] as const]

      for (const [field, ref] of fields) {
        if (field.kind !== 'enum') continue
        const alreadyExistingEnum = enums[field.name]
        if (alreadyExistingEnum === undefined) {
          enums[field.name] = {
            values: field.values,
            firstDefinedByRef: ref,
          }
          continue
        }
        if (!areArraysEqual(alreadyExistingEnum.values, field.values)) {
          throw new Error(
            `The fields ${alreadyExistingEnum.firstDefinedByRef} and ${ref} both specify Prisma schema enums` +
              `with the name ${field.name} but they have different values:\n` +
              `enum from ${alreadyExistingEnum.firstDefinedByRef}:\n${JSON.stringify(
                alreadyExistingEnum.values,
                null,
                2
              )}\n` +
              `enum from ${ref}:\n${JSON.stringify(field.values, null, 2)}`
          )
        }
      }
    }
  }
  return Object.entries(enums)
    .map(([enumName, { values }]) => `enum ${enumName} {\n${values.join('\n')}\n}`)
    .join('\n')
}

function assertDbFieldIsValidForIdField (
  listKey: string,
  isSingleton: boolean,
  field: ResolvedDBField
): asserts field is ScalarDBField<'Int' | 'String', 'required'> {
  if (field.kind !== 'scalar') {
    throw new Error(
      `id fields must be either a String or Int Prisma scalar but the id field for the ${listKey} list is not a scalar`
    )
  }
  // this may be loosened in the future
  if (field.scalar !== 'String' && field.scalar !== 'Int' && field.scalar !== 'BigInt') {
    throw new Error(
      `id fields must be String, Int or BigInt Prisma scalars but the id field for the ${listKey} list is a ${field.scalar} scalar`
    )
  }
  if (field.mode !== 'required') {
    throw new Error(
      `id fields must be a singular required field but the id field for the ${listKey} list is ${
        field.mode === 'many' ? 'a many' : 'an optional'
      } field`
    )
  }
  if (field.index !== undefined) {
    throw new Error(
      `id fields must not specify indexes themselves but the id field for the ${listKey} list specifies an index`
    )
  }
}

export function printPrismaSchema (
  config: __ResolvedKeystoneConfig,
  lists: Record<string, InitialisedList>,
) {
  const {
    prismaClientPath,
    provider,
    extendPrismaSchema: extendPrismaCompleteSchema
  } = config.db

  const prismaSchema = [
    `// This file is automatically generated by Keystone, do not modify it manually.`,
    `// Modify your Keystone config when you want to change this.`,
    ``,
    `datasource ${provider} {`,
    `  url = env("DATABASE_URL")`,
    `  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`,
    `  provider = "${provider}"`,
    `}`,
    ``,
    `generator client {`,
    `  provider = "prisma-client-js"`,
    ...(prismaClientPath === '@prisma/client' ? [] : [`  output = "${prismaClientPath}"`]),
    '}',
  ]

  for (const [
    listKey,
    {
      resolvedDbFields,
      prisma: { mapping, extendPrismaSchema: extendPrismaListSchema },
      isSingleton,
    },
  ] of Object.entries(lists)) {
    const listPrisma = [`model ${listKey} {`]

    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      if (fieldPath === 'id') {
        assertDbFieldIsValidForIdField(listKey, isSingleton, field)
      }

      if (field.kind !== 'none') {
        let fieldPrisma = printField(fieldPath, field, provider, lists)
        if (fieldPath === 'id') {
          fieldPrisma += ' @id'
        }

        listPrisma.push(
          field.extendPrismaSchema ? field.extendPrismaSchema(fieldPrisma) : fieldPrisma
        )
      }
    }

    if (mapping !== undefined) {
      listPrisma.push(`@@map(${JSON.stringify(mapping)})`)
    }

    listPrisma.push('}')
    const listPrismaStr = listPrisma.join('\n')

    prismaSchema.push(
      extendPrismaListSchema ? extendPrismaListSchema(listPrismaStr) : listPrismaStr
    )
  }
  prismaSchema.push(collectEnums(lists))

  const prismaSchemaStr = prismaSchema.join('\n')
  return extendPrismaCompleteSchema?.(prismaSchemaStr) ?? prismaSchemaStr
}
