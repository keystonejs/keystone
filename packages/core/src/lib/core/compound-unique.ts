import type { GArg, GInputObjectType, GInputType } from '@graphql-ts/schema'
import { isEnumType, isScalarType } from 'graphql/index.js'
import { Decimal } from 'decimal.js'
import { g } from '../../types/schema/index.ts'
import type { InitialisedField, InitialisedList } from './initialise-lists.ts'

export type CompoundUniqueSelector = {
  fields: string[]
  nullableFields: string[]
  prismaKey: string
  graphqlName: string
  inputType: GInputObjectType<Record<string, GArg<GInputType>>>
}

export function getUniqueWhereValueInput(field: InitialisedField) {
  return field.input?.uniqueWhereValue ?? field.input?.uniqueWhere
}

/** Only structured declarations which generate @@unique can expose compound selectors. */
export function resolveCompoundUniqueSelectors(
  list: InitialisedList,
  typeNames: Set<string>
): Record<string, CompoundUniqueSelector> {
  const selectors: Record<string, CompoundUniqueSelector> = Object.create(null)

  for (const declaration of list.prisma.indexes) {
    if (declaration.kind !== 'unique') continue

    // Unnamed Prisma compound constraints use the ordered Prisma field keys, not @map names.
    const prismaKey = declaration.fields.join('_')
    const graphqlName = prismaKey
    const path = `${list.listKey}.db.unique([${declaration.fields.join(', ')}])`
    const inputName = `${list.graphql.names.whereUniqueInputName}_${graphqlName}`

    // Never overwrite a field selector or another compound selector, even if omitted publicly.
    if (!/^[_A-Za-z][_0-9A-Za-z]*$/.test(graphqlName) || graphqlName.startsWith('__')) {
      throw new Error(`${path}: invalid compound selector name "${graphqlName}"`)
    }
    if (Object.hasOwn(list.fields, graphqlName) || Object.hasOwn(selectors, graphqlName)) {
      throw new Error(
        `${path}: compound selector "${graphqlName}" conflicts with a field or selector`
      )
    }
    if (typeNames.has(inputName)) {
      throw new Error(
        `${path}: compound input type "${inputName}" conflicts with another GraphQL type`
      )
    }
    typeNames.add(inputName)

    const inputFields: Record<string, GArg<GInputType>> = {}
    const nullableFields: string[] = []
    for (const fieldKey of declaration.fields) {
      const field = list.fields[fieldKey]
      const input = getUniqueWhereValueInput(field)

      // Mutation inputs and general filters are not contracts for an exact identity value.
      if (!input) {
        throw new Error(
          `${path}: field "${fieldKey}" must provide input.uniqueWhereValue to support compound selectors`
        )
      }
      if (
        (!isScalarType(input.arg.type) && !isEnumType(input.arg.type)) ||
        input.arg.defaultValue !== undefined
      ) {
        throw new Error(
          `${path}: field "${fieldKey}" must provide a scalar or enum uniqueWhereValue input without a default`
        )
      }

      // Nullable database members are allowed, but a null-containing tuple is not an identity.
      if ('mode' in field.dbField && field.dbField.mode === 'optional')
        nullableFields.push(fieldKey)
      inputFields[fieldKey] = g.arg({ type: g.nonNull(input.arg.type) })
    }

    selectors[graphqlName] = {
      fields: [...declaration.fields],
      nullableFields,
      prismaKey,
      graphqlName,
      inputType: g.inputObject({ name: inputName, fields: inputFields }),
    }
  }
  return selectors
}

/** Reject nulls and filter objects returned by custom exact-value resolvers. */
export function isUniqueWhereValue(field: InitialisedField, value: unknown): boolean {
  const dbField = field.dbField
  if (dbField.kind === 'enum') return typeof value === 'string' && dbField.values.includes(value)
  if (dbField.kind !== 'scalar') return false
  switch (dbField.scalar) {
    case 'String':
      return typeof value === 'string'
    case 'Boolean':
      return typeof value === 'boolean'
    case 'Int':
      return typeof value === 'number' && Number.isInteger(value)
    case 'Float':
      return typeof value === 'number' && Number.isFinite(value)
    case 'BigInt':
      return typeof value === 'bigint'
    case 'DateTime':
      return value instanceof Date && Number.isFinite(value.getTime())
    case 'Decimal':
      return Decimal.isDecimal(value) && value.isFinite()
    case 'Bytes':
      return value instanceof Uint8Array
    default:
      return false
  }
}
