import { setupTestSuite } from '@keystone-6/api-tests/test-runner'
import { relationship, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { type KeystoneContext } from '@keystone-6/core/types'
import { dbProvider } from './utils'
import ms from 'ms'

jest.setTimeout(ms('20 minutes'))

function yn (x: boolean) {
  return x ? '1' : '0'
}

function makeField ({
  isFilterable,
  isOrderable,
  omit
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
    `Omit${typeof omit !== 'object'
      ? yn(omit)
      : [omit.read, omit.create, omit.update].map(yn).join('')}`
  ].join('')

  return [`Field_${suffix}`, text({
    graphql: { omit },
    isFilterable,
    isOrderable,
  })] as const
}

const fieldsMatrix = [...function* () {
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
}()]

function makeList ({
  fields,
  isFilterable,
  isOrderable,
  omit,
}: {
  fields: typeof fieldsMatrix
  isFilterable: boolean
  isOrderable: boolean
  omit:
    | boolean
    | {
        query: boolean
        create: boolean
        update: boolean
        delete: boolean
      }
}) {
  const prefix = `List${fields.length}_Filt${yn(isFilterable)}_Ord${yn(isOrderable)}` as const
  const __name = `${prefix}_Omit${
    typeof omit !== 'object'
      ? yn(omit)
      : [omit.query, omit.create, omit.update, omit.delete].map(yn).join('')}`

  return {
    __name,
    access: allowAll,
    fields: Object.fromEntries(fields),
    defaultIsFilterable: isFilterable,
    defaultIsOrderable: isOrderable,
    graphql: {
      plural: __name + 's',
      omit,
    },
  } as const
}

const listsMatrix = [...function* () {
  for (const isFilterable of [false, true]) {
    for (const isOrderable of [false, true]) {
      for (const omit of [false, true]) {
        yield makeList({ fields: fieldsMatrix, isFilterable, isOrderable, omit })
      }

      for (const query of [false, true]) {
        for (const create of [false, true]) {
          for (const update of [false, true]) {
            for (const delete_ of [false, true]) {
              yield makeList({
                fields: fieldsMatrix,
                isFilterable,
                isOrderable,
                omit: {
                  query,
                  create,
                  update,
                  delete: delete_,
                },
              })

              yield makeList({
                fields: [],
                isFilterable,
                isOrderable,
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
}()]

// TODO: FIXME: skip for now, MySQL has a limit on the number of indexes
if (dbProvider !== 'mysql') {
  listsMatrix.push({
    __name: 'RelatedToAll',
    access: allowAll,
    fields: Object.fromEntries(function* () {
      for (const l of listsMatrix) {
        // WARNING: if names exceed some length, expect duplicate _AB_unique index errors
        yield [`R${l.__name}_one`, relationship({
          ref: l.__name,
          many: false,
        })] as const

        yield [`R${l.__name}_many`, relationship({
          ref: l.__name,
          many: true,
        })] as const
      }
    }()),
    defaultIsFilterable: true,
    defaultIsOrderable: true,
    graphql: {
      plural: 'RelatedToAlls',
      omit: false
    },
  })
}

async function introspectSchema (context: KeystoneContext) {
  const data = await context.graphql.run<{
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
  }, any>({
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
    }`
  })

  return {
    queries: data.__schema.queryType.fields.map(x => x.name.toLowerCase()),
    mutations: data.__schema.mutationType.fields.map(x => x.name.toLowerCase()),
    adminMetaLists: data.keystone.adminMeta.lists.map(x => x.key.toLowerCase()),
    schemaTypes: data.__schema.types.map(x => x.name.toLowerCase()),
  }
}

describe(`Omit (${dbProvider})`, () => {
  function testOmit (listName_: string, d: ReturnType<typeof introspectSchema>, expected: {
    type: boolean
    meta: boolean
    query: boolean
    create: boolean
    update: boolean
    delete: boolean
  }) {
    const listName = listName_.toLowerCase()

    if (expected.query) test.concurrent('does have find', async () => expect((await d).queries).toContain(listName))
    if (expected.query) test.concurrent('does have findMany', async () => expect((await d).queries).toContain(listName + 's'))
    if (expected.create) test.concurrent('does have create', async () => expect((await d).mutations).toContain(`create${listName}`))
    if (expected.create) test.concurrent('does have createMany', async () => expect((await d).mutations).toContain(`create${listName}s`))
    if (expected.update) test.concurrent('does have update', async () => expect((await d).mutations).toContain(`update${listName}`))
    if (expected.update) test.concurrent('does have updateMany', async () => expect((await d).mutations).toContain(`update${listName}s`))
    if (expected.delete) test.concurrent('does have delete', async () => expect((await d).mutations).toContain(`delete${listName}`))
    if (expected.delete) test.concurrent('does have deleteMany', async () => expect((await d).mutations).toContain(`delete${listName}s`))
    if (expected.meta) test.concurrent('does have an Admin meta list entry', async () => expect((await d).adminMetaLists).toContain(listName))
    if (expected.type) test.concurrent('does have a GraphQL schema type', async () => expect((await d).schemaTypes).toContain(listName))

    if (!expected.query) test.concurrent('does not have find', async () => expect((await d).queries).not.toContain(listName))
    if (!expected.query) test.concurrent('does not have findMany', async () => expect((await d).queries).not.toContain(listName + 's'))
    if (!expected.create) test.concurrent('does not have create', async () => expect((await d).mutations).not.toContain(`create${listName}`))
    if (!expected.create) test.concurrent('does not have createMany', async () => expect((await d).mutations).not.toContain(`create${listName}s`))
    if (!expected.update) test.concurrent('does not have update', async () => expect((await d).mutations).not.toContain(`update${listName}`))
    if (!expected.update) test.concurrent('does not have updateMany', async () => expect((await d).mutations).not.toContain(`update${listName}s`))
    if (!expected.delete) test.concurrent('does not have delete', async () => expect((await d).mutations).not.toContain(`delete${listName}`))
    if (!expected.delete) test.concurrent('does not have deleteMany', async () => expect((await d).mutations).not.toContain(`delete${listName}s`))
    if (!expected.meta) test.concurrent('does not have an Admin meta list entry', async () => expect((await d).adminMetaLists).not.toContain(listName))
    if (!expected.type) test.concurrent('does not have a GraphQL schema type', async () => expect((await d).schemaTypes).not.toContain(listName))
  }

  const suite = setupTestSuite({
    config: {
      lists: Object.fromEntries(listsMatrix.map(({ __name, ...l }) => [__name, list(l)]))
    }
  })

  const data = suite().then(async ({ context }) => await introspectSchema(context))
  const sudoData = suite().then(async ({ context }) => await introspectSchema(context.sudo()))

  for (const l of listsMatrix) {
    const listName = l.__name
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
