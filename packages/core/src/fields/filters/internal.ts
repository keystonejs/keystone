export * as postgresql from './providers/postgresql.ts'
export * as sqlite from './providers/sqlite.ts'
export * as mysql from './providers/mysql.ts'

type EntriesAssumingNoExtraProps<T> = {
  [Key in keyof T]-?: [Key, T[Key]]
}[keyof T][]

const objectEntriesButAssumeNoExtraProperties: <T>(obj: T) => EntriesAssumingNoExtraProps<T> =
  Object.entries as any

type CommonFilter<T> = {
  equals?: T | null
  in?: readonly T[] | null
  notIn?: readonly T[] | null
  lt?: T | null
  lte?: T | null
  gt?: T | null
  gte?: T | null
  contains?: T | null
  startsWith?: T | null
  endsWith?: T | null
  not?: FilterObject<T> | null
}

// `mode` is a postgresql only modifier of the string operators, not a filter operator itself.
//   Every filter object in the prisma schema carries one, including a nested `not`, so read it off each.
type FilterObject<T> = CommonFilter<T> & { mode?: 'default' | 'insensitive' | null }

type FilterMode = 'default' | 'insensitive' | undefined

function internalResolveFilter(
  entries: EntriesAssumingNoExtraProps<CommonFilter<any>>,
  mode: FilterMode
): object {
  const entry = entries.shift()
  if (entry === undefined) return {}
  const [key, val] = entry
  if (val == null) {
    return {
      AND: [{ [key]: val }, internalResolveFilter(entries, mode)],
    }
  }
  switch (key) {
    case 'equals':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
    case 'in':
    case 'contains':
    case 'startsWith':
    case 'endsWith': {
      return {
        AND: [{ [key]: val, mode }, { not: null }, internalResolveFilter(entries, mode)],
      }
    }

    case 'notIn': {
      return {
        AND: [
          {
            NOT: [
              internalResolveFilter(objectEntriesButAssumeNoExtraProperties({ in: val }), mode),
            ],
          },
          internalResolveFilter(entries, mode),
        ],
      }
    }
    case 'not': {
      return {
        AND: [
          {
            NOT: [resolveFilterObject(val, mode)],
          },
          internalResolveFilter(entries, mode),
        ],
      }
    }
  }
}

function resolveFilterObject(filter: FilterObject<any>, inheritedMode: FilterMode): object {
  const { mode, ...operators } = filter
  // a filter object which does not set `mode` inherits the mode of its parent
  return internalResolveFilter(
    objectEntriesButAssumeNoExtraProperties(operators),
    mode ?? inheritedMode
  )
}

export function resolveCommon(val: FilterObject<any> | null) {
  if (val === null) return null
  return resolveFilterObject(val, undefined)
}

export function resolveString(val: FilterObject<string> | null) {
  if (val === null) return null
  return resolveFilterObject(val, undefined)
}
