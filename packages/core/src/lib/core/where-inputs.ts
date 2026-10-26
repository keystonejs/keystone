import type { DBField, KeystoneContext } from '../../types/index.ts'
import type { PrismaFilter, UniquePrismaFilter } from '../../types/prisma.ts'
import { getAccessFilters, getOperationQueryAccess } from './access-control.ts'
import { accessDeniedError, userInputError } from './graphql-errors.ts'
import type { InitialisedList } from './initialise-lists.ts'
import { getDBFieldKeyForFieldOnMultiField } from './utils.ts'

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

    const resolver = list.fields[key].input!.uniqueWhere!.resolve
    if (resolver !== undefined) {
      where[key] = await resolver(value, context)
    } else {
      where[key] = value
    }
  }

  return where
}

// Access filters are trusted configuration: resolve them with sudo so relationships in
// the access filter do not recursively invoke relationship filter access control.
export async function getRelationshipFilterAccess(
  list: InitialisedList,
  context: KeystoneContext
): Promise<true | PrismaFilter> {
  if (!(await getOperationQueryAccess(list, context, 'byRelationshipFilter'))) {
    throw accessDeniedError(
      `You cannot filter by relationships to ${list.graphql.names.outputTypeName}`
    )
  }
  const access = await getAccessFilters(list, context, 'query', 'byRelationshipFilter')
  if (access === true) return true
  if (access === false) return { id: { in: [] } }
  return resolveWhereInput(access, list, context.sudo())
}

export function applyRelationshipFilterAccess(
  where: PrismaFilter,
  access: true | PrismaFilter
): PrismaFilter {
  if (access === true) return where
  return { AND: [access, where] }
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
                const foreignList = list.lists[dbField.list]
                const whereResolver = (filter: InputFilter) =>
                  resolveWhereInput(filter, foreignList, context)

                if (dbField.mode === 'many') {
                  return async () => {
                    if (value === null) {
                      throw userInputError('A many relation filter cannot be set to null')
                    }
                    const access = await getRelationshipFilterAccess(foreignList, context)
                    return {
                      AND: await Promise.all(
                        Object.entries(value).map(async ([key, val]) => {
                          if (val === null) {
                            throw userInputError(
                              `The key "${key}" in a many relation filter cannot be set to null`
                            )
                          }
                          const where = await whereResolver(val as any)
                          if (key === 'every' && access !== true) {
                            // Every visible item matches iff no visible item fails.
                            // Keep an explicit tautology: Prisma drops empty objects
                            // inside NOT, which would make every: {} reject items.
                            return {
                              none: applyRelationshipFilterAccess(
                                { NOT: { AND: [{ id: { notIn: [] } }, where] } },
                                access
                              ),
                            }
                          }
                          return { [key]: applyRelationshipFilterAccess(where, access) }
                        })
                      ),
                    }
                  }
                }

                return async (value: any) => {
                  const access = await getRelationshipFilterAccess(foreignList, context)
                  if (value === null) return access === true ? null : { isNot: access }
                  return { is: applyRelationshipFilterAccess(await whereResolver(value), access) }
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
