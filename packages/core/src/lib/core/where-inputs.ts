import {
  type DBField,
  type KeystoneContext,
} from '../../types'
import {
  type PrismaFilter,
  type UniquePrismaFilter,
} from '../../types/prisma'
import { userInputError } from './graphql-errors'
import { type InitialisedList } from './initialise-lists'
import { getDBFieldKeyForFieldOnMultiField } from './utils'

export type InputFilter = Record<string, any> & {
  _____?: 'input filter'
  AND?: InputFilter[]
  OR?: InputFilter[]
  NOT?: InputFilter[]
}

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' }

export async function resolveUniqueWhereInput (
  inputFilter: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<UniquePrismaFilter> {
  const where: UniquePrismaFilter = {}
  for (const key in inputFilter) {
    const value = inputFilter[key]

    const resolver = list.fields[key].input!.uniqueWhere!.resolve
    if (resolver !== undefined) {
      where[key] = await resolver(value, context)
    } else {
      where[key] = value
    }
  }

  return where
}

export async function resolveWhereInput (
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  isAtRootWhere = true
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([key, value]) => {
        if (key === 'OR' || key === 'AND' || key === 'NOT') {
          return {
            [key]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, list, context, false))
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

function handleOperators (fieldKey: string, dbField: DBField, { AND, OR, NOT, ...rest }: any) {
  return {
    AND: AND?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    OR: OR?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    NOT: NOT?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    ...nestWithAppropiateField(fieldKey, dbField, rest),
  }
}

function nestWithAppropiateField (fieldKey: string, dbField: DBField, value: any) {
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
