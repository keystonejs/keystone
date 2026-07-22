import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import type { KeystoneContext } from '@keystone-6/core/types'
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import { booleanVariations, makeName } from './utils2'

function yn(x: boolean) {
  return x ? '1' : '0'
}

function makeOmitName(x: boolean | Record<string, boolean>) {
  return makeName(x, 'OMIT', 'RETAIN')
}

function makeField({
  omit,
}: {
  omit:
    | boolean
    | {
        read: { item: boolean; filter: boolean; order: boolean }
        create: boolean
        update: boolean
      }
}) {
  return [
    `Field_${
      typeof omit === 'boolean'
        ? makeOmitName(omit)
        : [omit.read.item, omit.read.filter, omit.read.order, omit.create, omit.update]
            .map(yn)
            .join('')
    }`,
    text({
      graphql: { omit },
    }),
  ] as const
}

const fieldsMatrix = [
  ...(function* () {
    for (const omit of [false, true]) {
      yield makeField({ omit })
    }

    for (const { read, create, update, filter, order } of booleanVariations([
      'read',
      'create',
      'update',
      'filter',
      'order',
    ])) {
      yield makeField({
        omit: {
          read: { item: read, filter, order },
          create,
          update,
        },
      })
    }
  })(),
]

function makeList({
  fields,
  omit,
  fieldDefaultOmit,
}: {
  fields: typeof fieldsMatrix
  omit:
    | boolean
    | {
        query:
          | boolean
          | {
              one: boolean
              many: boolean
              count: boolean
            }
        create: boolean
        update: boolean
        delete: boolean
      }
  fieldDefaultOmit?:
    | boolean
    | {
        read?: boolean | { item: boolean; filter: boolean; order: boolean }
        create?: boolean
        update?: boolean
      }
}) {
  const query = typeof omit === 'object' ? omit.query : omit
  const queryBits =
    typeof query === 'boolean'
      ? `${yn(query)}${yn(query)}${yn(query)}`
      : `${yn(query.one)}${yn(query.many)}${yn(query.count)}`
  const omitKind =
    typeof omit === 'boolean'
      ? makeOmitName(omit)
      : typeof omit.query === 'boolean'
        ? 'BOOLEAN'
        : 'OBJECT'
  const name__ = `List${fields.length}_${omitKind}_Omit${
    typeof omit !== 'object'
      ? yn(omit)
      : `${queryBits}${[omit.create, omit.update, omit.delete].map(yn).join('')}`
  }`

  return {
    name__,
    access: allowAll,
    fields: Object.fromEntries(fields),
    ...(fieldDefaultOmit !== undefined && {
      fieldDefaults: { graphql: { omit: fieldDefaultOmit } },
    }),
    graphql: {
      plural: name__ + 's',
      omit,
    },
  } as const
}

const listsMatrix = [
  {
    name__: 'List_fieldDefaults_FILTER',
    access: allowAll,
    fields: {
      hidden: text(),
      shown: text({
        graphql: { omit: { read: { item: false, filter: false, order: false } } },
      }),
    },
    fieldDefaults: {
      graphql: {
        omit: { read: { item: false, filter: true, order: false } },
      },
    },
    graphql: {
      plural: 'List_fieldDefaults_FILTERs',
      omit: false,
    },
  },
  {
    name__: 'List_fieldDefaults_BOOLEAN',
    access: allowAll,
    fields: {
      hidden: text(),
      createShown: text({ graphql: { omit: { create: false } } }),
      visible: text({ graphql: { omit: false } }),
    },
    fieldDefaults: { graphql: { omit: true } },
    graphql: {
      plural: 'List_fieldDefaults_BOOLEANs',
      omit: false,
    },
  },
  makeList({
    fields: [],
    omit: {
      query: true,
      create: true,
      update: true,
      delete: true,
    },
  }),
  makeList({
    fields: fieldsMatrix,
    omit: {
      query: { one: true, many: true, count: true },
      create: true,
      update: true,
      delete: true,
    },
  }),
  ...(function* () {
    for (const { one, many, count, create, update, delete: delete_ } of booleanVariations([
      'one',
      'many',
      'count',
      'create',
      'update',
      'delete',
    ])) {
      const omit = {
        query: { one, many, count },
        create,
        update,
        delete: delete_,
      }
      yield makeList({ fields: fieldsMatrix, omit })
      yield makeList({ fields: [], omit })
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
          fields: { name: string }[] | null
          inputFields: { name: string }[] | null
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
            fields: {
              key: string
              isFilterable: boolean
            }[]
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
          inputFields {
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
            fields {
              key
              isFilterable
            }
          }
        }
      }
    }`,
  })

  return {
    queries: data.__schema.queryType.fields.map(x => x.name.toLowerCase()),
    mutations: data.__schema.mutationType.fields.map(x => x.name.toLowerCase()),
    adminMetaLists: data.keystone.adminMeta.lists.map(x => x.key.toLowerCase()),
    adminMetaFieldsByList: Object.fromEntries(
      data.keystone.adminMeta.lists.map(x => [
        x.key.toLowerCase(),
        Object.fromEntries(x.fields.map(f => [f.key.toLowerCase(), f.isFilterable])),
      ])
    ),
    schemaTypes: data.__schema.types.map(x => x.name.toLowerCase()),
    schemaFieldsByType: Object.fromEntries(
      data.__schema.types.map(x => [
        x.name.toLowerCase(),
        (x.fields ?? x.inputFields ?? []).map(f => f.name.toLowerCase()),
      ])
    ),
  }
}

describe(`Omit (${dbProvider})`, () => {
  function testOmit(
    listName_: string,
    d: ReturnType<typeof introspectSchema>,
    expected: {
      type: boolean
      meta: boolean
      one: boolean
      many: boolean
      count: boolean
      create: boolean
      update: boolean
      delete: boolean
    }
  ) {
    const listName = listName_.toLowerCase()
    // RelatedToAll's relationship mutation inputs reference each target's unique where input.
    const hasRelatedToAllReference = dbProvider !== 'mysql' && listName !== 'relatedtoall'
    const hasUniqueWhereInput =
      expected.one ||
      expected.many ||
      expected.update ||
      expected.delete ||
      hasRelatedToAllReference

    if (expected.one)
      test('does have find', async () => assert.ok((await d).queries.includes(listName)))
    if (expected.many)
      test('does have findMany', async () => assert.ok((await d).queries.includes(listName + 's')))
    if (expected.count)
      test('does have count', async () =>
        assert.ok((await d).queries.includes(listName + 'scount')))
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
    if (hasUniqueWhereInput)
      test('does have a unique where input type', async () =>
        assert.ok((await d).schemaTypes.includes(`${listName}whereuniqueinput`)))

    if (!expected.one)
      test('does not have find', async () => assert.ok(!(await d).queries.includes(listName)))
    if (!expected.many)
      test('does not have findMany', async () =>
        assert.ok(!(await d).queries.includes(listName + 's')))
    if (!expected.count)
      test('does not have count', async () =>
        assert.ok(!(await d).queries.includes(listName + 'scount')))
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
    if (!hasUniqueWhereInput)
      test('does not have a unique where input type', async () =>
        assert.ok(!(await d).schemaTypes.includes(`${listName}whereuniqueinput`)))
  }

  const suite = setupTestSuite({
    config: {
      lists: Object.fromEntries(listsMatrix.map(({ name__: __name, ...l }) => [__name, list(l)])),
    },
  })

  const data = suite().then(async ({ context }) => await introspectSchema(context))
  const dataInternal = suite().then(
    async ({ context }) => await introspectSchema(context.internal())
  )
  const dataSudo = suite().then(async ({ context }) => await introspectSchema(context.sudo()))

  for (const l of listsMatrix) {
    const listName = l.name__
    const omit = l.graphql.omit

    // common context is configurable
    describe(`Common context for ${listName}`, () => {
      if (typeof omit === 'boolean') {
        testOmit(listName, data, {
          type: !omit,
          meta: !omit,
          one: !omit,
          many: !omit,
          count: !omit,
          create: !omit,
          update: !omit,
          delete: !omit,
        })

        return
      }

      const query =
        typeof omit.query === 'boolean'
          ? { one: !omit.query, many: !omit.query, count: !omit.query }
          : {
              one: !omit.query.one,
              many: !omit.query.many,
              count: !omit.query.count,
            }
      testOmit(listName, data, {
        type: true,
        // TODO: see create-admin-meta.ts#L102
        meta: query.one || query.many,
        one: query.one,
        many: query.many,
        count: query.count,
        create: !omit.create,
        update: !omit.update,
        delete: !omit.delete,
      })
    })

    // internal context is unaffected by graphql.omit
    describe(`Internal context for ${listName}`, () => {
      testOmit(listName, dataInternal, {
        type: true,
        meta: true,
        one: true,
        many: true,
        count: true,
        create: true,
        update: true,
        delete: true,
      })
    })

    // sudo context is unaffected by graphql.omit
    describe(`Sudo context for ${listName}`, () => {
      testOmit(listName, dataSudo, {
        type: true,
        meta: true,
        one: true,
        many: true,
        count: true,
        create: true,
        update: true,
        delete: true,
      })
    })
  }

  test('fieldDefaults.graphql.omit is overridden by field.graphql.omit', async () => {
    const fields = (await data).adminMetaFieldsByList.list_fielddefaults_filter
    assert.equal(fields.hidden, false)
    assert.equal(fields.shown, true)
  })

  test('normalizes boolean field omission defaults before merging overrides', async () => {
    const schema = await data
    assert.deepEqual(schema.schemaFieldsByType.list_fielddefaults_boolean, ['id', 'visible'])
    assert.deepEqual(schema.schemaFieldsByType.list_fielddefaults_booleancreateinput, [
      'createshown',
      'visible',
    ])
  })
})
