import type { DBField, KeystoneContext, QueryOperationKind } from '../../types/index.ts'
import type { PrismaFilter, UniquePrismaFilter } from '../../types/prisma.ts'
import { getQueryOperationAndFilterAccess } from './access-control.ts'
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
  relationshipAccessCache?: RelationshipFilterAccessCache
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
                if (relationshipAccessCache) {
                  // Keep the nested selector shape for custom resolvers. Prisma mapping uses
                  // this access result when it builds the predicate for the returned selector.
                  await getRelationshipFilterAccess(
                    foreignList,
                    context,
                    'one',
                    relationshipAccessCache
                  )
                }
                return resolveUniqueWhereInput(
                  foreignInput,
                  foreignList,
                  context,
                  relationshipAccessCache
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

// caches relationship filter access by list key while resolving a single filter, so a related
// list's access functions run once rather than once per occurrence in the filter.
// Each filter uses the same query kind throughout.
export type RelationshipFilterAccessCache = Map<string, Promise<RelationshipFilterAccess>>

// true: every related item is accessible
// false: no related item is accessible, so unique lookups can skip the query
// a filter: only related items matching it are accessible
export type RelationshipFilterAccess = boolean | PrismaFilter

export function getRelationshipFilterAccess(
  list: InitialisedList,
  context: KeystoneContext,
  kind: QueryOperationKind,
  cache: RelationshipFilterAccessCache
): Promise<RelationshipFilterAccess> {
  let access = cache.get(list.listKey)
  if (!access) {
    access = getQueryOperationAndFilterAccess(list, context, kind)
    cache.set(list.listKey, access)
  }
  return access
}

export function applyRelationshipFilterAccess(
  where: PrismaFilter,
  access: true | PrismaFilter
): PrismaFilter {
  if (access === true) return where
  return { AND: [access, where] }
}

// resolves a user-supplied filter, applying relationship filter access control
export function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  kind: 'many' | 'count'
): Promise<PrismaFilter> {
  return resolveWhereInputWithAccess(inputFilter, list, context, { kind, cache: new Map() })
}

// Access filters are trusted configuration: relationships in them do not apply relationship
// filter access control, which would otherwise recurse into the related list's access filters
export function resolveAccessFilterWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<PrismaFilter> {
  return resolveWhereInputWithAccess(inputFilter, list, context, null)
}

async function resolveWhereInputWithAccess(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  // null skips relationship filter access control
  relationshipAccess: { kind: 'many' | 'count'; cache: RelationshipFilterAccessCache } | null
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([key, value]) => {
        if (key === 'OR' || key === 'AND' || key === 'NOT') {
          return {
            [key]: await Promise.all(
              value.map((value: any) =>
                resolveWhereInputWithAccess(value, list, context, relationshipAccess)
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
                  resolveWhereInputWithAccess(filter, foreignList, context, relationshipAccess)
                // a related list with no accessible items is treated as an access filter matching nothing
                const getAccess = async (): Promise<true | PrismaFilter> => {
                  if (!relationshipAccess) return true
                  const access = await getRelationshipFilterAccess(
                    foreignList,
                    context,
                    relationshipAccess.kind,
                    relationshipAccess.cache
                  )
                  return access === false ? { id: { in: [] } } : access
                }

                if (dbField.mode === 'many') {
                  return async () => {
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
                  const access = await getAccess()
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
