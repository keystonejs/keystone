import { setupTestSuite } from '@keystone-6/api-tests/test-runner'
import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { dbProvider } from '../utils'

function yesNo (x: boolean) {
  if (x === true) return '1'
  if (x === false) return '0'
}

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
  const name = `List_AccessO_${suffix}`

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
      expect: { type: 'filter' as const, ...access },
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

  for (const l of lists) {
    describe(`${l.name}`, () => {
      test(`list.access.${l.expect.type}.query: ${l.expect.query}`, async () => {
        const { context } = suite()
        const id = await seed(l.name, context)

        // query
        const item = await context.query[l.name].findOne({ where: { id } })

        if (l.expect.query) {
          expect(item).not.toBe(null)
          expect(item!.id).toBe(id)
        } else {
          expect(item).toBe(null)
        }
      })

      test(`list.access.${l.expect.type}.query: ${l.expect.query} for counting`, async () => {
        const { context } = suite()
        const id = await seed(l.name, context)

        // query
        const count = await context.query[l.name].count({
          where: {
            id: {
              equals: id
            }
          }
        })

        if (l.expect.query) {
          expect(count).not.toBe(null)
          expect(count).toBe(1)
        } else {
          expect(count).toBe(0)
        }
      })

      test(`list.access.${l.expect.type}.create: ${l.expect.create}`, async () => {
        const { context } = suite()

        // create
        const createPromise = context.query[l.name].createOne({
          data: {},
          query: `id ${l.fields.map(x => x.name).join(' ')}`
        })

        if (l.expect.create) {
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
        } else {
          const error = createPromise.catch(e => e.message)
          await expect(error).resolves.toBe(`Access denied: You cannot create that ${l.name}`)
        }
      })

      test(`list.access.${l.expect.type}.update: ${l.expect.update}`, async () => {
        const { context } = suite()
        const id = await seed(l.name, context)

        // update
        const updatePromise = context.query[l.name].updateOne({
          where: { id },
          data: {},
          query: `id ${l.fields.map(x => x.name).join(' ')}`
        })

        if (l.expect.update) {
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
        } else {
          const error = updatePromise.catch(e => e.message)
          await expect(error).resolves.toBe(`Access denied: You cannot update that ${l.name} - it may not exist`)
        }
      })

      test(`list.access.${l.expect.type}.delete: ${l.expect.delete}`, async () => {
        const { context } = suite()
        const id = await seed(l.name, context)

        // delete
        const deletePromise = context.query[l.name].deleteOne({
          where: { id },
          query: `id ${l.fields.map(x => x.name).join(' ')}`
        })

        if (l.expect.delete) {
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

          // sudo required, as we might not have read
          const item_ = await context.sudo().db[l.name].findOne({ where: { id } })
          expect(item_).toBe(null)
        } else {
          const error = deletePromise.catch(e => e.message)
          await expect(error).resolves.toBe(`Access denied: You cannot delete that ${l.name} - it may not exist`)
        }
      })

      // field operations tests
      for (const f of l.fields) {
        describe(`${f.name}`, () => {
          if (l.expect.query) {
            test(`field.access.read: ${f.expect.read}`, async () => {
              const { context } = suite()
              const id = await seed(l.name, context)

              // test list.access.operations.query
              const queryPromise = context.query[l.name].findOne({
                where: { id },
                query: `id ${f.name}`
              })
              await expect(queryPromise).resolves.not.toBe(null)
              const item = await queryPromise
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

          if (l.expect.create) {
            test(`field.access.create: ${f.expect.create}`, async () => {
              const { context } = suite()

              // test list.access.operations.create
              const createPromise = context.query[l.name].createOne({
                data: {
                  [f.name]: 'foo'
                },
                query: `id ${f.name}`
              })

              // test field.access.create
              if (f.expect.create === false) {
                const error = createPromise.catch(e => e.message)
                await expect(error).resolves.toBe(`Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`)
                return
              }

              await expect(createPromise).resolves.not.toBe(null)
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

              // sudo required, as we might not have read
              const item_ = await context.sudo().db[l.name].findOne({ where: { id: item.id } })
              expect(item_![f.name]).toBe('foo')
            })
          }

          if (l.expect.update) {
            test(`field.access.update: ${f.expect.update}`, async () => {
              const { context } = suite()
              const id = await seed(l.name, context)

              // test list.access.operations.update
              const updatePromise = context.query[l.name].updateOne({
                where: { id },
                data: {
                  [f.name]: 'foo'
                },
                query: `id ${f.name}`
              })

              // test field.access.update
              if (f.expect.update === false) {
                const error = updatePromise.catch(e => e.message)
                await expect(error).resolves.toBe(`Access denied: You cannot update that ${l.name} - you cannot update the fields ["${f.name}"]`)
                return
              }

              await expect(updatePromise).resolves.not.toBe(null)
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
          }
        })
      }
    })
  }
})
