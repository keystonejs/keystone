import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { relationship, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import type { KeystoneContext } from '@keystone-6/core/types'
import { setupTestSuite, dbProvider } from './utils'

function yn(x: boolean) {
  return x ? '1' : '0'
}

function makeField({
  isFilterable,
  isOrderable,
  omit,
}: {
  isFilterable: boolean
  isOrderable: boolean
  omit:
    | boolean
    | {
        read: boolean
        create: boolean
        update: boolean
      }
}) {
  const suffix = [
    `Filt${yn(isFilterable)}`,
    `Ord${yn(isOrderable)}`,
    `Omit${
      typeof omit !== 'object' ? yn(omit) : [omit.read, omit.create, omit.update].map(yn).join('')
    }`,
  ].join('')

  return [
    `Field_${suffix}`,
    text({
      graphql: { omit },
      isFilterable,
      isOrderable,
    }),
  ] as const
}

const fieldsMatrix = [
  ...(function* () {
    for (const isFilterable of [false, true]) {
      for (const isOrderable of [false, true]) {
        for (const omit of [false, true]) {
          yield makeField({ isFilterable, isOrderable, omit })
        }

        for (const read of [false, true]) {
          for (const create of [false, true]) {
            for (const update of [false, true]) {
              yield makeField({
                isFilterable,
                isOrderable,
                omit: {
                  read,
                  create,
                  update,
                },
              })
            }
          }
        }
      }
    }
  })(),
]

function makeList({
  fields,
  defaultIsFilterable,
  defaultIsOrderable,
  omit,
}: {
  fields: typeof fieldsMatrix
  defaultIsFilterable: boolean
  defaultIsOrderable: boolean
  omit:
    | boolean
    | {
        query: boolean
        create: boolean
        update: boolean
        delete: boolean
      }
}) {
  const prefix =
    `List${fields.length}_Filt${yn(defaultIsFilterable)}_Ord${yn(defaultIsOrderable)}` as const
  const name__ = `${prefix}_Omit${
    typeof omit !== 'object'
      ? yn(omit)
      : [omit.query, omit.create, omit.update, omit.delete].map(yn).join('')
  }`

  return {
    name__,
    access: allowAll,
    fields: Object.fromEntries(fields),
    defaultIsFilterable,
    defaultIsOrderable,
    graphql: {
      plural: name__ + 's',
      omit,
    },
  } as const
}

const listsMatrix = [
  ...(function* () {
    for (const defaultIsFilterable of [false, true]) {
      for (const defaultIsOrderable of [false, true]) {
        for (const omit of [false, true]) {
          yield makeList({
            fields: fieldsMatrix,
            defaultIsFilterable,
            defaultIsOrderable,
            omit,
          })
        }

        for (const query of [false, true]) {
          for (const create of [false, true]) {
            for (const update of [false, true]) {
              for (const delete_ of [false, true]) {
                yield makeList({
                  fields: fieldsMatrix,
                  defaultIsFilterable,
                  defaultIsOrderable,
                  omit: {
                    query,
                    create,
                    update,
                    delete: delete_,
                  },
                })

                yield makeList({
                  fields: [],
                  defaultIsFilterable,
                  defaultIsOrderable,
                  omit: {
                    query,
                    create,
                    update,
                    delete: delete_,
                  },
                })
              }
            }
          }
        }
      }
    }
  })(),
]

// TODO: FIXME: skip for now, MySQL has a limit on the number of indexes
if (dbProvider !== 'mysql') {
  listsMatrix.push({
    name__: 'RelatedToAll',
    access: allowAll,
    fields: Object.fromEntries(
      (function* () {
        for (const l of listsMatrix) {
          // WARNING: if names exceed some length, expect duplicate _AB_unique index errors
          yield [
            `R${l.name__}_one`,
            relationship({
              ref: l.name__,
              many: false,
            }),
          ] as const

          yield [
            `R${l.name__}_many`,
            relationship({
              ref: l.name__,
              many: true,
            }),
          ] as const
        }
      })()
    ),
    defaultIsFilterable: true,
    defaultIsOrderable: true,
    graphql: {
      plural: 'RelatedToAlls',
      omit: false,
    },
  })
}

async function introspectSchema(context: KeystoneContext) {
  const data = await context.graphql.run<
    {
      __schema: {
        types: {
          name: string
          fields: {
            name: string
          }[]
        }[]
        queryType: {
          fields: {
            name: string
          }[]
        }
        mutationType: {
          fields: {
            name: string
          }[]
        }
      }
      keystone: {
        adminMeta: {
          lists: {
            key: string
          }[]
        }
      }
    },
    any
  >({
    query: `{
      __schema {
        types {
          name
          fields {
            name
          }
        }
        queryType {
          fields {
            name
          }
        }
        mutationType {
          fields {
            name
          }
        }
      }
      keystone {
        adminMeta {
          lists {
            key
          }
        }
      }
    }`,
  })

  return {
    queries: data.__schema.queryType.fields.map(x => x.name.toLowerCase()),
    mutations: data.__schema.mutationType.fields.map(x => x.name.toLowerCase()),
    adminMetaLists: data.keystone.adminMeta.lists.map(x => x.key.toLowerCase()),
    schemaTypes: data.__schema.types.map(x => x.name.toLowerCase()),
  }
}

describe(`Omit (${dbProvider})`, () => {
  function testOmit(
    listName_: string,
    d: ReturnType<typeof introspectSchema>,
    expected: {
      type: boolean
      meta: boolean
      query: boolean
      create: boolean
      update: boolean
      delete: boolean
    }
  ) {
    const listName = listName_.toLowerCase()

    if (expected.query)
      test('does have find', async () => assert.ok((await d).queries.includes(listName)))
    if (expected.query)
      test('does have findMany', async () => assert.ok((await d).queries.includes(listName + 's')))
    if (expected.create)
      test('does have create', async () =>
        assert.ok((await d).mutations.includes(`create${listName}`)))
    if (expected.create)
      test('does have createMany', async () =>
        assert.ok((await d).mutations.includes(`create${listName}s`)))
    if (expected.update)
      test('does have update', async () =>
        assert.ok((await d).mutations.includes(`update${listName}`)))
    if (expected.update)
      test('does have updateMany', async () =>
        assert.ok((await d).mutations.includes(`update${listName}s`)))
    if (expected.delete)
      test('does have delete', async () =>
        assert.ok((await d).mutations.includes(`delete${listName}`)))
    if (expected.delete)
      test('does have deleteMany', async () =>
        assert.ok((await d).mutations.includes(`delete${listName}s`)))
    if (expected.meta)
      test('does have an Admin meta list entry', async () =>
        assert.ok((await d).adminMetaLists.includes(listName)))
    if (expected.type)
      test('does have a GraphQL schema type', async () =>
        assert.ok((await d).schemaTypes.includes(listName)))

    if (!expected.query)
      test('does not have find', async () => assert.ok(!(await d).queries.includes(listName)))
    if (!expected.query)
      test('does not have findMany', async () =>
        assert.ok(!(await d).queries.includes(listName + 's')))
    if (!expected.create)
      test('does not have create', async () =>
        assert.ok(!(await d).mutations.includes(`create${listName}`)))
    if (!expected.create)
      test('does not have createMany', async () =>
        assert.ok(!(await d).mutations.includes(`create${listName}s`)))
    if (!expected.update)
      test('does not have update', async () =>
        assert.ok(!(await d).mutations.includes(`update${listName}`)))
    if (!expected.update)
      test('does not have updateMany', async () =>
        assert.ok(!(await d).mutations.includes(`update${listName}s`)))
    if (!expected.delete)
      test('does not have delete', async () =>
        assert.ok(!(await d).mutations.includes(`delete${listName}`)))
    if (!expected.delete)
      test('does not have deleteMany', async () =>
        assert.ok(!(await d).mutations.includes(`delete${listName}s`)))
    if (!expected.meta)
      test('does not have an Admin meta list entry', async () =>
        assert.ok(!(await d).adminMetaLists.includes(listName)))
    if (!expected.type)
      test('does not have a GraphQL schema type', async () =>
        assert.ok(!(await d).schemaTypes.includes(listName)))
  }

  const suite = setupTestSuite({
    config: {
      lists: Object.fromEntries(listsMatrix.map(({ name__: __name, ...l }) => [__name, list(l)])),
    },
  })

  const data = suite().then(async ({ context }) => await introspectSchema(context))
  const sudoData = suite().then(async ({ context }) => await introspectSchema(context.sudo()))

  for (const l of listsMatrix) {
    const listName = l.name__
    const omit = l.graphql.omit

    // common context is configurable
    describe(`Common context for ${listName}`, () => {
      if (typeof omit === 'boolean') {
        testOmit(listName, data, {
          type: !omit,
          meta: !omit,
          query: !omit,
          create: !omit,
          update: !omit,
          delete: !omit,
        })

        return
      }

      testOmit(listName, data, {
        type: true,
        // TODO: see create-admin-meta.ts#L102
        meta: !omit.query,
        query: !omit.query,
        create: !omit.create,
        update: !omit.update,
        delete: !omit.delete,
      })
    })

    // sudo context has everything, always
    describe(`Sudo context for ${listName}`, () => {
      testOmit(listName, sudoData, {
        type: true,
        meta: true,
        query: true,
        create: true,
        update: true,
        delete: true,
      })
    })
  }
})
