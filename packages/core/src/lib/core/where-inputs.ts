import type { DBField, KeystoneContext } from '../../types/index.ts'
import type { PrismaFilter, UniquePrismaFilter } from '../../types/prisma.ts'
import { userInputError } from './graphql-errors.ts'
import type { InitialisedList } from './initialise-lists.ts'
import { getDBFieldKeyForFieldOnMultiField } from './utils.ts'
import { getUniqueWhereValueInput, isUniqueWhereValue } from './compound-unique.ts'

export type InputFilter = Record<string, any> & {
  _____?: 'input filter'
  AND?: InputFilter[]
  OR?: InputFilter[]
  NOT?: InputFilter[]
}

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' }

export async function resolveUniqueWhereInput(
  inputFilter: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<UniquePrismaFilter> {
  const where: UniquePrismaFilter = {}
  for (const key in inputFilter) {
    const value = inputFilter[key]

    const compound = list.compoundUnique[key]
    if (compound) {
      if (
        value === null ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        Object.keys(value).length !== compound.fields.length ||
        compound.fields.some(fieldKey => !Object.hasOwn(value, fieldKey) || value[fieldKey] == null)
      ) {
        throw userInputError(
          `${list.listKey}.${key} requires every member of the compound selector to be non-null`
        )
      }
      where[compound.prismaKey] = Object.fromEntries(
        await Promise.all(
          compound.fields.map(async fieldKey => {
            const field = list.fields[fieldKey]
            const input = getUniqueWhereValueInput(field)!
            const resolved = input.resolve
              ? await input.resolve(value[fieldKey], context)
              : value[fieldKey]
            if (!isUniqueWhereValue(field, resolved)) {
              throw userInputError(
                `${list.listKey}.${key}.${fieldKey} must resolve to a non-null exact database value`
              )
            }
            return [fieldKey, resolved]
          })
        )
      )
      continue
    }

    const field = list.fields[key]
    const resolver = field.input!.uniqueWhere!.resolve
    if (resolver !== undefined) {
      where[key] = await resolver(value, context)
    } else {
      where[key] = value
    }

    // Prisma relationship predicates use ordinary filters, not nested compound selector keys.
    if (field.dbField.kind === 'relation' && where[key] !== null) {
      const foreignList = list.lists[field.dbField.list]
      const resolved = await resolveUniqueWhereInput(where[key], foreignList, context)
      where[key] = mapUniqueWhereToWhere(resolved, foreignList)
    }
  }

  return where
}

/** Translate resolved unique selectors to equality predicates for access-controlled lookups. */
export function mapUniqueWhereToWhere(uniqueWhere: UniquePrismaFilter, list: InitialisedList) {
  const where: PrismaFilter = {}
  const conditions: PrismaFilter[] = []
  for (const key in uniqueWhere) {
    const compound = list.compoundUnique[key]
    if (compound) {
      // Keep overlapping selectors conjunctive, rather than overwriting a member's predicate.
      for (const fieldKey of compound.fields) {
        conditions.push({ [fieldKey]: { equals: uniqueWhere[key][fieldKey] } })
      }
    } else if (list.fields[key].dbField.kind === 'relation') {
      where[key] = uniqueWhere[key]
    } else {
      where[key] = { equals: uniqueWhere[key] }
    }
  }
  if (conditions.length) where.AND = conditions
  return where
}

export async function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([key, value]) => {
        if (key === 'OR' || key === 'AND' || key === 'NOT') {
          return {
            [key]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, list, context))
            ),
          }
        }

        // we know if there are filters in the input object with the key of a field,
        //   the field must have defined a where input so this non null assertion is okay
        const field = list.fields[key]
        const { dbField } = field

        const resolve = field.input!.where!.resolve
        const ret = resolve
          ? await resolve(
              value,
              context,
              (() => {
                if (dbField.kind !== 'relation') {
                  return undefined as any
                }
                const foreignList = dbField.list
                const whereResolver = (filter: InputFilter) =>
                  resolveWhereInput(filter, list.lists[foreignList], context)

                if (dbField.mode === 'many') {
                  return async () => {
                    if (value === null) {
                      throw userInputError('A many relation filter cannot be set to null')
                    }
                    return Object.fromEntries(
                      await Promise.all(
                        Object.entries(value).map(async ([key, val]) => {
                          if (val === null) {
                            throw userInputError(
                              `The key "${key}" in a many relation filter cannot be set to null`
                            )
                          }
                          return [key, await whereResolver(val as any)]
                        })
                      )
                    )
                  }
                }

                return (value: any) => {
                  if (value === null) return null
                  return whereResolver(value)
                }
              })()
            )
          : value
        if (ret === null) {
          if (dbField.kind === 'multi') {
            // Note: no built-in field types support multi valued database fields *and* filtering.
            // This code path is only relevent to custom fields which fit that criteria.
            throw new Error('multi db fields cannot return null from where input resolvers')
          }
          return { [key]: null }
        }
        return handleOperators(key, dbField, ret)
      })
    ),
  }
}

function handleOperators(fieldKey: string, dbField: DBField, { AND, OR, NOT, ...rest }: any) {
  return {
    AND: AND?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    OR: OR?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    NOT: NOT?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    ...nestWithAppropiateField(fieldKey, dbField, rest),
  }
}

function nestWithAppropiateField(fieldKey: string, dbField: DBField, value: any) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        getDBFieldKeyForFieldOnMultiField(fieldKey, key),
        val,
      ])
    )
  }
  return { [fieldKey]: value }
}
