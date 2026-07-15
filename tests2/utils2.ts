import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

export function makeName(
  value: boolean | Record<string, boolean>,
  trueName: string,
  falseName: string
) {
  if (typeof value === 'boolean') return value ? trueName : falseName
  return Object.entries(value)
    .filter(([_, v]) => v)
    .map(([k]) => {
      if (k === 'unique') return 'x'
      if (k === 'count') return 'n'
      return k.charAt(0)
    })
    .join('')
    .toUpperCase()
}

function makeAccessName(x: boolean | Record<string, boolean>) {
  return makeName(x, 'ALLOW', 'DENY')
}

export function* booleanVariations<const Key extends string>(keys: readonly Key[]) {
  const allFalse = Object.fromEntries(keys.map(key => [key, false])) as Record<Key, boolean>
  const allTrue = Object.fromEntries(keys.map(key => [key, true])) as Record<Key, boolean>

  yield allFalse
  yield allTrue

  // This covers every pair of boolean values without generating all 2^n combinations.
  for (const key of keys) {
    yield { ...allFalse, [key]: true }
    yield { ...allTrue, [key]: false }
  }
}

export function countUniqueItems(items: readonly any[]) {
  return new Set(items.map(item => item.id)).size
}

export function expectEqualItem(l: List, a: any, b: any, keys: string[] = []) {
  assert.notEqual(a, null)
  if ('id' in b) assert.equal(a.id, b.id)
  for (const f of l.fields) {
    if (keys.length && !keys.includes(f.name)) continue
    if (f.expect.read) {
      assert.equal(a[f.name], b[f.name])
    } else {
      assert.equal(a[f.name], null)
    }
  }
}

export function expectEqualItems(
  l: List,
  a: readonly any[],
  b: any[],
  keys: string[] = [],
  sort = true
) {
  assert.notEqual(a, null)
  assert.equal(a.length, b.length)

  // order isn't always guaranteed (we might use `where.id.in`)
  const sorteda = sort ? [...a].sort((x, y) => x.id.localeCompare(y.id)) : a
  const sortedb = sort ? [...b].sort((x, y) => x.id.localeCompare(y.id)) : b

  let i = 0
  for (const xa of sorteda) {
    const xb = sortedb[i++]
    expectEqualItem(l, xa, xb, keys)
  }
}

export function makeWhereUniqueFilter(fields: Field[], seeded: any) {
  return Object.fromEntries(
    fields.map(f => {
      return [f.name, seeded[f.name]]
    })
  )
}

export function makeWhereFilter(
  fields: Field[],
  seeded: Record<string, any> | Record<string, any>[]
): any {
  if (Array.isArray(seeded)) {
    return {
      OR: seeded.map(s => makeWhereFilter(fields, s)),
    }
  }

  return Object.fromEntries(
    fields.map(f => {
      return [f.name, { equals: seeded[f.name] }]
    })
  )
}

export function makeWhereAndFilter(
  fields: Field[],
  seeded: Record<string, any> | Record<string, any>[]
): any {
  if (Array.isArray(seeded)) {
    return {
      OR: seeded.map(s => makeWhereAndFilter(fields, s)),
    }
  }

  return {
    AND: fields.map(f => {
      return {
        [f.name]: { equals: seeded[f.name] },
      }
    }),
  }
}

export function makeFieldEntry({
  access,
  unique,
}: {
  access: {
    read: boolean
    create: boolean
    update: boolean
    filter: boolean
    order: boolean
  }
  unique: boolean
}) {
  const name = `Field_${makeAccessName({ ...access, unique })}` as const
  return {
    name,
    expect: {
      ...access,
      unique,
    },
    access: {
      read: {
        item: access.read ? allowAll : denyAll,
        filter: access.filter ? allowAll : denyAll,
        order: access.order ? allowAll : denyAll,
      },
      create: access.create ? allowAll : denyAll,
      update: access.update ? allowAll : denyAll,
    },
    isIndexed: unique ? 'unique' : false,
    validation: {
      isRequired: unique, // helps with debugging
    },
    defaultValue: unique ? null : `Value_${name}`,
  } as const
}

export function allowFilter() {
  return {
    id: {
      not: null,
    },
  }
}

export function denyFilter() {
  return {
    id: {
      equals: 'never',
    },
  }
}

type FieldEntry = ReturnType<typeof makeFieldEntry>
export type Field = Omit<FieldEntry, 'access'> & {
  access: Partial<FieldEntry['access']>
}
type ListAccessExpectation = {
  type: 'operation' | 'item' | 'filter(b)' | 'filter'
  query: {
    one: boolean
    many: boolean
    count: boolean
  }
  create: boolean
  update: boolean
  delete: boolean
}

export type List = {
  name: string
  expect: ListAccessExpectation
  access: any
  fields: Field[]
  graphql: {
    plural: string
  }
}

export function* makeList({
  prefix = ``,
  access,
  fields,
}: {
  prefix?: string
  access: {
    query: {
      one: boolean
      many: boolean
      count: boolean
    }
    create: boolean
    update: boolean
    delete: boolean
  }
  fields: Field[]
}) {
  const suffix = `${prefix}${makeAccessName({
    ...access.query,
    create: access.create,
    update: access.update,
    delete: access.delete,
  })}`
  const nameO = `List_operation_${suffix}`
  const expect = { type: 'operation' as const, ...access }

  yield {
    name: nameO,
    expect,
    access: {
      operation: {
        query: {
          one: access.query.one ? allowAll : denyAll,
          many: access.query.many ? allowAll : denyAll,
          count: access.query.count ? allowAll : denyAll,
        },
        create: access.create ? allowAll : denyAll,
        update: access.update ? allowAll : denyAll,
        delete: access.delete ? allowAll : denyAll,
      },
      filter: {
        query: allowAll,
        update: allowAll,
        delete: allowAll,
      },
      item: {
        create: allowAll,
        update: allowAll,
        delete: allowAll,
      },
    },
    fields,
    graphql: {
      plural: nameO + 's',
    },
  } as const

  // filter duplicate tests
  if ([access.create, access.update, access.delete].includes(false)) {
    const nameI = `List_item_${suffix}`
    yield {
      name: nameI,
      expect: { type: 'item' as const, ...access },
      access: {
        operation: {
          query: {
            one: access.query.one ? allowAll : denyAll,
            many: access.query.many ? allowAll : denyAll,
            count: access.query.count ? allowAll : denyAll,
          },
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: allowAll,
          update: allowAll,
          delete: allowAll,
        },
        item: {
          create: access.create ? allowAll : denyAll,
          update: access.update ? allowAll : denyAll,
          delete: access.delete ? allowAll : denyAll,
        },
      },
      fields,
      graphql: {
        plural: nameI + 's',
      },
    } as const
  }

  // filter duplicate tests
  if ([access.query.one, access.update, access.delete].includes(false)) {
    const nameFB = `List_filterb_${suffix}`
    yield {
      name: nameFB,
      expect: {
        type: 'filter(b)' as const,
        ...access,
        query: {
          one: access.query.one,
          many: access.query.one,
          count: access.query.one,
        },
      },
      access: {
        operation: {
          query: { one: allowAll, many: allowAll, count: allowAll },
          create: access.create ? allowAll : denyAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: access.query.one ? allowAll : denyAll,
          update: access.update ? allowAll : denyAll,
          delete: access.delete ? allowAll : denyAll,
        },
        item: {
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
      },
      fields,
      graphql: {
        plural: nameFB + 's',
      },
    } as const

    const nameF = `List_filter_${suffix}`
    yield {
      name: nameF,
      expect: {
        type: 'filter' as const,
        ...access,
        query: {
          one: access.query.one,
          many: access.query.one,
          count: access.query.one,
        },
      },
      access: {
        operation: {
          query: { one: allowAll, many: allowAll, count: allowAll },
          create: access.create ? allowAll : denyAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: access.query.one ? allowFilter : denyFilter,
          update: access.update ? allowFilter : denyFilter,
          delete: access.delete ? allowFilter : denyFilter,
        },
        item: {
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
      },
      fields,
      graphql: {
        plural: nameF + 's',
      },
    } as const
  }
}

export function randomCount() {
  // return 1 + randomInt()
  return 6
}

export function randomString() {
  return `foo-${randomUUID()}`
}

export async function seed(l: List, context: any) {
  const data = Object.fromEntries(l.fields.map(f => [f.name, randomString()]))

  // sudo required, as we might not have query/read access
  return (await context.sudo().db[l.name].createOne({ data })) as Record<string, any>
}

export async function seedMany(l: List, context: any) {
  const data = [...Array(randomCount())].map(_ =>
    Object.fromEntries(l.fields.map(f => [f.name, randomString()]))
  )

  // sudo required, as we might not have query/read access
  return (await context.sudo().db[l.name].createMany({ data })) as Record<string, any>[]
}

export function makeItem(
  l: {
    fields: Field[]
  },
  operation: 'create' | 'update'
) {
  return Object.fromEntries(
    l.fields.filter(f => f.expect[operation]).map(f => [f.name, randomString()])
  )
}

export const lists: List[] = [
  ...(function* () {
    const fields = [
      ...(function* () {
        for (const access of booleanVariations(['read', 'create', 'update', 'filter', 'order'])) {
          yield makeFieldEntry({ access, unique: false })
        }
      })(),
    ]

    const fieldsUnique = [
      ...fields,
      ...(function* () {
        for (const access of booleanVariations(['read', 'update', 'filter', 'order'])) {
          yield makeFieldEntry({
            // create must be true, otherwise uniquely constrained fields need create hooks
            access: { ...access, create: true },
            unique: true,
          })
        }
      })(),
    ]

    yield {
      name: 'List_operation_SHARED_QUERY',
      expect: {
        type: 'operation' as const,
        query: { one: true, many: true, count: true },
        create: true,
        update: true,
        delete: true,
      },
      access: {
        operation: {
          query: allowAll,
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: allowAll,
          update: allowAll,
          delete: allowAll,
        },
        item: {
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
      },
      fields,
      graphql: {
        plural: 'List_operation_SHARED_QUERYs',
      },
    } as const

    for (const { one, many, count, create, update, delete: delete_ } of booleanVariations([
      'one',
      'many',
      'count',
      'create',
      'update',
      'delete',
    ])) {
      yield* makeList({
        access: {
          query: { one, many, count },
          create,
          update,
          delete: delete_,
        },
        fields,
      })

      yield* makeList({
        prefix: `UNIQUE_`,
        access: {
          query: { one, many, count },
          create,
          update,
          delete: delete_,
        },
        fields: fieldsUnique,
      })
    }
  })(),
]

export const config = {
  lists: {
    ...Object.fromEntries(
      (function* () {
        for (const l of lists) {
          yield [
            l.name,
            list({
              ...l,
              fields: {
                ...Object.fromEntries(
                  (function* () {
                    for (const { name, expect, ...f } of l.fields) {
                      yield [name, text(f)]
                    }
                  })()
                ),
              },
            }),
          ]
        }
      })()
    ),
  },
}
