import type { DBField, KeystoneContext } from '../../types/index.ts'
import type { PrismaFilter, UniquePrismaFilter } from '../../types/prisma.ts'
import { userInputError } from './graphql-errors.ts'
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
  context: KeystoneContext,
  getRelationshipAccess: GetRelationshipFilterAccess
): Promise<UniquePrismaFilter> {
  // an empty unique where, or a null value in one, would select an arbitrary item
  if (Object.keys(inputFilter).length === 0) {
    throw userInputError(
      `At least one key must be passed to ${list.graphql.types.uniqueWhere.name}`
    )
  }
  const where: UniquePrismaFilter = {}
  for (const key in inputFilter) {
    const value = inputFilter[key]
    if (value === null) {
      throw userInputError(
        `The key "${key}" in ${list.graphql.types.uniqueWhere.name} cannot be set to null`
      )
    }
    const { dbField, input } = list.fields[key]
    const resolver = input!.uniqueWhere!.resolve
    const resolved = resolver
      ? await resolver(
          value,
          context,
          dbField.kind === 'relation'
            ? async (foreignInput: UniqueInputFilter) => {
                const foreignList = list.lists[dbField.list]
                const access = await getRelationshipAccess(foreignList)
                const foreignUniqueWhere = await resolveUniqueWhereInput(
                  foreignInput,
                  foreignList,
                  context,
                  getRelationshipAccess
                )
                return accessControlledFilter(
                  mapUniqueWhereToWhere(foreignUniqueWhere, foreignList),
                  access
                )
              }
            : undefined
        )
      : value
    if (resolved == null) {
      throw userInputError(
        `The key "${key}" in ${list.graphql.types.uniqueWhere.name} must resolve to a non-null value`
      )
    }
    where[key] = resolved
  }

  return where
}

export function mapUniqueWhereToWhere(
  uniqueWhere: UniquePrismaFilter,
  list: InitialisedList
): PrismaFilter {
  const where: PrismaFilter = {}
  for (const key in uniqueWhere) {
    // Relationship resolvers return predicates, while scalar resolvers return values.
    where[key] =
      list.fields[key].dbField.kind === 'relation'
        ? { is: uniqueWhere[key] }
        : { equals: uniqueWhere[key] }
  }
  return where
}

export function accessControlledFilter(
  resolvedWhere: PrismaFilter,
  accessFilters: true | PrismaFilter
): PrismaFilter {
  return accessFilters === true ? resolvedWhere : { AND: [resolvedWhere, accessFilters] }
}

export type RelationshipFilterAccess = true | PrismaFilter

// returns the access filter to apply to related items of a list in a relationship filter,
// see relationshipFilterAccess in access-control.ts
export type GetRelationshipFilterAccess = (
  list: InitialisedList
) => Promise<RelationshipFilterAccess>

export const noRelationshipFilterAccess: GetRelationshipFilterAccess = async () => true

// Access filters are trusted configuration: relationships in them do not apply relationship
// filter access control, which would otherwise recurse into the related list's access filters
export function resolveAccessFilterWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<PrismaFilter> {
  return resolveWhereInput(inputFilter, list, context, noRelationshipFilterAccess)
}

// resolves a user-supplied filter, applying relationship filter access control
export async function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  getRelationshipAccess: GetRelationshipFilterAccess
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([key, value]) => {
        if (key === 'OR' || key === 'AND' || key === 'NOT') {
          return {
            [key]: await Promise.all(
              value.map((value: any) =>
                resolveWhereInput(value, list, context, getRelationshipAccess)
              )
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
                  resolveWhereInput(filter, foreignList, context, getRelationshipAccess)
                const getAccess = () => getRelationshipAccess(foreignList)

                if (dbField.mode === 'many') {
                  return async (value: any) => {
                    if (value === null) {
                      throw userInputError('A many relation filter cannot be set to null')
                    }
                    const access = await getAccess()
                    const entries = Object.entries(value)
                    for (const [key, val] of entries) {
                      if (val === null) {
                        throw userInputError(
                          `The key "${key}" in a many relation filter cannot be set to null`
                        )
                      }
                    }
                    return {
                      AND: await Promise.all(
                        entries.map(async ([key, val]) => {
                          const where = await whereResolver(val as any)
                          if (key === 'every' && access !== true) {
                            // Every visible item matches iff no visible item fails.
                            // Keep an explicit tautology: Prisma drops empty objects
                            // inside NOT, which would make every: {} reject items.
                            return {
                              none: accessControlledFilter(
                                { NOT: { AND: [{ id: { notIn: [] } }, where] } },
                                access
                              ),
                            }
                          }
                          return { [key]: accessControlledFilter(where, access) }
                        })
                      ),
                    }
                  }
                }

                return async (value: any) => {
                  const access = await getAccess()
                  if (value === null) return access === true ? null : { isNot: access }
                  return { is: accessControlledFilter(await whereResolver(value), access) }
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
