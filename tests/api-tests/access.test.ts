import { setupTestSuite } from '@keystone-6/api-tests/test-runner'
import { randomInt, randomUUID } from 'node:crypto'
import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { dbProvider } from './utils'

function randomString() {
  return `foo-${randomUUID()}`
}

function randomCount() {
  // return 1 + randomInt()
  return 20
}

function expectEqualItem(l: List, a: any, b: any, keys: string[] = []) {
  expect(a).not.toBe(null)
  if ('id' in b) expect(a!.id).toBe(b.id)
  for (const f of l.fields) {
    if (keys.length && !keys.includes(f.name)) continue
    expect(a).toHaveProperty(f.name)

    if (f.expect.read) {
      expect(a![f.name]).toBe(b![f.name])
    } else {
      expect(a![f.name]).toBe(null)
    }
  }
}
function expectEqualItems(l: List, a: readonly any[], b: any[], keys: string[] = [], sort = true) {
  expect(a).not.toBe(null)
  expect(a).toHaveLength(b.length)

  // order isn't always guaranteed (we might use `where.id.in`)
  const sorteda = sort ? [...a].sort((x, y) => x.id.localeCompare(y.id)) : a
  const sortedb = sort ? [...b].sort((x, y) => x.id.localeCompare(y.id)) : b

  let i = 0
  for (const xa of sorteda) {
    const xb = sortedb[i++]
    expectEqualItem(l, xa, xb, keys)
  }
}

function countUniqueItems(items: readonly any[]) {
  return new Set(items.map(item => item.id)).size
}

function makeName(o: Record<string, boolean>) {
  return (
    Object.entries(o)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join('_')
      .toUpperCase() ?? 'DENY_ALL'
  )
}

function makeWhereUniqueFilter(fields: Field[], seeded: any) {
  return Object.fromEntries(
    fields.map(f => {
      return [f.name, seeded[f.name]]
    })
  )
}

function makeWhereFilter(
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

function makeWhereAndFilter(
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

//jest.setTimeout(ms('20 minutes'))

function makeFieldEntry({
  access,
  unique,
}: {
  access: {
    read: boolean
    create: boolean
    update: boolean
    filterable: boolean
  }
  unique: boolean
}) {
  const name = `Field_${makeName({ ...access, unique })}` as const
  return {
    name,
    expect: {
      ...access,
      unique,
    },
    access: {
      read: access.read ? allowAll : denyAll,
      create: access.create ? allowAll : denyAll,
      update: access.update ? allowAll : denyAll,
    },
    isFilterable: access.filterable ? allowAll : denyAll,
    isIndexed: unique ? 'unique' : false,
    validation: {
      isRequired: unique, // helps with debugging
    },
    defaultValue: unique ? null : `Value_${name}`,
  } as const
}

function allowFilter() {
  return {
    id: {
      not: null,
    },
  }
}

function denyFilter() {
  return {
    id: {
      equals: 'never',
    },
  }
}

type Field = ReturnType<typeof makeFieldEntry>
type List = ReturnType<typeof makeList> extends Generator<infer T, any, any> ? T : never

function* makeList({
  prefix = ``,
  access,
  fields,
}: {
  prefix?: string
  access: {
    query: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  fields: Field[]
}) {
  const suffix = `${prefix}${makeName(access)}`
  const nameO = `List_operation_${suffix}`

  yield {
    name: nameO,
    expect: { type: 'operation' as const, ...access },
    access: {
      operation: {
        query: access.query ? allowAll : denyAll,
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
          query: access.query ? allowAll : denyAll,
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
  if ([access.query, access.update, access.delete].includes(false)) {
    const nameFB = `List_filterb_${suffix}`
    yield {
      name: nameFB,
      expect: { type: 'filter(b)' as const, ...access },
      access: {
        operation: {
          query: allowAll,
          create: access.create ? allowAll : denyAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: access.query ? allowAll : denyAll,
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
      expect: { type: 'filter' as const, ...access },
      access: {
        operation: {
          query: allowAll,
          create: access.create ? allowAll : denyAll,
          update: allowAll,
          delete: allowAll,
        },
        filter: {
          query: access.query ? allowFilter : denyFilter,
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

function makeItem(
  l: {
    fields: Field[]
  },
  operation: 'create' | 'update'
) {
  return Object.fromEntries(
    l.fields.filter(f => f.expect[operation]).map(f => [f.name, randomString()])
  )
}

const lists = [
  ...(function* () {
    const fields = [
      ...(function* () {
        for (const read of [false, true]) {
          for (const create of [false, true]) {
            for (const update of [false, true]) {
              for (const filterable of [false, true]) {
                yield makeFieldEntry({
                  access: {
                    read,
                    create,
                    update,
                    filterable,
                  },
                  unique: false,
                })
              }
            }
          }
        }
      })(),
    ]

    const fieldsUnique = [
      ...fields,
      ...(function* () {
        for (const read of [false, true]) {
          for (const create of [/*false */ true]) {
            // only TRUE, otherwise we need create hooks when uniquely constrained
            for (const update of [false, true]) {
              for (const filterable of [false, true]) {
                yield makeFieldEntry({
                  access: {
                    read,
                    create,
                    update,
                    filterable,
                  },
                  unique: true,
                })
              }
            }
          }
        }
      })(),
    ]

    for (const query of [false, true]) {
      for (const create of [false, true]) {
        for (const update of [false, true]) {
          for (const delete_ of [false, true]) {
            yield* makeList({
              access: {
                query,
                create,
                update,
                delete: delete_,
              },
              fields,
            })

            yield* makeList({
              prefix: `UNIQUE_`,
              access: {
                query,
                create,
                update,
                delete: delete_,
              },
              fields: fieldsUnique,
            })
          }
        }
      }
    }
  })(),
]

describe(`Access (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
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
    },
  })()

  async function seed(l: List, context: any) {
    const data = Object.fromEntries(l.fields.map(f => [f.name, randomString()]))

    // sudo required, as we might not have query/read access
    return (await context.sudo().db[l.name].createOne({ data })) as Record<string, any>
  }

  async function seedMany(l: List, context: any) {
    const data = [...Array(randomCount())].map(_ =>
      Object.fromEntries(l.fields.map(f => [f.name, randomString()]))
    )

    // sudo required, as we might not have query/read access
    return (await context.sudo().db[l.name].createMany({ data })) as Record<string, any>[]
  }

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`
    const hasUnique = l.fields.some(f => f.expect.unique)

    describe(`${l.name}`, () => {
      test.concurrent(`query: ${l.expect.query} (findOne)`, async () => {
        const { context } = await suite
        const seeded = await seed(l, context)

        // test list.access.*.query
        const item = await context.query[l.name].findOne({
          where: { id: seeded.id },
          query: itemQuery,
        })

        if (!l.expect.query) {
          expect(item).toBe(null)
          return
        }

        // test field.access.read
        expectEqualItem(l, item, seeded)
      })

      test.concurrent(`query: ${l.expect.query} (findMany)`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const items = await context.query[l.name].findMany({
          where: {
            id: {
              in: seeded.map(s => s.id),
            },
          },
          query: itemQuery,
        })

        if (!l.expect.query) {
          expect(items).toEqual([])
          return
        }

        // test field.access.read
        expectEqualItems(l, items, seeded)
      })

      test.concurrent(`query: ${l.expect.query} for counting`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const count = await context.query[l.name].count({
          where: {
            id: {
              in: seeded.map(s => s.id),
            },
          },
        })

        if (l.expect.query) {
          expect(count).toBe(seeded.length)
        } else {
          expect(count).toBe(0)
        }
      })

      test.concurrent(`create: ${l.expect.create} (createOne)`, async () => {
        const { context } = await suite
        const target = makeItem(l, 'create')

        // test list.access.*.create
        const createPromise = context.query[l.name].createOne({
          data: target,
          query: itemQuery,
        })

        if (!l.expect.create) {
          const error = createPromise.catch((e: any) => e.message)
          expect(await error).toBe(`Access denied: You cannot create that ${l.name}`)
          return
        }

        const item = await createPromise
        expect(item).not.toBe(null)
        expect(item.id).not.toBe(null)

        for (const f of l.fields) {
          expect(item).toHaveProperty(f.name)
          if (f.expect.read) {
            expect(item![f.name]).toBe(target[f.name] ?? f.defaultValue)
          } else {
            expect(item![f.name]).toBe(null)
          }
        }
      })

      test.concurrent(`create: ${l.expect.create} (createMany)`, async () => {
        const { context } = await suite
        const target = [...Array(randomCount())].map(_ => makeItem(l, 'create'))

        // test list.access.*.create
        const createPromise = context.query[l.name].createMany({
          data: target,
          query: itemQuery,
        })

        if (!l.expect.create) {
          const error = createPromise.catch((e: any) => e.message)
          expect(await error).toBe(`Access denied: You cannot create that ${l.name}`)
          return
        }

        const items = await createPromise
        expect(items).not.toBe(null)
        expect(items).toHaveLength(target.length)
        expect(countUniqueItems(items)).toBe(target.length)

        let i = 0
        for (const item of items) {
          for (const f of l.fields) {
            expect(item).toHaveProperty(f.name)
            if (f.expect.read) {
              expect(item![f.name]).toBe(target[i][f.name] ?? f.defaultValue)
            } else {
              expect(item![f.name]).toBe(null)
            }
          }
          ++i
        }
      })

      test.concurrent(`update: ${l.expect.update} (updateOne)`, async () => {
        const { context } = await suite
        const seeded = await seed(l, context)
        const target = makeItem(l, 'update')

        // test list.access.*.update
        const updatePromise = context.query[l.name].updateOne({
          where: { id: seeded.id },
          data: target,
          query: itemQuery,
        })

        if (!l.expect.update) {
          const error = updatePromise.catch(e => e.message)
          expect(await error).toBe(
            `Access denied: You cannot update that ${l.name} - it may not exist`
          )
          return
        }

        const item = await updatePromise
        expectEqualItem(l, item, {
          id: seeded.id,
          ...seeded,
          ...target,
        })
      })

      test.concurrent(`update: ${l.expect.update} (updateMany)`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)
        const target = seeded.map(({ id }) => ({
          where: { id },
          data: makeItem(l, 'update'),
        }))

        // test list.access.*.update
        const updatePromise = context.query[l.name].updateMany({
          data: target,
          query: itemQuery,
        })

        if (!l.expect.update) {
          const error = updatePromise.catch(e => e.message)
          expect(await error).toBe(
            `Access denied: You cannot update that ${l.name} - it may not exist`
          )
          return
        }

        const items = await updatePromise
        expectEqualItems(
          l,
          items,
          target.map((t, i) => ({
            id: t.where.id,
            ...seeded[i],
            ...t.data,
          }))
        )
      })

      test.concurrent(`delete: ${l.expect.delete} (deleteOne)`, async () => {
        const { context } = await suite
        const seeded = await seed(l, context)

        // test list.access.*.delete
        const deletePromise = context.query[l.name].deleteOne({
          where: { id: seeded.id },
          query: itemQuery,
        })

        if (!l.expect.delete) {
          const error = deletePromise.catch(e => e.message)
          expect(await error).toBe(
            `Access denied: You cannot delete that ${l.name} - it may not exist`
          )

          // sudo required, as we might not have query/read access
          const count = await context.prisma[l.name].count({ where: { id: seeded.id } })
          expect(count).toBe(1)
          return
        }

        const item = await deletePromise
        expectEqualItem(l, item, seeded)

        // sudo required, as we might not have query/read access
        const count = await context.prisma[l.name].count({ where: { id: seeded.id } })
        expect(count).toBe(0)
      })

      test.concurrent(`delete: ${l.expect.delete} (deleteMany)`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.delete
        const deletePromise = context.query[l.name].deleteMany({
          where: seeded.map(({ id }) => ({
            id,
          })),
          query: itemQuery,
        })

        if (!l.expect.delete) {
          const error = deletePromise.catch(e => e.message)
          expect(await error).toBe(
            `Access denied: You cannot delete that ${l.name} - it may not exist`
          )

          const count = await context.prisma[l.name].count({
            where: { id: { in: seeded.map(s => s.id) } },
          })
          expect(count).toBe(seeded.length) // unchanged
          return
        }

        const items = await deletePromise
        expectEqualItems(l, items, seeded)

        // sudo required, as we might not have query/read access
        const count = await context.prisma[l.name].count({
          where: { id: { in: seeded.map(s => s.id) } },
        })
        expect(count).toBe(0) // changed
      })

      // field access tests
      for (const f of l.fields) {
        const fieldQuery = `id ${f.name}`

        describe(`${f.name}`, () => {
          test.concurrent(`read: ${f.expect.read} (findOne)`, async () => {
            if (!f.expect.read) return
            const { context } = await suite
            const seeded = await seed(l, context)

            // test list.access.*.query
            const item = await context.query[l.name].findOne({
              where: { id: seeded.id },
              query: fieldQuery,
            })

            if (!l.expect.query) {
              expect(item).toEqual(null)
              return
            }

            // test field.access.read
            expectEqualItem(l, item, seeded, [f.name])
          })

          test.concurrent(`read: ${f.expect.read} (findMany)`, async () => {
            const { context } = await suite
            const seeded = await seedMany(l, context)

            // test list.access.*.query
            const items = await context.query[l.name].findMany({
              where: {
                id: {
                  in: seeded.map(x => x.id),
                },
              },
              query: fieldQuery,
            })

            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            // test field.access.read
            expectEqualItems(l, items, seeded, [f.name])
          })

          if (f.expect.unique) {
            test.concurrent(`filterable: ${f.expect.filterable} (findOne)`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)

              // test list.access.*.query
              const findPromise = context.query[l.name].findOne({
                where: makeWhereUniqueFilter([f], seeded),
                query: itemQuery,
              })

              // access.filter's happen after .filterable
              if (!l.expect.query && l.expect.type !== 'filter') {
                expect(await findPromise).toEqual(null)
                return
              }

              if (!f.expect.filterable) {
                const error = findPromise.catch((e: any) => e.message)
                expect(await error).toMatch(/^Access denied: You cannot filter/)
                return
              }

              // test field.access.read
              const item = await findPromise
              if (!l.expect.query) {
                expect(item).toEqual(null)
                return
              }

              expectEqualItem(l, item, seeded)
            })
          }

          test.concurrent(`filterable: ${f.expect.filterable} (findMany)`, async () => {
            const { context } = await suite
            const seeded = await seedMany(l, context)

            // test list.access.*.query
            const findPromise = context.query[l.name].findMany({
              where: makeWhereFilter([f], seeded),
              query: itemQuery,
            })

            // access.filter's happen after .filterable
            if (!l.expect.query && l.expect.type !== 'filter') {
              expect(await findPromise).toEqual([])
              return
            }

            if (!f.expect.filterable) {
              const error = findPromise.catch((e: any) => e.message)
              expect(await error).toMatch(/^Access denied: You cannot filter/)
              return
            }

            // test field.access.read
            const items = await findPromise
            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            expectEqualItems(l, items, seeded)
          })

          // we tested list create operations previously^, skip
          //   and create operations with unique fields need us to write hooks
          if (l.expect.create && !hasUnique) {
            test.concurrent(`create: ${f.expect.create}`, async () => {
              const { context } = await suite
              const target = { [f.name]: randomString() }

              // test list.access.*.create
              const createPromise = context.query[l.name].createOne({
                data: target,
                query: fieldQuery,
              })

              // test field.access.create
              if (!f.expect.create) {
                const error = createPromise.catch((e: any) => e.message)
                expect(await error).toBe(
                  `Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`
                )
                return
              }

              // test field.access.read
              const item = await createPromise
              expectEqualItem(l, item, target, [f.name])

              // sudo required, as we might not have query/read access
              const item_ = await context.sudo().db[l.name].findOne({ where: { id: item.id } })
              expect(item_![f.name]).toBe(target[f.name])
            })

            test.concurrent(`create: ${f.expect.create} (createMany)`, async () => {
              const { context } = await suite
              const target = [...Array(randomCount())].map(_ => ({ [f.name]: randomString() }))

              // test list.access.*.create
              const createPromise = context.query[l.name].createMany({
                data: target,
                query: fieldQuery,
              })

              // test field.access.create
              if (!f.expect.create) {
                const error = createPromise.catch(e => e.message)
                expect(await error).toBe(
                  `Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`
                )
                return
              }

              const items = await createPromise
              expect(items).not.toBe(null)
              expect(items).toHaveLength(target.length)
              expect(countUniqueItems(items)).toBe(target.length)

              // test field.access.read
              expectEqualItems(l, items, target, [f.name], false)
            })
          }

          // we tested list update operations previously^, skip
          if (l.expect.update) {
            test.concurrent(`update: ${f.expect.update}`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)
              const target = { [f.name]: randomString() }

              // test list.access.*.update
              const updatePromise = context.query[l.name].updateOne({
                where: { id: seeded.id },
                data: target,
                query: fieldQuery,
              })

              // test field.access.update
              if (!f.expect.update) {
                const error = updatePromise.catch(e => e.message)
                expect(await error).toBe(
                  `Access denied: You cannot update that ${l.name} - you cannot update the fields ["${f.name}"]`
                )
                return
              }

              const item = await updatePromise

              // test field.access.read
              expectEqualItem(l, item, target, [f.name])

              // sudo required, as we might not have read
              const item_ = await context.sudo().db[l.name].findOne({ where: { id: seeded.id } })
              expect(item_![f.name]).toBe(target[f.name])
            })

            test.concurrent(`update: ${f.expect.update} (updateMany)`, async () => {
              const { context } = await suite
              const seeded = await seedMany(l, context)
              const target = seeded.map(({ id }) => ({ id, [f.name]: randomString() }))

              // test list.access.*.update
              const updatePromise = context.query[l.name].updateMany({
                data: target.map(({ id, ...data }) => ({
                  where: { id },
                  data,
                })),
                query: fieldQuery,
              })

              // test field.access.update
              if (!f.expect.update) {
                const error = updatePromise.catch(e => e.message)
                expect(await error).toBe(
                  `Access denied: You cannot update that ${l.name} - you cannot update the fields ["${f.name}"]`
                )
                return
              }

              const items = await updatePromise

              // test field.access.read
              expectEqualItems(l, items, target, [f.name])
            })
          }

          // we tested list delete operations previously^, skip
          if (l.expect.delete) {
            test.concurrent(`read: ${f.expect.read} (on delete)`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)

              // test list.access.*.delete
              const item = await context.query[l.name].deleteOne({
                where: { id: seeded.id },
                query: fieldQuery,
              })

              // test field.access.read
              expectEqualItem(l, item, seeded, [f.name])
            })

            test.concurrent(`read: ${f.expect.read} (on deleteMany)`, async () => {
              const { context } = await suite
              const seeded = await seedMany(l, context)

              // test list.access.*.query
              const items = await context.query[l.name].deleteMany({
                where: seeded.map(({ id }) => ({
                  id,
                })),
                query: fieldQuery,
              })

              // test field.access.read
              expectEqualItems(l, items, seeded, [f.name])
            })
          }
        })
      }

      // some testing with N>1 filters
      for (const f1 of l.fields) {
        for (const f2 of l.fields) {
          if (f1 === f2) continue
          if (randomInt(10) < 9) continue

          const fields = [f1, f2]
          const filterable = fields.every(f => f.expect.filterable)
          const unique = fields.every(f => f.expect.unique)
          const label = `filterable: ${filterable}`

          if (unique) {
            test.concurrent(`query: ${l.expect.query}, ${label} (findOne)`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)
              const where = makeWhereUniqueFilter(fields, seeded)

              // test list.access.*.query
              const findPromise = context.query[l.name].findOne({
                where,
                query: itemQuery,
              })

              // access.filter's happen after .filterable
              if (!l.expect.query && l.expect.type !== 'filter') {
                expect(await findPromise).toEqual(null)
                return
              }

              if (!filterable) {
                const error = findPromise.catch((e: any) => e.message)
                expect(await error).toMatch(/^Access denied: You cannot filter/)
                return
              }

              const item = await findPromise
              if (!l.expect.query) {
                expect(item).toEqual(null)
                return
              }

              // test field.access.read
              expectEqualItem(l, item, seeded)
            })
          }

          test.concurrent(`query: ${l.expect.query}, ${label} (findMany, 1)`, async () => {
            const { context } = await suite
            const seeded = await seed(l, context)
            const where = makeWhereFilter(fields, seeded)

            //   for debugging
            // const count = await context.prisma[l.name].count({ where })
            // expect(count).toBe(1)

            // test list.access.*.query
            const findPromise = context.query[l.name].findMany({
              where,
              query: itemQuery,
            })

            // access.filter's happen after .filterable
            if (!l.expect.query && l.expect.type !== 'filter') {
              expect(await findPromise).toEqual([])
              return
            }

            if (!filterable) {
              const error = findPromise.catch((e: any) => e.message)
              expect(await error).toMatch(/^Access denied: You cannot filter/)
              return
            }

            const items = await findPromise
            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            // test field.access.read
            expectEqualItems(l, items, [seeded])
          })

          test.concurrent(`query: ${l.expect.query}, ${label} (findMany, 1 AND)`, async () => {
            const { context } = await suite
            const seeded = await seed(l, context)
            const where = makeWhereAndFilter(fields, seeded)

            // test list.access.*.query
            const findPromise = context.query[l.name].findMany({
              where,
              query: itemQuery,
            })

            // access.filter's happen after .filterable
            if (!l.expect.query && l.expect.type !== 'filter') {
              expect(await findPromise).toEqual([])
              return
            }

            if (!filterable) {
              const error = findPromise.catch((e: any) => e.message)
              expect(await error).toMatch(/^Access denied: You cannot filter/)
              return
            }

            const items = await findPromise
            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            // test field.access.read
            expectEqualItems(l, items, [seeded])
          })

          test.concurrent(`query: ${l.expect.query}, ${label} (findMany, N)`, async () => {
            const { context } = await suite
            const seeded = await seedMany(l, context)
            const where = makeWhereFilter(fields, seeded)

            // test list.access.*.query
            const findPromise = context.query[l.name].findMany({
              where,
              query: itemQuery,
            })

            // access.filter's happen after .filterable
            if (!l.expect.query && l.expect.type !== 'filter') {
              expect(await findPromise).toEqual([])
              return
            }

            if (!filterable) {
              const error = findPromise.catch((e: any) => e.message)
              expect(await error).toMatch(/^Access denied: You cannot filter/)
              return
            }

            const items = await findPromise
            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            // test field.access.read
            expectEqualItems(l, items, seeded)
          })

          const [updatable] = l.fields.filter(f => f.expect.update)
          if (l.expect.update && updatable && unique) {
            const updateQuery = `id ${updatable.name}`

            test.concurrent(`update: ${l.expect.update}, ${label} (updateOne)`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)
              const target = { [updatable.name]: randomString() }

              // test list.access.*.update
              const updatePromise = context.query[l.name].updateOne({
                where: makeWhereUniqueFilter(fields, seeded),
                data: target,
                query: updateQuery,
              })

              // access.filter's happen after .filterable
              if (!l.expect.update && l.expect.type !== 'filter') {
                expect(await updatePromise).toEqual(null)
                return
              }

              if (!filterable) {
                const error = updatePromise.catch((e: any) => e.message)
                expect(await error).toMatch(/^Access denied: You cannot filter/)
                return
              }

              const item = await updatePromise
              if (!l.expect.update) {
                expect(item).toEqual(null)
                return
              }

              expectEqualItem(l, item, target, [updatable.name])
            })

            // TODO: add updateMany
          }

          if (l.expect.delete && unique) {
            test.concurrent(`delete: ${l.expect.delete}, ${label} (deleteOne)`, async () => {
              const { context } = await suite
              const seeded = await seed(l, context)

              // test list.access.*.delete
              const deletePromise = context.query[l.name].deleteOne({
                where: makeWhereUniqueFilter(fields, seeded),
                query: itemQuery,
              })

              // access.filter's happen after .filterable
              if (!l.expect.delete && l.expect.type !== 'filter') {
                expect(await deletePromise).toEqual(null)
                return
              }

              if (!filterable) {
                const error = deletePromise.catch((e: any) => e.message)
                expect(await error).toMatch(/^Access denied: You cannot filter/)
                return
              }

              const item = await deletePromise
              if (!l.expect.delete) {
                expect(item).toEqual(null)
                return
              }

              expectEqualItem(l, item, seeded)
            })

            // TODO: add deleteMany
          }
        }
      }
    })
  }
})
