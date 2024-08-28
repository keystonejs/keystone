import { setupTestSuite } from '@keystone-6/api-tests/test-runner'
import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { dbProvider } from './utils'
import ms from 'ms'

function yesNo (x: boolean) {
  if (x === true) return '1'
  if (x === false) return '0'
}

function random (n = 100) {
  return 1 + (Math.random() * n | 0)
}

jest.setTimeout(ms('20 minutes'))

function makeFieldEntry ({
  access
}: {
  access: {
    read: boolean
    create: boolean
    update: boolean
  }
}) {
  const name = `Field_Access${[access.read, access.create, access.update].map(yesNo).join('')}` as const
  return {
    name,
    expect: access,
    access: {
      read: access.read ? allowAll : denyAll,
      create: access.create ? allowAll : denyAll,
      update: access.update ? allowAll : denyAll
    },
    defaultValue: `Value_${name}`
  }
}

function allowFilter () {
  return {
    id: {
      not: null
    }
  }
}

function denyFilter () {
  return {
    id: {
      equals: 'unknown'
    }
  }
}

function* makeList ({
  access,
  fields
}: {
  access: {
    query: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  fields: ReturnType<typeof makeFieldEntry>[]
}) {
  const suffix = [access.query, access.create, access.update, access.delete].map(yesNo).join('')
  const name = `List_Access_O${suffix}`

  yield {
    name,
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
      }
    },
    fields,
    graphql: {
      plural: name + 's',
    },
  } as const

  // filter duplicate tests
  if ([access.create, access.update, access.delete].includes(false)) {
    const nameI = `List_Access_I${suffix}`
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
        }
      },
      fields,
      graphql: {
        plural: nameI + 's',
      },
    } as const
  }

  // filter duplicate tests
  if ([access.query, access.update, access.delete].includes(false)) {
    const nameFB = `List_Access_FB${suffix}`
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
        }
      },
      fields,
      graphql: {
        plural: nameFB + 's',
      },
    } as const

    const nameF = `List_Access_F${suffix}`
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
        }
      },
      fields,
      graphql: {
        plural: nameF + 's',
      },
    } as const
  }
}

const lists = [...function* () {
  const fields = [...function* () {
    for (const read of [false, true]) {
      for (const create of [false, true]) {
        for (const update of [false, true]) {
          yield makeFieldEntry({
            access: {
              read,
              create,
              update,
            },
          })
        }
      }
    }
  }()]

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
            fields
          })
        }
      }
    }
  }
}()]

describe(`Access (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
      lists: Object.fromEntries(function* () {
        for (const { name, expect, ...l } of lists) {
          yield [name, list({
            ...l,
            fields: Object.fromEntries(function* () {
              for (const { name, expect, ...f } of l.fields) {
                yield [name, text(f)]
              }
            }())
          })]
        }
      }())
    }
  })

  async function seed (listKey: string, context: any) {
    const { id } = await context.sudo().db[listKey].createOne({ data: {} })
    return id as string
  }

  async function seedMany (listKey: string, context: any) {
    const count = random()
    const items = await context.sudo().db[listKey].createMany({
      data: [...Array(count)].map(x => ({})),
    })
    return items.map((x: any) => x.id) as string[]
  }

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    describe(`${l.name}`, () => {
      test.concurrent(`list.access.${l.expect.type}.query: ${l.expect.query}`, async () => {
        const { context } = await suite()
        const id = await seed(l.name, context)

        // test list.access.*.query
        const item = await context.query[l.name].findOne({
          where: { id },
          query: itemQuery
        })

        if (!l.expect.query) {
          expect(item).toBe(null)
          return
        }

        expect(item).not.toBe(null)
        expect(item!.id).toBe(id)

        for (const f of l.fields) {
          expect(item).toHaveProperty(f.name)
          if (f.expect.read) {
            expect(item![f.name]).toBe(f.defaultValue)
          } else {
            expect(item![f.name]).toBe(null)
          }
        }
      })

      test.concurrent(`list.access.${l.expect.type}.query: ${l.expect.query} (findMany)`, async () => {
        const { context } = await suite()
        const ids = await seedMany(l.name, context)

        // test list.access.*.query
        const items = await context.query[l.name].findMany({
          where: {
            id: {
              in: ids
            }
          },
          query: itemQuery
        })

        expect(items).not.toBe(null)
        if (!l.expect.query) {
          expect(items).toEqual([])
          return
        }

        for (const item of items) {
          for (const f of l.fields) {
            expect(item).toHaveProperty(f.name)
            if (f.expect.read) {
              expect(item![f.name]).toBe(f.defaultValue)
            } else {
              expect(item![f.name]).toBe(null)
            }
          }
        }

        expect(items).toHaveLength(ids.length)
        for (const id of ids) {
          expect(items).toContainEqual(expect.objectContaining({ id }))
        }
      })

      test.concurrent(`list.access.${l.expect.type}.query: ${l.expect.query} for counting`, async () => {
        const { context } = await suite()
        const ids = await seedMany(l.name, context)

        // test list.access.*.query
        const count = await context.query[l.name].count({
          where: {
            id: {
              in: ids
            }
          }
        })

        if (l.expect.query) {
          expect(count).not.toBe(null)
          expect(count).toBe(ids.length)
        } else {
          expect(count).toBe(0)
        }
      })

      test.concurrent(`list.access.${l.expect.type}.create: ${l.expect.create}`, async () => {
        const { context } = await suite()

        // test list.access.*.create
        const createPromise = context.query[l.name].createOne({
          data: {},
          query: itemQuery
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
            expect(item![f.name]).toBe(f.defaultValue)
          } else {
            expect(item![f.name]).toBe(null)
          }
        }
      })

      test.concurrent(`list.access.${l.expect.type}.create: ${l.expect.create} (createMany)`, async () => {
        const { context } = await suite()
        const count = random()

        // test list.access.*.create
        const createPromise = context.query[l.name].createMany({
          data: [...Array(count)].map(x => ({})),
          query: itemQuery
        })

        if (!l.expect.create) {
          const error = createPromise.catch((e: any) => e.message)
          expect(await error).toBe(`Access denied: You cannot create that ${l.name}`)
          return
        }

        const items = await createPromise
        expect(items).not.toBe(null)
        expect(items).toHaveLength(count)

        for (const item of items) {
          for (const f of l.fields) {
            expect(item).toHaveProperty(f.name)
            if (f.expect.read) {
              expect(item![f.name]).toBe(f.defaultValue)
            } else {
              expect(item![f.name]).toBe(null)
            }
          }
        }
      })

      test.concurrent(`list.access.${l.expect.type}.update: ${l.expect.update}`, async () => {
        const { context } = await suite()
        const id = await seed(l.name, context)

        // test list.access.*.update
        const updatePromise = context.query[l.name].updateOne({
          where: { id },
          data: {},
          query: itemQuery
        })

        if (!l.expect.update) {
          const error = updatePromise.catch(e => e.message)
          expect(await error).toBe(`Access denied: You cannot update that ${l.name} - it may not exist`)
          return
        }

        const item = await updatePromise
        expect(item).not.toBe(null)
        expect(item.id).not.toBe(null)

        for (const f of l.fields) {
          expect(item).toHaveProperty(f.name)
          if (f.expect.read) {
            expect(item![f.name]).toBe(f.defaultValue)
          } else {
            expect(item![f.name]).toBe(null)
          }
        }
      })

      test.concurrent(`list.access.${l.expect.type}.update: ${l.expect.update} (updateMany)`, async () => {
        const { context } = await suite()
        const ids = await seedMany(l.name, context)

        // test list.access.*.update
        const updatePromise = context.query[l.name].updateMany({
          data: ids.map((id) => ({
            where: {
              id
            },
            data: {}
          })),
          query: itemQuery
        })

        if (!l.expect.update) {
          const error = updatePromise.catch(e => e.message)
          expect(await error).toBe(`Access denied: You cannot update that ${l.name} - it may not exist`)
          return
        }

        const items = await updatePromise
        expect(items).not.toBe(null)
        expect(items).toHaveLength(ids.length)

        for (const item of items) {
          for (const f of l.fields) {
            expect(item).toHaveProperty(f.name)
            if (f.expect.read) {
              expect(item![f.name]).toBe(f.defaultValue)
            } else {
              expect(item![f.name]).toBe(null)
            }
          }
        }
      })

      test.concurrent(`list.access.${l.expect.type}.delete: ${l.expect.delete}`, async () => {
        const { context } = await suite()
        const id = await seed(l.name, context)

        // test list.access.*.delete
        const deletePromise = context.query[l.name].deleteOne({
          where: { id },
          query: itemQuery
        })

        if (!l.expect.delete) {
          const error = deletePromise.catch(e => e.message)
          expect(await error).toBe(`Access denied: You cannot delete that ${l.name} - it may not exist`)

          // sudo required, as we might not have query/read access
          const count = await context.prisma[l.name].count({ where: { id } })
          expect(count).toBe(1)
          return
        }

        const item = await deletePromise
        expect(item).not.toBe(null)
        expect(item!.id).not.toBe(null)

        for (const f of l.fields) {
          expect(item).toHaveProperty(f.name)
          if (f.expect.read) {
            expect(item![f.name]).toBe(f.defaultValue)
          } else {
            expect(item![f.name]).toBe(null)
          }
        }

        // sudo required, as we might not have query/read access
        const count = await context.prisma[l.name].count({ where: { id } })
        expect(count).toBe(0)
      })

      test.concurrent(`list.access.${l.expect.type}.delete: ${l.expect.delete} (deleteMany)`, async () => {
        const { context } = await suite()
        const ids = await seedMany(l.name, context)

        // test list.access.*.delete
        const deletePromise = context.query[l.name].deleteMany({
          where: ids.map((id) => ({
            id
          })),
          query: itemQuery
        })

        if (!l.expect.delete) {
          const error = deletePromise.catch(e => e.message)
          expect(await error).toBe(`Access denied: You cannot delete that ${l.name} - it may not exist`)

          const count = await context.prisma[l.name].count({ where: { id: { in: ids } } })
          expect(count).toBe(ids.length) // unchanged
          return
        }

        const items = await deletePromise
        expect(items).not.toBe(null)
        expect(items).toHaveLength(ids.length)

        for (const item of items) {
          for (const f of l.fields) {
            expect(item).toHaveProperty(f.name)
            if (f.expect.read) {
              expect(item![f.name]).toBe(f.defaultValue)
            } else {
              expect(item![f.name]).toBe(null)
            }
          }
        }

        // sudo required, as we might not have query/read access
        const count = await context.prisma[l.name].count({ where: { id: { in: ids } } })
        expect(count).toBe(0) // changed
      })

      // field operations tests
      for (const f of l.fields) {
        describe(`${f.name}`, () => {
          if (l.expect.query) {
            test.concurrent(`field.access.read: ${f.expect.read}`, async () => {
              const { context } = await suite()
              const id = await seed(l.name, context)

              // test list.access.*.query
              const item = await context.query[l.name].findOne({
                where: { id },
                query: `id ${f.name}`
              })
              expect(item).not.toBe(null)
              expect(item!.id).toBe(id)

              // test field.access.read
              expect(item).toHaveProperty(f.name)
              if (f.expect.read) {
                expect(item![f.name]).toBe(f.defaultValue)
              } else {
                expect(item![f.name]).toBe(null)
              }
            })
          }

          test.concurrent(`field.access.read: ${f.expect.read} (findMany)`, async () => {
            const { context } = await suite()
            const ids = await seedMany(l.name, context)

            // test list.access.*.query
            const items = await context.query[l.name].findMany({
              where: {
                id: {
                  in: ids
                }
              },
              query: `id ${f.name}`
            })

            expect(items).not.toBe(null)
            if (!l.expect.query) {
              expect(items).toEqual([])
              return
            }

            expect(items).toHaveLength(ids.length)
            for (const id of ids) {
              expect(items).toContainEqual(expect.objectContaining({ id }))
            }

            // test field.access.read
            for (const item of items) {
              expect(item).toHaveProperty(f.name)
              if (f.expect.read) {
                expect(item![f.name]).toBe(f.defaultValue)
              } else {
                expect(item![f.name]).toBe(null)
              }
            }
          })

          if (l.expect.create) {
            test.concurrent(`field.access.create: ${f.expect.create}`, async () => {
              const { context } = await suite()

              // test list.access.*.create
              const createPromise = context.query[l.name].createOne({
                data: {
                  [f.name]: 'foo'
                },
                query: `id ${f.name}`
              })

              // test field.access.create
              if (!f.expect.create) {
                const error = createPromise.catch((e: any) => e.message)
                expect(await error).toBe(`Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`)
                return
              }

              expect(await createPromise).not.toBe(null)
              const item = await createPromise
              expect(item).not.toBe(null)
              expect(item.id).not.toBe(null)

              // test field.access.read
              expect(item).toHaveProperty(f.name)
              if (f.expect.read) {
                expect(item![f.name]).toBe('foo')
              } else {
                expect(item![f.name]).toBe(null)
              }

              // sudo required, as we might not have query/read access
              const item_ = await context.sudo().db[l.name].findOne({ where: { id: item.id } })
              expect(item_![f.name]).toBe('foo')
            })

            test.concurrent(`field.access.create: ${f.expect.create} (createMany)`, async () => {
              const { context } = await suite()
              const count = random()

              // test list.access.*.create
              const createPromise = context.query[l.name].createMany({
                data: [...Array(count)].map(x => ({
                  [f.name]: 'foo'
                })),
                query: itemQuery
              })

              // test field.access.create
              if (!f.expect.create) {
                const error = createPromise.catch(e => e.message)
                expect(await error).toBe(`Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`)
                return
              }

              const items = await createPromise
              expect(items).not.toBe(null)
              expect(items).toHaveLength(count)

              // sudo required, as we might not have query/read access
              const items_ = await context.sudo().db[l.name].findMany({
                where: {
                  id: {
                    in: items.map(x => x.id)
                  }
                }
              })

              for (const item of items) {
                // test field.access.read
                expect(item).toHaveProperty(f.name)
                if (f.expect.read) {
                  expect(item![f.name]).toBe('foo')
                } else {
                  expect(item![f.name]).toBe(null)
                  expect(items_.find(x => x.id === item.id)![f.name]).toBe('foo')
                }
              }
            })
          }

          if (l.expect.update) {
            test.concurrent(`field.access.update: ${f.expect.update}`, async () => {
              const { context } = await suite()
              const id = await seed(l.name, context)

              // test list.access.*.update
              const updatePromise = context.query[l.name].updateOne({
                where: { id },
                data: {
                  [f.name]: 'foo'
                },
                query: `id ${f.name}`
              })

              // test field.access.update
              if (!f.expect.update) {
                const error = updatePromise.catch(e => e.message)
                expect(await error).toBe(`Access denied: You cannot update that ${l.name} - you cannot update the fields ["${f.name}"]`)
                return
              }

              expect(await updatePromise).not.toBe(null)
              const item = await updatePromise
              expect(item).not.toBe(null)
              expect(item!.id).toBe(id)

              // test field.access.read
              expect(item).toHaveProperty(f.name)
              if (f.expect.read) {
                expect(item![f.name]).toBe('foo')
              } else {
                expect(item![f.name]).toBe(null)
              }

              // sudo required, as we might not have read
              const item_ = await context.sudo().db[l.name].findOne({ where: { id } })
              expect(item_![f.name]).toBe('foo')
            })

            test.concurrent(`field.access.update: ${f.expect.update} (updateMany)`, async () => {
              const { context } = await suite()
              const ids = await seedMany(l.name, context)

              // test list.access.*.update
              const updatePromise = context.query[l.name].updateMany({
                data: ids.map((id) => ({
                  where: { id },
                  data: {
                    [f.name]: 'foo'
                  },
                })),
                query: `id ${f.name}`
              })

              // test field.access.update
              if (!f.expect.update) {
                const error = updatePromise.catch(e => e.message)
                expect(await error).toBe(`Access denied: You cannot update that ${l.name} - you cannot update the fields ["${f.name}"]`)
                return
              }

              const items = await updatePromise
              expect(items).not.toBe(null)
              expect(items).toHaveLength(ids.length)
              for (const id of ids) {
                expect(items).toContainEqual(expect.objectContaining({ id }))
              }

              // test field.access.read
              for (const item of items) {
                expect(item).toHaveProperty(f.name)
                if (f.expect.read) {
                  expect(item![f.name]).toBe('foo')
                } else {
                  expect(item![f.name]).toBe(null)
                }
              }
            })
          }

          if (l.expect.delete) {
            test.concurrent(`field.access.read: ${f.expect.read} (on delete)`, async () => {
              const { context } = await suite()
              const id = await seed(l.name, context)

              // test list.access.*.delete
              const item = await context.query[l.name].deleteOne({
                where: { id },
                query: `id ${f.name}`
              })
              expect(item).not.toBe(null)
              expect(item!.id).toBe(id)

              // test field.access.read
              expect(item).toHaveProperty(f.name)
              if (f.expect.read) {
                expect(item![f.name]).toBe(f.defaultValue)
              } else {
                expect(item![f.name]).toBe(null)
              }
            })

            test.concurrent(`field.access.read: ${f.expect.read} (on deleteMany)`, async () => {
              const { context } = await suite()
              const ids = await seedMany(l.name, context)

              // test list.access.*.query
              const items = await context.query[l.name].deleteMany({
                where: ids.map((id) => ({
                  id
                })),
                query: `id ${f.name}`
              })

              expect(items).not.toBe(null)
              expect(items).toHaveLength(ids.length)
              for (const id of ids) {
                expect(items).toContainEqual(expect.objectContaining({ id }))
              }

              // test field.access.read
              for (const item of items) {
                expect(item).toHaveProperty(f.name)
                if (f.expect.read) {
                  expect(item![f.name]).toBe(f.defaultValue)
                } else {
                  expect(item![f.name]).toBe(null)
                }
              }
            })
          }
        })
      }
    })
  }
})
